"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { aiService } from "@/lib/ai-service"
import type { AlertCategory, SeverityLevel } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationPicker } from "@/components/location-picker"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

export default function SubmitAlertPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as AlertCategory | "",
    severity: "medium" as SeverityLevel,
    location: { lat: 28.6139, lng: 77.209, address: "" },
    image: null as File | null,
  })

  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)

  const handleCategoryChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, category: value === "" ? "" : value as AlertCategory }))
  }, [])

  const handleSeverityChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, severity: value as SeverityLevel }))
  }, [])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }))
  }, [])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }))
  }, [])

  const handleLocationChange = useCallback((location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({ ...prev, location }))
  }, [])

  const handleImageChange = useCallback((image: File | null) => {
    setFormData(prev => ({ ...prev, image }))
  }, [])

  const handleAIAnalysis = async () => {
    setAiAnalyzing(true)
    try {
      let analysisResult = null

      // Analyze text if available
      if (formData.title || formData.description) {
        analysisResult = await aiService.analyzeAlertText(
          formData.title,
          formData.description,
          formData.location.address
        )
      }

      // Analyze image if available
      if (formData.image) {
        const imageUrl = URL.createObjectURL(formData.image)
        const imageAnalysis = await aiService.analyzeImage(imageUrl)
        analysisResult = { ...analysisResult, ...imageAnalysis }
      }

      if (analysisResult) {
        setAiSuggestions({
          category: analysisResult.category,
          severity: analysisResult.severity,
          recommendations: analysisResult.recommendations || [],
          confidence: analysisResult.confidence
        })
      }
    } catch (error) {
      console.error("AI analysis failed:", error)
      setError("AI analysis failed. Please continue with manual entry.")
    } finally {
      setAiAnalyzing(false)
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // For now, allow anonymous submissions
        // You can change this to require authentication
        console.log("[v0] Submitting as anonymous user")
      }

      let imageUrl = null

      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("alert-images")
          .upload(fileName, formData.image)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("alert-images").getPublicUrl(uploadData.path)

        imageUrl = publicUrl
      }

      // Insert alert
      const { error: insertError } = await supabase.from("alerts").insert({
        user_id: user?.id || null,
        title: formData.title,
        description: formData.description,
        category: formData.category === "" ? "other" : formData.category,
        severity: formData.severity,
        location_lat: formData.location.lat,
        location_lng: formData.location.lng,
        location_address: formData.location.address,
        image_url: imageUrl,
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/?success=true")
    } catch (err) {
      console.error("[v0] Error submitting alert:", err)
      setError(err instanceof Error ? err.message : "Failed to submit alert")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <div className="slideshow-container">
          <div className="slide slide-1"></div>
          <div className="slide slide-2"></div>
          <div className="slide slide-3"></div>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 md:gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold">Back to Dashboard</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Return to main alerts view</p>
              </div>
            </Link>
            <div className="text-right">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                📝 Report Alert
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Help your community</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">Report a Disruption</CardTitle>
              <CardDescription className="text-sm">Help your community stay informed about local issues</CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={handleCategoryChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) => setFormData({ ...formData, severity: value as SeverityLevel })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue"
                    rows={4}
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <LocationPicker
                    onLocationSelect={handleLocationChange}
                    initialLocation={formData.location}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  <ImageUpload onImageSelect={handleImageChange} />
                </div>

                {/* AI Analysis Section */}
                {(formData.title || formData.description || formData.image) && (
                  <div className="space-y-3 p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAIAnalysis}
                      disabled={aiAnalyzing}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg text-sm md:text-base"
                    >
                      {aiAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
                          <span className="font-semibold">Analyzing with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span className="font-semibold">✨ Analyze with AI</span>
                        </>
                      )}
                    </Button>
                    {aiSuggestions && (
                      <div className="text-xs md:text-sm bg-white p-3 md:p-4 rounded-lg shadow-md border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full">
                            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-white" />
                          </div>
                          <p className="font-bold text-purple-800">AI Suggestions:</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Category:</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {aiSuggestions.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Severity:</span>
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {aiSuggestions.severity}
                            </span>
                          </div>
                          {aiSuggestions.recommendations?.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Recommendations:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {aiSuggestions.recommendations.map((rec: string, index: number) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {rec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg font-semibold py-3 text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting your alert...
                      </>
                    ) : (
                      <>
                        🚨 Submit Alert
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="px-8 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
