"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Sparkles, Download, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function LabubuTransformer() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [transformedImage, setTransformedImage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setTransformedImage("")
    }
  }

  const transformImage = async () => {
    if (!selectedImage) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)

      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transform image")
      }

      const data = await response.json()
      setTransformedImage(data.transformedUrl)

      toast({
        title: "Transformation complete!",
        description: "Your Labubu version is ready!",
      })
    } catch (error) {
      console.error("Error transforming image:", error)
      toast({
        title: "Transformation failed",
        description: "Please try again with a different image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!transformedImage) return

    try {
      const response = await fetch(transformedImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "labubu-transformation.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Labubu AI Transformer ✨
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your photos into adorable Labubu-style characters! Upload your picture and watch the magic happen.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Photo
              </CardTitle>
              <CardDescription>Choose a clear photo of yourself for the best results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                <Button
                  onClick={transformImage}
                  disabled={!selectedImage || isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Transforming...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Transform to Labubu
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Labubu Transformation
              </CardTitle>
              <CardDescription>Your AI-generated Labubu character will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {transformedImage ? (
                    <img
                      src={transformedImage || "/placeholder.svg"}
                      alt="Labubu Transformation"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your Labubu transformation will appear here</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={downloadImage}
                  disabled={!transformedImage}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Labubu Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">Easy Upload</h3>
              <p className="text-sm text-gray-600">Simply drag and drop or click to upload your photo</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Magic</h3>
              <p className="text-sm text-gray-600">Advanced AI transforms your photo into Labubu style</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">High Quality</h3>
              <p className="text-sm text-gray-600">Download your Labubu transformation in high resolution</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
