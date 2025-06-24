"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, X, FileCheck, Trash2, Loader2 } from "lucide-react"
import type { WizardData } from "../compliance-wizard"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReviewGenerateStepProps {
  wizardData: WizardData
  onUpdate: (
    data: Partial<
      WizardData["submission"] & {
        projectInfo?: WizardData["projectInfo"]
        assets?: WizardData["assets"]
        preApproved?: WizardData["preApproved"]
      }
    >,
  ) => void
  onNext: () => void
  onPrev: () => void
}

const preApprovedAssetsMock = {
  primaryText: {
    "primary-1": "Earn 3X points on dining and travel purchases with the Chase Sapphire Preferred Card.",
    "primary-2": "Get 60,000 bonus points after spending $4,000 in the first 3 months.",
    "primary-3": "Transfer points to leading airline and hotel loyalty programs at 1:1 ratio.",
    "primary-4": "No foreign transaction fees on purchases made outside the United States.",
    "primary-5": "Complimentary DashPass subscription and Lyft Pink membership included.",
    "primary-6": "Earn 4X points on dining at restaurants worldwide with the American Express Gold Card.",
  },
  headlines: {
    "headline-1": "Earn More on Every Purchase",
    "headline-2": "Travel Rewards Made Simple",
    "headline-3": "Unlock Premium Benefits",
    "headline-4": "Your Gateway to More Points",
    "headline-5": "Dining Rewards Redefined",
  },
  creative: {
    "creative-1": {
      title: "Chase Sapphire Preferred Card Hero Image",
      imageUrl: "/amex-creative-1.png",
      description: "Premium card design with blue gradient background and travel imagery",
    },
    "creative-2": {
      title: "Dining Rewards Lifestyle Image",
      imageUrl: "/amex-creative-2.png",
      description: "High-quality photo of couple dining at upscale restaurant",
    },
    "creative-3": {
      title: "Travel Benefits Collage",
      imageUrl: "/amex-creative-3.png",
      description: "Montage of travel destinations and luxury experiences",
    },
    "creative-4": {
      // Example, ensure this ID is used if selected
      title: "Amex Gold with Dunkin",
      imageUrl: "/amex-dunkin-1.png",
      description: "Amex Gold card with Dunkin Donuts partnership.",
    },
  },
  urls: {
    "url-1": {
      title: "Chase Sapphire Preferred Application Page",
      url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
      description: "Official application landing page with current bonus offer",
    },
    "url-2": {
      title: "Chase Ultimate Rewards Portal",
      url: "https://ultimaterewards.chase.com",
      description: "Points redemption portal for travel and shopping",
    },
    "url-3": {
      title: "American Express Gold Card Application",
      url: "https://americanexpress.com/us/credit-cards/card/gold-card",
      description: "Official Gold Card application page",
    },
    "url-4": {
      // Added for testing, as per user image
      title: "Upgraded Points Homepage",
      url: "https://upgradedpoints.com",
      description: "Homepage of Upgraded Points.",
    },
  },
}

const getDisplayNames = () => {
  const issuerData = {
    "american-express": {
      name: "American Express",
      cards: { "amex-gold": "Gold Card", "amex-platinum": "Platinum Card" },
    },
    chase: { name: "Chase", cards: { "chase-sapphire-preferred": "Sapphire Preferred" } },
  } as const
  const getIssuerName = (issuerKey: string) => issuerData[issuerKey as keyof typeof issuerData]?.name || issuerKey
  const getCardName = (issuerKey: string, cardKey: string) => {
    const issuer = issuerData[issuerKey as keyof typeof issuerData]
    return issuer?.cards[cardKey as keyof typeof issuer.cards] || cardKey
  }
  return { getIssuerName, getCardName }
}

