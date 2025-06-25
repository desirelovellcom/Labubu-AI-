import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    console.error("Missing REPLICATE_API_TOKEN")
    return NextResponse.json({ error: "Server mis-configuration. Contact support." }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const image = formData.get("image") as File | null
    if (!image) {
      return NextResponse.json({ error: "No image supplied" }, { status: 400 })
    }

    // Encode upload as data-URL (Replicate accepts data: URIs)
    const buffer = Buffer.from(await image.arrayBuffer())
    const dataUrl = `data:${image.type};base64,${buffer.toString("base64")}`

    /* 1⃣  Kick off a prediction */
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          image: dataUrl,
          prompt:
            "cute kawaii Labubu character style, big round eyes, pointed ears, pastel colors, adorable expression, toy-like appearance, Pop Mart style figure, soft lighting, high quality, detailed",
          negative_prompt: "realistic, human, photograph, dark, scary, ugly, low quality, blurry",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          strength: 0.8,
        },
      }),
    })

    const startJson = await start.json()
    if (!start.ok) {
      console.error("Replicate start error:", start.status, startJson)
      return NextResponse.json({ error: startJson.detail ?? "Replicate error" }, { status: start.status })
    }

    /* 2⃣  Poll until finished */
    let prediction = startJson
    while (["starting", "processing"].includes(prediction.status)) {
      await new Promise((r) => setTimeout(r, 2000))

      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${token}`, Accept: "application/json" },
      })
      prediction = await poll.json()
      console.log("Polling status:", prediction.status)
    }

    if (prediction.status !== "succeeded") {
      console.error("Replicate failed:", prediction)
      return NextResponse.json({ error: prediction.error ?? "Image generation failed" }, { status: 500 })
    }

    // Success 🎉
    return NextResponse.json({ transformedUrl: prediction.output[0] })
  } catch (e) {
    console.error("Unexpected error:", e)
    return NextResponse.json({ error: "Unexpected server error. Try again later." }, { status: 500 })
  }
}
