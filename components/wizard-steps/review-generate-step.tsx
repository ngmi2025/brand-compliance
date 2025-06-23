"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, X, FileCheck } from "lucide-react"
import type { WizardData } from "../compliance-wizard" // Ensure this path is correct
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ReviewGenerateStepProps {
  wizardData: WizardData
  onUpdate: (data: Partial<WizardData["submission"] & { projectInfo?: WizardData["projectInfo"] }>) => void
  onNext: () => void
  onPrev: () => void
}

// Mock data for pre-approved assets (ensure this matches your actual structure or is fetched)
const preApprovedAssets = {
  primaryText: {
    "primary-1": "Earn 3X points on dining and travel purchases with the Chase Sapphire Preferred Card.",
    "primary-2": "Get 60,000 bonus points after spending $4,000 in the first 3 months.",
    "primary-3": "Transfer points to leading airline and hotel loyalty programs at 1:1 ratio.",
    "primary-4": "No foreign transaction fees on purchases made outside the United States.",
    "primary-5": "Complimentary DashPass subscription and Lyft Pink membership included.",
    "primary-6": "Earn 4X points on dining at restaurants worldwide with the American Express Gold Card.",
    "primary-7": "Get up to $120 in dining credits annually at participating restaurants.",
    "primary-8": "Enjoy complimentary access to airport lounges worldwide.",
  },
  headlines: {
    "headline-1": "Earn More on Every Purchase",
    "headline-2": "Travel Rewards Made Simple",
    "headline-3": "Unlock Premium Benefits",
    "headline-4": "Your Gateway to More Points",
    "headline-5": "Dining Rewards Redefined",
    "headline-6": "Premium Travel Experience",
    "headline-7": "Maximize Your Spending Power",
    "headline-8": "Exclusive Member Benefits",
  },
  creative: {
    "creative-1": {
      title: "Chase Sapphire Preferred Card Hero Image",
      description: "Premium card design with blue gradient background and travel imagery",
      type: "Hero Banner",
      dimensions: "1200x628px",
      imageUrl: "/amex-creative-1.png",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
      fileType: "PNG",
      fileSize: "245KB",
    },
    "creative-2": {
      title: "Dining Rewards Lifestyle Image",
      description: "High-quality photo of couple dining at upscale restaurant",
      type: "Lifestyle Photo",
      dimensions: "800x600px",
      imageUrl: "/amex-creative-2.png",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
      fileType: "PNG",
      fileSize: "198KB",
    },
    "creative-3": {
      title: "Travel Benefits Collage",
      description: "Montage of travel destinations and luxury experiences",
      type: "Composite Image",
      dimensions: "1080x1080px",
      imageUrl: "/amex-creative-3.png",
      publisher: "American Express",
      cardProduct: "Platinum",
      fileType: "PNG",
      fileSize: "312KB",
    },
    "creative-4": {
      title: "American Express Gold Card Product Shot",
      description: "Clean product photography of the Gold Card with metallic finish",
      type: "Product Image",
      dimensions: "800x800px",
      imageUrl: "/amex-dunkin-1.png",
      publisher: "American Express",
      cardProduct: "Gold",
      fileType: "PNG",
      fileSize: "156KB",
    },
  },
  urls: {
    "url-1": {
      title: "Chase Sapphire Preferred Application Page",
      url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
      description: "Official application landing page with current bonus offer",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
    },
    "url-2": {
      title: "Chase Ultimate Rewards Portal",
      url: "https://ultimaterewards.chase.com",
      description: "Points redemption portal for travel and shopping",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
    },
    "url-3": {
      title: "Chase Sapphire Benefits Page",
      url: "https://creditcards.chase.com/sapphire/benefits",
      description: "Detailed benefits and features overview page",
      publisher: "Chase",
      cardProduct: "Sapphire Preferred",
    },
    "url-4": {
      title: "American Express Gold Card Application",
      url: "https://americanexpress.com/us/credit-cards/card/gold-card",
      description: "Official Gold Card application page with current welcome offer",
      publisher: "American Express",
      cardProduct: "Gold",
    },
    "url-5": {
      title: "American Express Membership Rewards",
      url: "https://membershiprewards.com",
      description: "Points redemption and transfer portal",
      publisher: "American Express",
      cardProduct: "Gold",
    },
  },
}

