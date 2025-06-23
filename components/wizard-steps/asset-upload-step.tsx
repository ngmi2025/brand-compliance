"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  FileImage,
  FileText,
  Video,
  LinkIcon,
  Sparkles,
  CheckCircle,
  Save,
  AlertCircle,
  Info,
  Loader2,
  Zap,
  Database,
} from "lucide-react"
import { MetaAdMockup } from "../meta-ad-mockup"
import { useToast } from "@/hooks/use-toast"
import type { WizardData } from "../compliance-wizard"

interface AssetData {
  staticAds: File[]
  primaryText: string[]
  headlines: string[]
  landingPageUrls: string[]
  mockupScreenshots: File[]
  videoFiles: File[]
  deliveryInstructions: string
}

interface AssetUploadStepProps {
  data: AssetData
  submissionType: string
  wizardData: WizardData // Added to access card info from Step 1
  onUpdate: (data: AssetData) => void
  onNext: () => void
  onPrev: () => void
}

export function AssetUploadStep({ data, submissionType, wizardData, onUpdate, onNext, onPrev }: AssetUploadStepProps) {
  const [formData, setFormData] = useState<AssetData>(data)
  const [dragActive, setDragActive] = useState(false)
  const [primaryTextInput, setPrimaryTextInput] = useState("")
  const [headlineInput, setHeadlineInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [isGeneratingPrimaryText, setIsGeneratingPrimaryText] = useState(false)
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false)
  const [lastPrimaryTextSource, setLastPrimaryTextSource] = useState<"openai" | "fallback" | null>(null)
  const [lastHeadlineSource, setLastHeadlineSource] = useState<"openai" | "fallback" | null>(null)
  const { toast } = useToast()

  // Determine which sections to show based on submission type
  const showStaticAds = ["full-campaign", "new-creative-only", "creative-headline-primary"].includes(submissionType)
  const showPrimaryText = [
    "full-campaign",
    "new-primary-only",
    "headline-primary",
    "creative-headline-primary",
  ].includes(submissionType)
  const showHeadlines = [
    "full-campaign",
    "new-headline-only",
    "headline-primary",
    "creative-headline-primary",
  ].includes(submissionType)
  const showLandingPages = ["full-campaign"].includes(submissionType)
  const showMockups = ["full-campaign", "new-creative-only", "creative-headline-primary"].includes(submissionType)
  const showVideoFiles = ["motion-graphic"].includes(submissionType)
  const showDeliveryInstructions = ["motion-graphic"].includes(submissionType)

  // Show mockup generator if we have the necessary assets
  const showMockupGenerator =
    formData.staticAds.length > 0 && (formData.headlines.length > 0 || formData.primaryText.length > 0)

  // Handler for generating primary text suggestions
  const handlePrimaryTextSuggestion = async () => {
    if (isGeneratingPrimaryText) return

    setIsGeneratingPrimaryText(true)
    try {
      const response = await fetch("/api/suggest-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "primaryText",
          existingContent: formData.primaryText,
          cardInfo: {
            issuer: wizardData?.projectInfo?.issuer || "American Express",
            cardProduct: wizardData?.projectInfo?.cardProduct || "Credit Card",
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.suggestion) {
        setPrimaryTextInput(data.suggestion)
        setLastPrimaryTextSource(data.source || "fallback")

        toast({
          title: data.source === "openai" ? "AI Variation Generated" : "Example Suggestion",
          description:
            data.source === "openai"
              ? formData.primaryText.length > 0
                ? "AI has created a variation based on your existing primary text."
                : "AI has suggested primary text based on successful examples."
              : `Using an example suggestion (${data.reason || "API unavailable"}). Review and click 'Add' if you'd like to use it.`,
          variant: data.source === "openai" ? "default" : "warning",
        })
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error("No suggestion received")
      }
    } catch (error) {
      console.error("Error generating primary text suggestion:", error)
      setLastPrimaryTextSource("fallback")

      // Get a random fallback suggestion
      const fallbackSuggestions = [
        "Experience premium benefits with this exceptional card. Earn rewards on everyday purchases and enjoy exclusive perks designed for your lifestyle. Terms apply.",
        "Elevate your spending with rewards that matter. This premium card offers benefits tailored to your needs and lifestyle preferences. Terms apply.",
        "Unlock a world of possibilities with this premium card. Earn points on purchases and redeem for travel, merchandise, and more. Terms apply.",
      ]
      const fallbackSuggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)]
      setPrimaryTextInput(fallbackSuggestion)

      toast({
        title: "Using Example Suggestion",
        description: `We couldn't connect to the AI service: ${error instanceof Error ? error.message : "Unknown error"}. Using a pre-defined example instead.`,
        variant: "warning",
      })
    } finally {
      setIsGeneratingPrimaryText(false)
    }
  }

  // Handler for generating headline suggestions
  const handleHeadlineSuggestion = async () => {
    if (isGeneratingHeadline) return

    setIsGeneratingHeadline(true)
    try {
      const response = await fetch("/api/suggest-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "headline",
          existingContent: formData.headlines,
          cardInfo: {
            issuer: wizardData?.projectInfo?.issuer || "American Express",
            cardProduct: wizardData?.projectInfo?.cardProduct || "Credit Card",
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.suggestion) {
        setHeadlineInput(data.suggestion)
        setLastHeadlineSource(data.source || "fallback")

        toast({
          title: data.source === "openai" ? "AI Variation Generated" : "Example Suggestion",
          description:
            data.source === "openai"
              ? formData.headlines.length > 0
                ? "AI has created a variation based on your existing headlines."
                : "AI has suggested a headline based on successful examples."
              : `Using an example suggestion (${data.reason || "API unavailable"}). Review and click 'Add' if you'd like to use it.`,
          variant: data.source === "openai" ? "default" : "warning",
        })
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error("No suggestion received")
      }
    } catch (error) {
      console.error("Error generating headline suggestion:", error)
      setLastHeadlineSource("fallback")

      // Get a random fallback suggestion
      const fallbackSuggestions = [
        "Unlock Premium Card Benefits",
        "Elevate Your Rewards Experience",
        "Premium Rewards, Premium Service",
        "Earn More with Every Purchase",
        "The Card That Rewards You More",
      ]
      const fallbackSuggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)]
      setHeadlineInput(fallbackSuggestion)

      toast({
        title: "Using Example Suggestion",
        description: `We couldn't connect to the AI service: ${error instanceof Error ? error.message : "Unknown error"}. Using a pre-defined example instead.`,
        variant: "warning",
      })
    } finally {
      setIsGeneratingHeadline(false)
    }
  }

  const handleDrag = (e: React.DragEvent, fileType: "staticAds" | "mockupScreenshots" | "videoFiles") => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, fileType: "staticAds" | "mockupScreenshots" | "videoFiles") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      const updatedData = { ...formData, [fileType]: [...formData[fileType], ...newFiles] }
      setFormData(updatedData)
      onUpdate(updatedData)
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "staticAds" | "mockupScreenshots" | "videoFiles",
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const updatedData = { ...formData, [fileType]: [...formData[fileType], ...newFiles] }
      setFormData(updatedData)
      onUpdate(updatedData)
    }
  }

  const removeFile = (index: number, fileType: "staticAds" | "mockupScreenshots" | "videoFiles") => {
    const updatedFiles = formData[fileType].filter((_, i) => i !== index)
    const updatedData = { ...formData, [fileType]: updatedFiles }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const addPrimaryText = () => {
    if (primaryTextInput.trim()) {
      const updatedData = { ...formData, primaryText: [...formData.primaryText, primaryTextInput.trim()] }
      setFormData(updatedData)
      onUpdate(updatedData)
      setPrimaryTextInput("")
      setLastPrimaryTextSource(null)
    }
  }

  const removePrimaryText = (index: number) => {
    const updatedTexts = formData.primaryText.filter((_, i) => i !== index)
    const updatedData = { ...formData, primaryText: updatedTexts }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const addHeadline = () => {
    if (headlineInput.trim()) {
      const updatedData = { ...formData, headlines: [...formData.headlines, headlineInput.trim()] }
      setFormData(updatedData)
      onUpdate(updatedData)
      setHeadlineInput("")
      setLastHeadlineSource(null)
    }
  }

  const removeHeadline = (index: number) => {
    const updatedHeadlines = formData.headlines.filter((_, i) => i !== index)
    const updatedData = { ...formData, headlines: updatedHeadlines }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const addUrl = () => {
    if (urlInput.trim()) {
      const updatedData = { ...formData, landingPageUrls: [...formData.landingPageUrls, urlInput.trim()] }
      setFormData(updatedData)
      onUpdate(updatedData)
      setUrlInput("")
    }
  }

  const removeUrl = (index: number) => {
    const updatedUrls = formData.landingPageUrls.filter((_, i) => i !== index)
    const updatedData = { ...formData, landingPageUrls: updatedUrls }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const updateDeliveryInstructions = (value: string) => {
    const updatedData = { ...formData, deliveryInstructions: value }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const handleSaveMockup = (mockupData: any) => {
    if (mockupData.file) {
      const updatedData = {
        ...formData,
        mockupScreenshots: [...formData.mockupScreenshots, mockupData.file],
      }
      setFormData(updatedData)
      onUpdate(updatedData)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <FileImage className="h-5 w-5 text-blue-500" />
    }
    if (file.type.startsWith("video/")) {
      return <Video className="h-5 w-5 text-purple-500" />
    }
    return <FileText className="h-5 w-5 text-slate-500" />
  }

  const loadExampleAd = async () => {
    console.log("Load Example Ad clicked") // Debug line

    // Example primary text options
    const examplePrimaryTexts = [
      "Fuel your mornings with up to $84 per year in statement credits when you use your American Express® Gold Card at U.S. Dunkin' locations. Enrollment required.",
      "That coffee habit? It just got more rewarding. Earn up to $84 per year in statement credits at Dunkin' with the American Express® Gold Card. Enrollment required.",
      "Coffee comes with a side of credits. Earn up to $84 per year in statement credits at U.S. Dunkin' locations with the American Express® Gold Card. Enrollment required.",
    ]

    // Example headlines
    const exampleHeadlines = [
      "The American Express® Gold Card",
      "Monthly Dunkin' Credits? Yes, Please.",
      "Coffee Credits with the Amex Gold Card®",
    ]

    // Example URL
    const exampleUrl = "upgradedpoints.com/amex-gold-card-review/"

    try {
      // Fetch the images directly from the provided URLs
      const imageUrls = [
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TaRVvqEdpe2DLdtJTW8P2cFtKKzEDc.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RBOEfuhYIawdtjVtkBxHHAa0CKAXEP.png",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dTFS3F1ZC9aVDX930JDlMBpOsNgwdJ.png",
      ]

      const imageFiles = await Promise.all(
        imageUrls.map(async (url, index) => {
          const response = await fetch(url)
          const blob = await response.blob()
          return new File([blob], `amex-dunkin-${index + 1}.png`, { type: "image/png" })
        }),
      )

      // Update formData with all the example content at once
      const updatedData = {
        ...formData,
        staticAds: [...formData.staticAds, ...imageFiles],
        primaryText: [...formData.primaryText, ...examplePrimaryTexts],
        headlines: [...formData.headlines, ...exampleHeadlines],
        landingPageUrls: [...formData.landingPageUrls, exampleUrl],
      }

      setFormData(updatedData)
      onUpdate(updatedData)

      console.log("About to show toast") // Debug line

      const toastResult = toast({
        title: "Example Ad Loaded",
        description: "American Express Gold Card Dunkin' promotion has been loaded successfully.",
        variant: "default",
      })

      console.log("Toast result:", toastResult) // Debug line
    } catch (error) {
      console.error("Error in loadExampleAd:", error)
      toast({
        title: "Error Loading Example",
        description: "Failed to load the example ad images. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Check if we have required assets based on submission type
  const hasRequiredAssets = () => {
    if (submissionType === "full-campaign") {
      return (
        formData.staticAds.length > 0 &&
        formData.primaryText.length > 0 &&
        formData.headlines.length > 0 &&
        formData.landingPageUrls.length > 0
      )
    }
    if (submissionType === "creative-headline-primary") {
      return formData.staticAds.length > 0 && formData.primaryText.length > 0 && formData.headlines.length > 0
    }
    if (submissionType === "new-creative-only") {
      return formData.staticAds.length > 0
    }
    if (submissionType === "new-primary-only") {
      return formData.primaryText.length > 0
    }
    if (submissionType === "new-headline-only") {
      return formData.headlines.length > 0
    }
    if (submissionType === "headline-primary") {
      return formData.headlines.length > 0 && formData.primaryText.length > 0
    }
    if (submissionType === "motion-graphic") {
      return formData.videoFiles.length > 0
    }
    return false
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">Upload & Enter Your Assets</div>
              <div className="text-sm font-normal text-slate-600 mt-1">Step 3 of 7</div>
            </div>
          </CardTitle>
          <Button
            variant="outline"
            onClick={loadExampleAd}
            className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            <Sparkles className="h-4 w-4" />
            Load Example Ad
          </Button>
        </div>
        <CardDescription className="text-slate-600 mt-3">
          Upload creative assets and enter copy for your {submissionType.replace(/-/g, " ")} submission. We'll help you
          create professional mockups automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Static Ads */}
        {showStaticAds && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileImage className="h-5 w-5 text-blue-600" />
              </div>
              Static Ad Images
            </h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              }`}
              onDragEnter={(e) => handleDrag(e, "staticAds")}
              onDragLeave={(e) => handleDrag(e, "staticAds")}
              onDragOver={(e) => handleDrag(e, "staticAds")}
              onDrop={(e) => handleDrop(e, "staticAds")}
              onClick={() => document.getElementById("static-ads-upload")?.click()}
            >
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700 mb-2">Drop ad images here or click to browse</p>
              <p className="text-sm text-slate-500 mb-6">Supports JPG, PNG, GIF (max 5MB each)</p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "staticAds")}
                className="hidden"
                id="static-ads-upload"
              />
              <Button variant="outline" className="cursor-pointer border-blue-200 text-blue-600 hover:bg-blue-50">
                Browse Files
              </Button>
            </div>

            {formData.staticAds.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-4 text-slate-700">Uploaded Ad Images ({formData.staticAds.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.staticAds.map((file, index) => (
                    <div
                      key={index}
                      className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <div className="relative h-48 bg-slate-100">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Ad ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            <div>
                              <p className="font-medium text-sm text-slate-800">{file.name}</p>
                              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index, "staticAds")}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Text */}
        {showPrimaryText && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              Primary Text Variations
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Enter primary text variation..."
                    value={primaryTextInput}
                    onChange={(e) => setPrimaryTextInput(e.target.value)}
                    className="min-h-[3rem] max-h-[8rem] resize-none border-slate-200 focus:border-blue-500 pr-10 w-full"
                    rows={2}
                  />
                  {lastPrimaryTextSource && (
                    <div
                      className="absolute right-3 top-3"
                      title={lastPrimaryTextSource === "openai" ? "AI Generated" : "Example Content"}
                    >
                      {lastPrimaryTextSource === "openai" ? (
                        <Zap className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Database className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                    <span>{primaryTextInput.length} characters</span>
                    {primaryTextInput.length > 170 ? (
                      <span className="text-red-600 font-medium">Exceeds 170 character limit for ad compliance</span>
                    ) : primaryTextInput.length > 140 ? (
                      <span className="text-amber-600">Approaching 170 character limit</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={addPrimaryText}
                    disabled={!primaryTextInput.trim()}
                    className="px-6 bg-green-500 hover:bg-green-600 text-white"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={handlePrimaryTextSuggestion}
                    disabled={isGeneratingPrimaryText}
                    className="flex items-center gap-2 px-4 bg-purple-500 hover:bg-purple-600 text-white"
                    title="Generate AI suggestion based on your content and successful examples"
                  >
                    {isGeneratingPrimaryText ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="sr-only">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Suggest</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {formData.primaryText.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-slate-700">
                    Added Primary Text ({formData.primaryText.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.primaryText.map((text, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <p className="text-sm text-slate-700 flex-1">{text}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrimaryText(index)}
                          className="text-slate-400 hover:text-red-500 ml-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Headlines */}
        {showHeadlines && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              Headline Variations
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Enter headline variation..."
                    value={headlineInput}
                    onChange={(e) => setHeadlineInput(e.target.value)}
                    className="h-12 border-slate-200 focus:border-blue-500 pr-10 w-full"
                  />
                  {lastHeadlineSource && (
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      title={lastHeadlineSource === "openai" ? "AI Generated" : "Example Content"}
                    >
                      {lastHeadlineSource === "openai" ? (
                        <Zap className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Database className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  )}
                </div>
                <Button
                  onClick={addHeadline}
                  disabled={!headlineInput.trim()}
                  className="px-6 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Add
                </Button>
                <Button
                  onClick={handleHeadlineSuggestion}
                  disabled={isGeneratingHeadline}
                  className="flex items-center gap-2 px-4 bg-purple-500 hover:bg-purple-600 text-white"
                  title="Generate AI suggestion based on your content and successful examples"
                >
                  {isGeneratingHeadline ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="sr-only">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Suggest</span>
                    </>
                  )}
                </Button>
              </div>

              {formData.headlines.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-slate-700">Added Headlines ({formData.headlines.length})</h4>
                  <div className="space-y-3">
                    {formData.headlines.map((headline, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <p className="text-sm font-medium text-slate-700 flex-1">{headline}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeadline(index)}
                          className="text-slate-400 hover:text-red-500 ml-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source Indicator Legend */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="font-semibold mb-2 text-slate-700">AI Suggestion Sources</h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-slate-700">
                AI Generated: Variations based on your content + successful examples
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-slate-700">Example Content: Pre-defined examples from our database</span>
            </div>
          </div>
        </div>

        {/* Landing Page URLs */}
        {showLandingPages && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LinkIcon className="h-5 w-5 text-purple-600" />
              </div>
              Landing Page URLs
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter landing page URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 h-12 border-slate-200 focus:border-blue-500"
                />
                <Button
                  onClick={addUrl}
                  disabled={!urlInput.trim()}
                  className="px-6 bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Add
                </Button>
              </div>

              {formData.landingPageUrls.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-slate-700">Added URLs ({formData.landingPageUrls.length})</h4>
                  <div className="space-y-3">
                    {formData.landingPageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <p className="text-sm text-blue-600 flex-1">{url}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrl(index)}
                          className="text-slate-400 hover:text-red-500 ml-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-Generated Mockup Screenshots */}
        {showMockups && (
          <div>
            {showMockupGenerator ? (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                  </div>
                  Auto-Generated Mockup Screenshots
                </h3>

                {/* Important notice about saving mockups */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">Important: Save Your Mockups</p>
                      <p className="text-sm text-blue-700">
                        To include mockups in your final PDF report, you must click the "Save Mockup" button below. Any
                        mockups you save will appear in the "Saved Mockups" section and will be included in your PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800 font-medium mb-1">Smart Mockup Generation Ready!</p>
                      <p className="text-sm text-green-700">
                        Based on your uploaded assets, we've automatically generated realistic ad mockups. You can
                        customize and save additional variations below.
                      </p>
                    </div>
                  </div>
                </div>

                <MetaAdMockup
                  images={formData.staticAds}
                  headlines={formData.headlines}
                  primaryText={formData.primaryText}
                  landingPageUrls={formData.landingPageUrls}
                  onSaveMockup={handleSaveMockup}
                />

                {formData.mockupScreenshots.length > 0 ? (
                  <div className="mt-8">
                    <h4 className="font-semibold mb-4 text-slate-700 flex items-center gap-2">
                      <Save className="h-4 w-4 text-green-600" />
                      Saved Mockups ({formData.mockupScreenshots.length})
                      <span className="text-sm font-normal text-green-600 ml-2">
                        These will be included in your PDF
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.mockupScreenshots.map((file, index) => (
                        <div
                          key={index}
                          className="relative group bg-white rounded-xl border border-slate-200 p-3 shadow-sm"
                        >
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Mockup ${index + 1}`}
                            className="w-full object-contain rounded-lg"
                            style={{ maxHeight: "500px" }}
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(index, "mockupScreenshots")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">No mockups saved yet</p>
                        <p className="text-sm text-amber-700">
                          Use the "Save Mockup" button above to save mockups for your PDF report.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Fallback manual upload when auto-generation isn't available
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileImage className="h-5 w-5 text-indigo-600" />
                  </div>
                  Mockup Screenshots
                </h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                  <p className="text-sm text-yellow-800">
                    Upload static ads and add headlines or primary text above to enable auto-generated mockups.
                  </p>
                </div>

                {/* Keep the existing manual upload section as fallback */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 scale-105"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                  onDragEnter={(e) => handleDrag(e, "mockupScreenshots")}
                  onDragLeave={(e) => handleDrag(e, "mockupScreenshots")}
                  onDragOver={(e) => handleDrag(e, "mockupScreenshots")}
                  onDrop={(e) => handleDrop(e, "mockupScreenshots")}
                >
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-2">Drop mockup screenshots here</p>
                  <p className="text-sm text-slate-500 mb-4">Or upload manually if you have existing mockups</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "mockupScreenshots")}
                    className="hidden"
                    id="mockup-upload"
                  />
                  <Label htmlFor="mockup-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Browse Files
                    </Button>
                  </Label>
                </div>

                {formData.mockupScreenshots.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Uploaded Mockups ({formData.mockupScreenshots.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.mockupScreenshots.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file)}
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index, "mockupScreenshots")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video Files */}
        {showVideoFiles && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-red-100 rounded-lg">
                <Video className="h-5 w-5 text-red-600" />
              </div>
              Motion Graphics & Video Files
            </h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              }`}
              onDragEnter={(e) => handleDrag(e, "videoFiles")}
              onDragLeave={(e) => handleDrag(e, "videoFiles")}
              onDragOver={(e) => handleDrag(e, "videoFiles")}
              onDrop={(e) => handleDrop(e, "videoFiles")}
            >
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700 mb-2">Drop video files here</p>
              <p className="text-sm text-slate-500 mb-6">Supports MP4, MOV, AVI (max 100MB each)</p>
              <Input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileSelect(e, "videoFiles")}
                className="hidden"
                id="video-upload"
              />
              <Label htmlFor="video-upload">
                <Button variant="outline" className="cursor-pointer">
                  Browse Files
                </Button>
              </Label>
            </div>

            {formData.videoFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-4 text-slate-700">Uploaded Videos ({formData.videoFiles.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.videoFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium text-sm text-slate-800">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index, "videoFiles")}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delivery Instructions */}
        {showDeliveryInstructions && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Delivery Instructions</h3>
            <Textarea
              placeholder="Enter any specific delivery instructions or notes about the video files..."
              rows={4}
              value={formData.deliveryInstructions}
              onChange={(e) => updateDeliveryInstructions(e.target.value)}
              className="border-slate-200 focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onPrev}
            className="px-6 py-3 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!hasRequiredAssets()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue to Compliance Review
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