// Helper function to convert a Blob to a Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function ReviewGenerateStep({ wizardData, onUpdate, onNext, onPrev }: ReviewGenerateStepProps) {
  const [showDocPreview, setShowDocPreview] = useState(false)
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false)
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null)

  const [customFilename, setCustomFilename] = useState(() => {
    const issuerStr = wizardData.projectInfo?.issuer?.replace(/\s+/g, "-") || "unknown-issuer"
    const cardProductStr = wizardData.projectInfo?.cardProduct?.replace(/\s+/g, "-") || "unknown-card"
    const timestampStr = new Date().toISOString().split("T")[0]
    return `${issuerStr}-${cardProductStr}-compliance-${timestampStr}`
  })

  const [introductionText, setIntroductionText] = useState(() => {
    // ... (introductionText logic remains the same)
    const submissionType = wizardData.submissionType?.submissionType
    const { getIssuerName, getCardName } = getDisplayNames()
    const issuerName = getIssuerName(wizardData.projectInfo?.issuer || "")
    const cardName = getCardName(wizardData.projectInfo?.issuer || "", wizardData.projectInfo?.cardProduct || "")

    switch (submissionType) {
      case "Full Campaign":
        return `We are seeking approval for updated creative imagery and copy for our ${issuerName} ${cardName} ad campaigns. This document outlines the ad copy and proposed visual mockups intended for use across Meta platforms.`
      case "New Creative Only":
        return `We would like to seek approval for new images to be used in our Meta ads. These images would be paired with the approved wording you can see above. Given the text is the same above and below the image, we have not created a Facebook and Instagram mock of each and instead have sent over the images we want to use.`
      case "New Primary Text":
        return `We've already had a number of ads approved for the ${cardName}. In order to expand our testing and generate more New Approved Applications, we'd like to run Primary Text variations to our ads. We are seeking approvals for these please. Below is one of our previously approved ads highlighting what we mean by the Primary Text area.`
      case "Headline Text":
        return `We've already had a number of ads approved for the ${cardName}. In order to expand our testing and generate more New Approved Applications, we'd like to run Headline text variations to our ads. We are seeking approvals for these please. Below is one of our previously approved ads highlighting what we mean by the Headline area.`
      case "Headline and Primary":
        return `We've already had a number of ads approved for the ${cardName}. In order to expand our testing and generate more New Approved Applications, we'd like to run Primary Text and Headline text variations to our ads. We are seeking approvals for these please. Below is one of our previously approved ads highlighting what we mean by the Primary Text area, and the Headline.`
      case "Motion Graphic":
        return `We are seeking approval for motion graphic ads for the ${cardName}. This document outlines the proposed motion graphics intended for use across Meta platforms.`
      default:
        return `We are seeking approval for updated creative imagery and copy for our ${issuerName} ${cardName} ad campaigns.`
    }
  })

  const { getIssuerName, getCardName: getCardDisplayName } = getDisplayNames()

  const closeDocPreview = () => {
    setShowDocPreview(false)
    if (documentPreviewUrl) {
      URL.revokeObjectURL(documentPreviewUrl)
      setDocumentPreviewUrl(null)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDocPreview) closeDocPreview()
    }
    if (showDocPreview) {
      document.addEventListener("keydown", handleKeyDown)
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }))
    } else {
      document.removeEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showDocPreview, documentPreviewUrl])

  const handleDeleteSubmittedAsset = (
    type: "primaryText" | "headlines" | "landingPageUrls" | "staticAds" | "mockupScreenshots",
    index: number,
  ) => {
    // ... (logic remains the same)
    const currentAssets = wizardData.assets
      ? { ...wizardData.assets }
      : {
          staticAds: [],
          primaryText: [],
          headlines: [],
          landingPageUrls: [],
          mockupScreenshots: [],
          videoFiles: [],
          deliveryInstructions: "",
        }
    if (type === "primaryText" || type === "headlines" || type === "landingPageUrls") {
      const items = [...(currentAssets[type] || [])]
      items.splice(index, 1)
      currentAssets[type] = items as any
    } else if (type === "staticAds" || type === "mockupScreenshots") {
      const files = [...(currentAssets[type] || [])]
      files.splice(index, 1)
      currentAssets[type] = files
    }
    onUpdate({ assets: currentAssets })
    toast({ title: "Asset Removed", description: "The asset has been removed from this submission." })
  }

  const handleRemovePreApprovedAsset = (
    type: "selectedPrimaryText" | "selectedHeadlines" | "selectedCreative" | "selectedUrls",
    idToRemove: string,
  ) => {
    // ... (logic remains the same)
    const currentPreApproved = wizardData.preApproved
      ? { ...wizardData.preApproved }
      : { selectedPrimaryText: [], selectedHeadlines: [], selectedCreative: [], selectedUrls: [] }
    const items = [...(currentPreApproved[type] || [])]
    const updatedItems = items.filter((id) => id !== idToRemove)
    currentPreApproved[type] = updatedItems
    onUpdate({ preApproved: currentPreApproved })
    toast({
      title: "Pre-approved Asset Removed",
      description: "The pre-approved asset has been removed from this submission.",
    })
  }

  const processAndUploadAssets = async () => {
    toast({ title: "Processing assets...", description: "Preparing assets for document generation." })

    // For user-uploaded files (staticAds, mockupScreenshots) -> Upload to Blob, get URL
    const uploadFileToBlob = async (
      file: File,
      filename: string,
    ): Promise<{ name: string; url: string; error?: string }> => {
      try {
        const response = await fetch("/api/upload-blob", {
          method: "POST",
          headers: { "x-vercel-filename": filename },
          body: file,
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
          return { name: filename, url: "", error: errorData.error || `Upload failed for ${filename}` }
        }
        const newBlob = await response.json()
        return { name: filename, url: newBlob.url }
      } catch (error) {
        return { name: filename, url: "", error: error instanceof Error ? error.message : "Unknown upload error" }
      }
    }

    const staticAdsUploadPromises = (wizardData.assets?.staticAds || []).map((file) =>
      uploadFileToBlob(file, file.name),
    )
    const mockupUploadPromises = (wizardData.assets?.mockupScreenshots || []).map((file) =>
      uploadFileToBlob(file, file.name),
    )

    // For pre-approved creative -> Fetch from public, convert to Base64
    const preApprovedCreativeBase64Promises = (wizardData.preApproved?.selectedCreative || []).map(
      async (creativeId: string) => {
        const creativeAsset = preApprovedAssetsMock.creative[creativeId as keyof typeof preApprovedAssetsMock.creative]
        if (!creativeAsset || !creativeAsset.imageUrl) {
          console.warn(`Pre-approved creative ${creativeId} not found or has no imageUrl.`)
          return { id: creativeId, title: "Unknown", base64: "", error: "Asset not found or missing image URL" }
        }
        try {
          const response = await fetch(creativeAsset.imageUrl)
          if (!response.ok) {
            throw new Error(`Failed to fetch pre-approved image ${creativeAsset.imageUrl}: ${response.statusText}`)
          }
          const blob = await response.blob()
          const base64 = await blobToBase64(blob)
          return { id: creativeId, title: creativeAsset.title, base64, error: undefined }
        } catch (error) {
          console.error(`Failed to process pre-approved creative ${creativeId} to Base64:`, error)
          return {
            id: creativeId,
            title: creativeAsset.title,
            base64: "",
            error: error instanceof Error ? error.message : "Base64 conversion error",
          }
        }
      },
    )

    const [staticAdsResults, mockupResults, preApprovedCreativeBase64Results] = await Promise.all([
      Promise.all(staticAdsUploadPromises),
      Promise.all(mockupUploadPromises),
      Promise.all(preApprovedCreativeBase64Promises),
    ])

    const uploadErrors = [
      ...staticAdsResults.filter((r) => r.error),
      ...mockupResults.filter((r) => r.error),
      ...preApprovedCreativeBase64Results.filter((r) => r.error),
    ]

    if (uploadErrors.length > 0) {
      uploadErrors.forEach((err) =>
        toast({ title: "Asset Processing Error", description: err.error, variant: "destructive" }),
      )
      throw new Error("Some assets failed to process. Please check console for details.")
    }

    toast({ title: "Assets processed!", description: "Assets ready for document." })

    return {
      staticAdsUrls: staticAdsResults.map((r) => ({ name: r.name, url: r.url })),
      mockupUrls: mockupResults.map((r) => ({ name: r.name, url: r.url })),
      preApprovedCreativeDataUrls: preApprovedCreativeBase64Results // Changed name to reflect Base64 content
        .filter((r) => r && r.base64)
        .map((r) => ({ id: r!.id, title: r!.title, base64: r!.base64 })),
    }
  }

  const handleGenerateAction = async (format: "html" | "pdf") => {
    setIsGeneratingDocument(true)
    try {
      // Use the new preApprovedCreativeDataUrls from processAndUploadAssets
      const { staticAdsUrls, mockupUrls, preApprovedCreativeDataUrls } = await processAndUploadAssets()

      const wizardDataForApi = {
        ...wizardData,
        projectInfo: {
          ...wizardData.projectInfo,
          submissionName: wizardData.projectInfo?.submissionName || customFilename,
        },
        assets: {
          ...wizardData.assets, // Includes primaryText, headlines, landingPageUrls
          staticAdsUrls, // URLs for user-uploaded static ads
          mockupUrls, // URLs for user-uploaded mockups
        },
        preApproved: {
          ...wizardData.preApproved, // Includes selected IDs for text/headlines/urls
          preApprovedCreativeDataUrls, // Base64 data for selected pre-approved creative
        },
        introductionText,
        documentFilename: customFilename,
      }

      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardData: wizardDataForApi, format }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "API request failed" }))
        throw new Error(errorData.error || `API Error (${response.status})`)
      }
      const htmlContent = await response.text()
      if (format === "html") {
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        setDocumentPreviewUrl(url)
        setShowDocPreview(true)
        toast({ title: "Preview Ready!" })
      } else {
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(htmlContent.replace(/<title>.*?<\/title>/, `<title>${customFilename}</title>`))
          newWindow.document.close()
          toast({ title: "Document Ready for PDF!", description: "Use browser's 'Save as PDF'." })
        } else {
          toast({ title: "Popup Blocked?", variant: "warning" })
        }
      }
      // This is crucial for enabling the "Next" button
      onUpdate({ submission: { ...wizardData.submission, docGenerated: true, status: "pending_review" } })
    } catch (error) {
      console.error(`Error during document ${format}:`, error)
      toast({
        title: `${format === "html" ? "Preview" : "Download"} Failed`,
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      })
      onUpdate({ submission: { ...wizardData.submission, docGenerated: false } }) // Explicitly set docGenerated to false on error
    } finally {
      setIsGeneratingDocument(false)
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Review & Generate Document</div>
            <div className="text-sm font-normal text-slate-600 mt-1">Step 6 of 7</div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-600 mt-3">
          Review your submission details and generate the compliance document.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-8">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-500">Issuer</div>
                <div className="text-base font-medium text-slate-800">
                  {getIssuerName(wizardData.projectInfo?.issuer || "")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-500">Card Product</div>
                <div className="text-base font-medium text-slate-800">
                  {getCardDisplayName(wizardData.projectInfo?.issuer || "", wizardData.projectInfo?.cardProduct || "")}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="submissionNameRevStep6B" className="text-sm font-medium text-slate-500">
                  Submission Name
                </Label>
                <Input
                  id="submissionNameRevStep6B"
                  value={wizardData.projectInfo?.submissionName || ""}
                  onChange={(e) =>
                    onUpdate({ projectInfo: { ...wizardData.projectInfo, submissionName: e.target.value } })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="customFilenameRevStep6B" className="text-sm font-medium text-slate-500">
                  Document Filename
                </Label>
                <Input
                  id="customFilenameRevStep6B"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"))}
                  className="w-full"
                />
                <div className="text-xs text-slate-500">
                  Filename: <span className="font-mono">{customFilename}.pdf</span>
                </div>
              </div>
            </div>
          </div>
          {/* Introduction & Request */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Introduction & Request</h3>
            <div>
              <Label htmlFor="introductionTextRevStep6B" className="block text-sm font-medium text-slate-700 mb-2">
                What are you requesting approval for?
              </Label>
              <Textarea
                id="introductionTextRevStep6B"
                value={introductionText}
                onChange={(e) => setIntroductionText(e.target.value)}
                className="w-full"
                rows={4}
              />
              <div className="text-xs text-slate-500 mt-1">This will appear at the beginning of your document.</div>
            </div>
          </div>
          {/* Submitted Assets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Submitted Assets for Approval</h3>
            {/* ... Submitted assets rendering with delete buttons ... */}
            {wizardData.assets?.primaryText?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Primary Text ({wizardData.assets.primaryText.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.primaryText.map((text, index) => (
                    <div
                      key={`s-pt-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border group"
                    >
                      <p className="text-sm text-slate-700 flex-grow mr-2">{text}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubmittedAsset("primaryText", index)}
                        className="text-slate-400 hover:text-red-500 h-8 w-8 opacity-50 group-hover:opacity-100"
                        aria-label="Delete primary text"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No primary text submitted.</p>
            )}
            {/* ... Other submitted assets sections (headlines, URLs, staticAds, mockupScreenshots) remain the same ... */}
            {wizardData.assets?.headlines?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Headlines ({wizardData.assets.headlines.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.headlines.map((headline, index) => (
                    <div
                      key={`s-hl-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border group"
                    >
                      <p className="text-sm text-slate-700 flex-grow mr-2">{headline}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubmittedAsset("headlines", index)}
                        className="text-slate-400 hover:text-red-500 h-8 w-8 opacity-50 group-hover:opacity-100"
                        aria-label="Delete headline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No headlines submitted.</p>
            )}
            {wizardData.assets?.landingPageUrls?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Landing Page URLs ({wizardData.assets.landingPageUrls.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.landingPageUrls.map((url, index) => (
                    <div
                      key={`s-url-${index}`}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border group"
                    >
                      <a
                        href={url.startsWith("http") ? url : `//${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all flex-grow mr-2"
                      >
                        {url}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubmittedAsset("landingPageUrls", index)}
                        className="text-slate-400 hover:text-red-500 h-8 w-8 opacity-50 group-hover:opacity-100"
                        aria-label="Delete URL"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No landing page URLs submitted.</p>
            )}
            {wizardData.assets?.staticAds?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Static Ads ({wizardData.assets.staticAds.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {wizardData.assets.staticAds.map((ad, index) => (
                    <div key={`s-ad-${index}`} className="relative group p-2 bg-white rounded-lg border shadow-sm">
                      <div className="aspect-video bg-slate-100 rounded flex items-center justify-center mb-1 overflow-hidden">
                        <img
                          src={URL.createObjectURL(ad) || "/placeholder.svg"}
                          alt={`Ad ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-500 truncate" title={ad.name}>
                        {ad.name}
                      </p>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteSubmittedAsset("staticAds", index)}
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        aria-label="Delete static ad"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {wizardData.assets?.mockupScreenshots?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Mockup Screenshots ({wizardData.assets.mockupScreenshots.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {wizardData.assets.mockupScreenshots.map((ss, index) => (
                    <div key={`s-ss-${index}`} className="relative group p-2 bg-white rounded-lg border shadow-sm">
                      <div className="aspect-video bg-slate-100 rounded flex items-center justify-center mb-1 overflow-hidden">
                        <img
                          src={URL.createObjectURL(ss) || "/placeholder.svg"}
                          alt={`Mockup ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-500 truncate" title={ss.name}>
                        {ss.name}
                      </p>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteSubmittedAsset("mockupScreenshots", index)}
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        aria-label="Delete mockup"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Pre-Approved Assets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pre-Approved Assets Referenced</h3>
            {wizardData.preApproved?.selectedPrimaryText?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Primary Text ({wizardData.preApproved.selectedPrimaryText.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedPrimaryText.map((id) => (
                    <div
                      key={`pa-pt-${id}`}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 group"
                    >
                      <p className="text-sm text-slate-700 flex-grow mr-2">
                        {preApprovedAssetsMock.primaryText[id as keyof typeof preApprovedAssetsMock.primaryText] ||
                          `(Content for ID: ${id} not found)`}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePreApprovedAsset("selectedPrimaryText", id)}
                        className="text-slate-400 hover:text-red-500 h-8 w-8 opacity-50 group-hover:opacity-100"
                        aria-label="Remove pre-approved primary text"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No pre-approved primary text referenced.</p>
            )}
            {wizardData.preApproved?.selectedHeadlines?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Headlines ({wizardData.preApproved.selectedHeadlines.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedHeadlines.map((id) => (
                    <div
                      key={`pa-hl-${id}`}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 group"
                    >
                      <p className="text-sm text-slate-700 flex-grow mr-2">
                        {preApprovedAssetsMock.headlines[id as keyof typeof preApprovedAssetsMock.headlines] ||
                          `(Content for ID: ${id} not found)`}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePreApprovedAsset("selectedHeadlines", id)}
                        className="text-slate-400 hover:text-red-500 h-8 w-8 opacity-50 group-hover:opacity-100"
                        aria-label="Remove pre-approved headline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No pre-approved headlines referenced.</p>
            )}
            {wizardData.preApproved?.selectedCreative?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Creative ({wizardData.preApproved.selectedCreative.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {wizardData.preApproved.selectedCreative.map((id) => {
                    const creative = preApprovedAssetsMock.creative[id as keyof typeof preApprovedAssetsMock.creative]
                    return (
                      <div
                        key={`pa-cr-${id}`}
                        className="relative group p-2 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="aspect-video bg-slate-100 rounded flex items-center justify-center mb-1 overflow-hidden">
                          <img
                            src={creative?.imageUrl || "/placeholder.svg?width=100&height=60&query=Error"}
                            alt={creative?.title || "Creative asset"}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-slate-600 truncate" title={creative?.title}>
                          {creative?.title || `(Title for ID: ${id} not found)`}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePreApprovedAsset("selectedCreative", id)}
                          className="absolute top-1 right-1 h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 bg-white/50 rounded-full"
                          aria-label="Remove pre-approved creative"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No pre-approved creative referenced.</p>
            )}
            {wizardData.preApproved?.selectedUrls?.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  URLs ({wizardData.preApproved.selectedUrls.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedUrls.map((id) => {
                    const urlAsset = preApprovedAssetsMock.urls[id as keyof typeof preApprovedAssetsMock.urls]
                    return (
                      <div
                        key={`pa-url-${id}`}
                        className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200 group"
                      >
                        <div className="flex-grow mr-2">
                          {urlAsset?.url ? (
                            <a
                              href={urlAsset.url.startsWith("http") ? urlAsset.url : `//${urlAsset.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {urlAsset.url}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-500 italic">(URL content not available for ID: {id})</p>
                          )}
                          {urlAsset?.title && <p className="text-xs text-slate-500">{urlAsset.title}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePreApprovedAsset("selectedUrls", id)}
                          className="text-slate-400 hover:text-red-500 h-8 w-8 opacity-50 group-hover:opacity-100"
                          aria-label="Remove pre-approved URL"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-4">No pre-approved URLs referenced.</p>
            )}
          </div>
          {/* Compliance Summary */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Compliance Summary</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <FileCheck className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-base font-semibold text-blue-800">Automated Compliance Check Status</h4>
                  {wizardData.complianceResults?.allPassed ? (
                    <p className="text-sm text-green-700 font-medium mt-1">All checks passed.</p>
                  ) : (
                    <p className="text-sm text-red-700 font-medium mt-1">Potential issues.</p>
                  )}
                </div>
              </div>
              <div className="text-xs text-blue-600 italic border-t border-blue-200 pt-3 mt-3">
                Detailed results are for internal review and not included in the final document.
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t mt-8">
            <Button
              onClick={() => handleGenerateAction("html")}
              disabled={isGeneratingDocument}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700" // Restored blue color
            >
              {isGeneratingDocument ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Preview Document
            </Button>
            <Button
              onClick={() => handleGenerateAction("pdf")}
              disabled={isGeneratingDocument}
              className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700" // Restored green color
            >
              {isGeneratingDocument ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4 mr-2" />
              )}
              Save as PDF
            </Button>
          </div>
        </div>
      </CardContent>
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 sm:p-8 bg-slate-50 rounded-b-lg border-t">
        <Button onClick={onPrev} variant="outline" className="w-full sm:w-auto mb-2 sm:mb-0">
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!wizardData.submission?.docGenerated}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300" // Added disabled styling
        >
          Next
        </Button>
      </div>

      {/* Document Preview Modal */}
      {showDocPreview && documentPreviewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title-rg-step6B"
          onClick={closeDocPreview}
        >
          <div className="flex items-start justify-center min-h-full p-4 pt-12 sm:pt-16 md:pt-20 text-center">
            <div
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                <h2 id="modal-title-rg-step6B" className="text-lg font-semibold text-slate-800">
                  Document Preview
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleGenerateAction("pdf")}
                    disabled={isGeneratingDocument}
                    size="sm"
                    // variant="outline" // Keep consistent with main button or use specific styling
                    className="text-xs bg-green-600 text-white hover:bg-green-700"
                  >
                    {isGeneratingDocument ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileCheck className="h-3 w-3" />
                    )}{" "}
                    Save as PDF
                  </Button>
                  <Button
                    onClick={closeDocPreview}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Close preview"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <iframe src={documentPreviewUrl} className="w-full flex-grow border-0" title="Document Preview" />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