const getDisplayNames = () => {
  const issuerData = {
    "american-express": {
      name: "American Express",
      cards: { "amex-gold": "Gold Card", "amex-platinum": "Platinum Card" /* ... */ },
    },
    chase: { name: "Chase", cards: { "chase-sapphire-preferred": "Sapphire Preferred" /* ... */ } },
    // ... other issuers
  } as const

  const getIssuerName = (issuerKey: keyof typeof issuerData | string) => {
    return issuerData[issuerKey as keyof typeof issuerData]?.name || issuerKey
  }

  const getCardName = (issuerKey: keyof typeof issuerData | string, cardKey: string) => {
    const issuer = issuerData[issuerKey as keyof typeof issuerData]
    return issuer?.cards[cardKey as keyof typeof issuer.cards] || cardKey
  }
  return { getIssuerName, getCardName }
}

export function ReviewGenerateStep({ wizardData, onUpdate, onNext, onPrev }: ReviewGenerateStepProps) {
  const [showDocPreview, setShowDocPreview] = useState(false)
  // submissionId, isGeneratingDocument, documentPreviewUrl states remain the same

  const [customFilename, setCustomFilename] = useState(() => {
    const issuerStr = wizardData.projectInfo?.issuer?.replace(/\s+/g, "-") || "unknown-issuer"
    const cardProductStr = wizardData.projectInfo?.cardProduct?.replace(/\s+/g, "-") || "unknown-card"
    const timestampStr = new Date().toISOString().split("T")[0]
    return `${issuerStr}-${cardProductStr}-compliance-${timestampStr}`
  })

  const [introductionText, setIntroductionText] = useState(() => {
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

  const [submissionId, setSubmissionId] = useState(
    wizardData?.submission?.submissionId || `SUB-${Math.floor(Math.random() * 10000)}`,
  )
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false)
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null)

  const closeDocPreview = () => {
    setShowDocPreview(false)
    if (documentPreviewUrl) {
      URL.revokeObjectURL(documentPreviewUrl)
      setDocumentPreviewUrl(null)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDocPreview) {
        closeDocPreview()
      }
    }

    if (showDocPreview) {
      // We no longer hide body overflow
      document.addEventListener("keydown", handleKeyDown)
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      })
    } else {
      // Ensure listener is removed when modal is not shown
      document.removeEventListener("keydown", handleKeyDown)
    }

    return () => {
      // Cleanup listener on unmount or if showDocPreview changes
      document.removeEventListener("keydown", handleKeyDown)
      // No need to reset body overflow as we are not setting it anymore
    }
  }, [showDocPreview, documentPreviewUrl]) // Added documentPreviewUrl as closeDocPreview depends on it.

  // processAndUploadAssets and handleGenerateAction functions remain the same...
  const processAndUploadAssets = async () => {
    toast({ title: "Processing assets...", description: "Uploading images to secure storage. This may take a moment." })

    const uploadFileToBlob = async (
      file: File | Blob,
      filename: string,
    ): Promise<{ name: string; url: string; error?: string }> => {
      try {
        const response = await fetch("/api/upload-blob", {
          method: "POST",
          headers: { "x-vercel-filename": filename },
          body: file,
        })
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Upload failed with status " + response.status }))
          console.error(`Failed to upload ${filename}:`, errorData)
          return { name: filename, url: "", error: errorData.error || `Upload failed for ${filename}` }
        }
        const newBlob = await response.json()
        if (!newBlob.url) {
          console.error(`Upload successful for ${filename} but no URL returned:`, newBlob)
          return { name: filename, url: "", error: `Upload for ${filename} did not return a URL.` }
        }
        return { name: filename, url: newBlob.url }
      } catch (error) {
        console.error(`Exception during upload of ${filename}:`, error)
        return {
          name: filename,
          url: "",
          error: error instanceof Error ? error.message : `Unknown error uploading ${filename}`,
        }
      }
    }

    // 1. Upload user-provided assets
    const staticAdsUploadPromises = (wizardData.assets?.staticAds || []).map((file) =>
      uploadFileToBlob(file, file.name),
    )
    const mockupUploadPromises = (wizardData.assets?.mockupScreenshots || []).map((file) =>
      uploadFileToBlob(file, file.name),
    )

    // 2. Fetch, then upload pre-approved assets
    const preApprovedCreativeUploadPromises = (wizardData.preApproved?.selectedCreative || []).map(
      async (creativeId: string) => {
        const creativeAsset = preApprovedAssets.creative[creativeId as keyof typeof preApprovedAssets.creative]
        if (!creativeAsset || !creativeAsset.imageUrl) {
          console.warn(`Pre-approved creative ${creativeId} not found or has no imageUrl.`)
          return {
            id: creativeId,
            title: creativeAsset?.title || creativeId,
            url: "",
            error: "Asset not found or missing image URL",
          }
        }
        try {
          // Fetch the image from the public path
          const response = await fetch(creativeAsset.imageUrl)
          if (!response.ok) {
            throw new Error(`Failed to fetch pre-approved image ${creativeAsset.imageUrl}: ${response.statusText}`)
          }
          const blob = await response.blob()
          const originalFilename = creativeAsset.imageUrl.split("/").pop() || `${creativeId}.png`
          const uploadedBlob = await uploadFileToBlob(blob, originalFilename)
          return { id: creativeId, title: creativeAsset.title, url: uploadedBlob.url, error: uploadedBlob.error }
        } catch (error) {
          console.error(`Failed to process pre-approved creative ${creativeId}:`, error)
          return {
            id: creativeId,
            title: creativeAsset.title,
            url: "",
            error: error instanceof Error ? error.message : "Processing error",
          }
        }
      },
    )

    const [staticAdsResults, mockupResults, preApprovedCreativeResults] = await Promise.all([
      Promise.all(staticAdsUploadPromises),
      Promise.all(mockupUploadPromises),
      Promise.all(preApprovedCreativeUploadPromises),
    ])

    // Check for errors during upload
    const allUploads = [...staticAdsResults, ...mockupResults, ...preApprovedCreativeResults]
    const uploadErrors = allUploads.filter((result) => result && result.error)
    if (uploadErrors.length > 0) {
      uploadErrors.forEach((err) => toast({ title: "Upload Error", description: err.error, variant: "destructive" }))
      throw new Error("Some assets failed to upload. Please check console for details.")
    }

    toast({ title: "Assets processed!", description: "All images uploaded successfully." })

    return {
      staticAdsUrls: staticAdsResults.map((r) => ({ name: r.name, url: r.url })),
      mockupUrls: mockupResults.map((r) => ({ name: r.name, url: r.url })),
      preApprovedCreativeUrls: preApprovedCreativeResults
        .filter((r) => r && r.url)
        .map((r) => ({ id: r!.id, title: r!.title, url: r!.url })),
    }
  }

  const handleGenerateAction = async (format: "html" | "pdf") => {
    setIsGeneratingDocument(true)
    try {
      const { staticAdsUrls, mockupUrls, preApprovedCreativeUrls } = await processAndUploadAssets()

      const wizardDataWithUrls = {
        ...wizardData,
        projectInfo: {
          // Ensure projectInfo is included
          ...wizardData.projectInfo,
          submissionName: wizardData.projectInfo?.submissionName || customFilename, // Use current submission name
        },
        assets: {
          ...wizardData.assets,
          staticAdsUrls, // Ensure these are arrays of { name: string, url: string }
          mockupUrls, // Ensure these are arrays of { name: string, url: string }
        },
        preApproved: {
          ...wizardData.preApproved,
          preApprovedCreativeUrls, // Ensure this is an array of { id: string, title: string, url: string }
        },
        // Include introductionText and customFilename if they need to be in the final wizardData for the API
        introductionText,
        documentFilename: customFilename,
      }

      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardData: wizardDataWithUrls, format }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "API request failed" }))
        throw new Error(errorData.error || `API Error (${response.status})`)
      }

      const htmlContent = await response.text()
      if (format === "html") {
        // For preview
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        setDocumentPreviewUrl(url)
        setShowDocPreview(true) // This will trigger the useEffect for scrolling
        toast({ title: "Preview Ready!", description: "Document preview is now open." })
      } else {
        // For download (PDF via HTML)
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          const updatedHtmlContent = htmlContent.replace(/<title>.*?<\/title>/, `<title>${customFilename}</title>`)
          newWindow.document.write(updatedHtmlContent)
          newWindow.document.close()
          toast({ title: "Document Ready!", description: "Opened in a new tab. Use 'Save as PDF' there." })
        } else {
          toast({
            title: "Popup Blocked?",
            description: "Could not open new tab. Please check popup settings.",
            variant: "warning",
          })
        }
      }
      onUpdate({
        docGenerated: true,
        submissionId, // Ensure submissionId is correctly managed
        status: "pending_review",
      })
    } catch (error) {
      console.error(`Error during document ${format === "html" ? "preview" : "download"}:`, error)
      toast({
        title: `${format === "html" ? "Preview" : "Download"} Failed`,
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
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
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Issuer</div>
                <div className="text-base font-medium text-slate-800">
                  {getDisplayNames().getIssuerName(wizardData.projectInfo?.issuer || "")}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Card Product</div>
                <div className="text-base font-medium text-slate-800">
                  {getDisplayNames().getCardName(
                    wizardData.projectInfo?.issuer || "",
                    wizardData.projectInfo?.cardProduct || "",
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Submission Name</div>
                <input
                  type="text"
                  value={wizardData.projectInfo?.submissionName || ""}
                  onChange={(e) => {
                    onUpdate({
                      projectInfo: {
                        ...wizardData.projectInfo,
                        submissionName: e.target.value,
                      },
                    })
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter submission name"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Document Filename</div>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter filename for the document"
                />
                <div className="text-xs text-slate-500">
                  The document will be saved as: <span className="font-mono">{customFilename}.pdf</span>
                </div>
              </div>
            </div>
          </div>

          {/* Introduction & Request */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Introduction & Request</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="introduction" className="block text-sm font-medium text-slate-700 mb-2">
                  What are you requesting approval for?
                </label>
                <textarea
                  id="introduction"
                  value={introductionText}
                  onChange={(e) => setIntroductionText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Describe what you're seeking approval for..."
                />
              </div>
              <div className="text-xs text-slate-500">
                This introduction will appear at the beginning of your compliance document.
              </div>
            </div>
          </div>

          {/* Submitted Assets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Submitted Assets</h3>

            {/* Primary Text */}
            {wizardData.assets?.primaryText?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Primary Text ({wizardData.assets.primaryText.length} items)
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.primaryText.map((text, index) => (
                    <div
                      key={`submitted-primary-${index}`}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <p className="text-sm text-slate-700">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-6">No primary text submitted.</p>
            )}

            {/* Headlines */}
            {wizardData.assets?.headlines?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Headlines ({wizardData.assets.headlines.length} items)
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.headlines.map((headline, index) => (
                    <div
                      key={`submitted-headline-${index}`}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <p className="text-sm text-slate-700">{headline}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-6">No headlines submitted.</p>
            )}

            {/* Landing Page URLs */}
            {wizardData.assets?.landingPageUrls?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Landing Page URLs ({wizardData.assets.landingPageUrls.length} items)
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.landingPageUrls.map((url, index) => (
                    <div key={`submitted-url-${index}`} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-6">No landing page URLs submitted.</p>
            )}

            {/* Static Ads (remains as is, visual check) */}
            {wizardData.assets.staticAds?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Static Ads ({wizardData.assets.staticAds.length} files)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {wizardData.assets.staticAds.map((ad, index) => (
                    <div key={index} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <div className="aspect-video bg-slate-100 rounded flex items-center justify-center mb-2 overflow-hidden">
                        <img
                          src={URL.createObjectURL(ad) || "/placeholder.svg"}
                          alt={`Ad ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-500 truncate" title={ad.name}>
                        {ad.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mockup Screenshots (remains as is, visual check) */}
            {wizardData.assets.mockupScreenshots?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Mockup Screenshots ({wizardData.assets.mockupScreenshots.length} files)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {wizardData.assets.mockupScreenshots.map((screenshot, index) => (
                    <div key={index} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <div className="aspect-video bg-slate-100 rounded flex items-center justify-center mb-2 overflow-hidden">
                        <img
                          src={URL.createObjectURL(screenshot) || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-500 truncate" title={screenshot.name}>
                        {screenshot.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Compliance Summary */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Compliance Summary</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <FileCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-base font-semibold text-blue-800">Automated Compliance Check Status</h4>
                  {wizardData.complianceResults?.allPassed ? (
                    <p className="text-sm text-green-700 font-medium mt-1">
                      All automated compliance checks passed successfully.
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 font-medium mt-1">
                      Some automated compliance checks identified potential issues.
                    </p>
                  )}
                </div>
              </div>

              {wizardData.complianceResults && (
                <div className="text-sm text-slate-700 space-y-1 mb-3">
                  <p>Number of rules checked: {wizardData.complianceResults.results?.length || "N/A"}.</p>
                  {wizardData.complianceResults.summary && <p>Summary: {wizardData.complianceResults.summary}</p>}
                  {!wizardData.complianceResults.allPassed &&
                    wizardData.complianceResults.results?.some((r) => !r.passed) && (
                      <p className="text-amber-700">
                        For a detailed breakdown of any warnings or errors, please refer back to the 'Review Results'
                        step.
                      </p>
                    )}
                </div>
              )}

              <div className="text-xs text-blue-600 italic border-t border-blue-200 pt-3 mt-3">
                Please note: The detailed results of these automated compliance checks are for your internal review and
                guidance. They will not be included in the final generated document intended for external submission.
              </div>
            </div>
          </div>

          {/* Pre-Approved Assets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pre-Approved Assets</h3>

            {/* Pre-Approved Primary Text */}
            {wizardData.preApproved.selectedPrimaryText?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Pre-Approved Primary Text ({wizardData.preApproved.selectedPrimaryText.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedPrimaryText.map((primaryId) => {
                    const primaryText =
                      preApprovedAssets.primaryText[primaryId as keyof typeof preApprovedAssets.primaryText]
                    return (
                      <div key={primaryId} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-slate-700">{primaryText || `ID: ${primaryId} not found`}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-6">No pre-approved primary text selected.</p>
            )}

            {/* Pre-Approved Headlines */}
            {wizardData.preApproved.selectedHeadlines?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Pre-Approved Headlines ({wizardData.preApproved.selectedHeadlines.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedHeadlines.map((headlineId) => {
                    const headline = preApprovedAssets.headlines[headlineId as keyof typeof preApprovedAssets.headlines]
                    return (
                      <div key={headlineId} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-slate-700">{headline || `ID: ${headlineId} not found`}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-6">No pre-approved headlines selected.</p>
            )}

            {/* Pre-Approved Creative */}
            {wizardData.preApproved.selectedCreative.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">
                  Pre-Approved Creative ({wizardData.preApproved.selectedCreative.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wizardData.preApproved.selectedCreative.map((creativeId) => {
                    const creative = preApprovedAssets.creative[creativeId as keyof typeof preApprovedAssets.creative]
                    if (!creative) {
                      return (
                        <div key={creativeId} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700">Creative ID: {creativeId} not found</p>
                        </div>
                      )
                    }
                    return (
                      <div
                        key={creativeId}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="relative aspect-video bg-slate-100">
                          <img
                            src={creative.imageUrl || "/placeholder.svg"}
                            alt={creative.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-slate-800 truncate" title={creative.title}>
                            {creative.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {creative.publisher} • {creative.cardProduct}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mb-6">No pre-approved creative selected.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={() => handleGenerateAction("html")}
              disabled={isGeneratingDocument}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4"
            >
              {isGeneratingDocument ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Preview Document
            </button>
            <button
              onClick={() => handleGenerateAction("pdf")}
              disabled={isGeneratingDocument}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 py-2 px-4"
            >
              {isGeneratingDocument ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4 mr-2" />
              )}
              Save as PDF
            </button>
          </div>
        </div>
      </CardContent>
      <div className="flex justify-between p-8 bg-slate-50 rounded-b-lg">
        <button
          onClick={onPrev}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-slate-500 text-white hover:bg-slate-600 h-10 py-2 px-4"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!wizardData.submission?.docGenerated} // Example: only enable if doc is generated
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 disabled:bg-slate-300"
        >
          Next
        </button>
      </div>

      {/* Document Preview Modal */}
      {/* The modal structure itself remains the same, fixed positioning is correct. */}
      {/* The `overflow-y-auto` on the backdrop is not strictly needed if the page scrolls, but harmless. */}
      {showDocPreview && documentPreviewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDocPreview()
          }}
        >
          <div className="flex items-start justify-center min-h-full p-4 pt-12 sm:pt-16 md:pt-20 text-center">
            <div
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden text-left transform transition-all sm:align-middle"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                <h2 id="modal-title" className="text-lg font-semibold text-slate-800">
                  Document Preview
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateAction("pdf")}
                    disabled={isGeneratingDocument}
                    className="px-3 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 rounded font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {isGeneratingDocument ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileCheck className="h-3 w-3" />
                    )}
                    Save as PDF
                  </button>
                  <button
                    onClick={closeDocPreview}
                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md"
                    aria-label="Close preview"
                  >
                    <X className="h-5 w-5" />
                  </button>
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
