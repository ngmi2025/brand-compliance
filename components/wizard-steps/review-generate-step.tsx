"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  CheckCircle,
  X,
  FileCheck,
  MessageSquare,
  ImageIcon,
  Link,
  CreditCard,
  Calendar,
  Tag,
  Info,
  CheckSquare,
} from "lucide-react"
import type { WizardData } from "../compliance-wizard"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ReviewGenerateStepProps {
  wizardData: WizardData
  onUpdate: (data: { docGenerated: boolean; submissionId: string; status: string }) => void
  onNext: () => void
  onPrev: () => void
}

// Mock data for pre-approved assets
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
      imageUrl: "/amex-creative-1.png",
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

// Mock benefits data for organizing content by benefit
const benefitsData = {
  dining: {
    name: "Dining",
    description: "Earn rewards on dining at restaurants worldwide",
    amount: "4X",
    icon: <CreditCard className="h-5 w-5" />,
    color: "bg-amber-100 text-amber-800",
  },
  groceries: {
    name: "Groceries",
    description: "Earn rewards at U.S. supermarkets",
    amount: "4X",
    icon: <Tag className="h-5 w-5" />,
    color: "bg-green-100 text-green-800",
  },
  travel: {
    name: "Travel",
    description: "Earn rewards on flights booked directly with airlines or on amextravel.com",
    amount: "3X",
    icon: <Calendar className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-800",
  },
  uber: {
    name: "Uber",
    description: "Get up to $120 in Uber Cash yearly",
    amount: "$10/month",
    icon: <Info className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800",
  },
  dining_credit: {
    name: "Dining Credit",
    description: "Up to $120 annual dining credit at participating partners",
    amount: "$10/month",
    icon: <CheckSquare className="h-5 w-5" />,
    color: "bg-rose-100 text-rose-800",
  },
}

// Add this helper function near the top of the component, after the benefitsData
const getDisplayNames = () => {
  const issuerData = {
    "american-express": {
      name: "American Express",
      cards: {
        "amex-gold": "Gold Card",
        "amex-platinum": "Platinum Card",
        "amex-green": "Green Card",
        "amex-blue-cash": "Blue Cash Preferred",
        "amex-business-gold": "Business Gold Card",
        "amex-business-platinum": "Business Platinum Card",
      },
    },
    chase: {
      name: "Chase",
      cards: {
        "chase-sapphire-preferred": "Sapphire Preferred",
        "chase-sapphire-reserve": "Sapphire Reserve",
        "chase-freedom-unlimited": "Freedom Unlimited",
        "chase-freedom-flex": "Freedom Flex",
        "chase-ink-business": "Ink Business Preferred",
      },
    },
    "capital-one": {
      name: "Capital One",
      cards: {
        "capital-one-venture": "Venture",
        "capital-one-venture-x": "Venture X",
        "capital-one-savor": "Savor",
        "capital-one-quicksilver": "Quicksilver",
      },
    },
    citi: {
      name: "Citi",
      cards: {
        "citi-premier": "Premier Card",
        "citi-double-cash": "Double Cash",
        "citi-custom-cash": "Custom Cash",
        "citi-aa-platinum": "AAdvantage Platinum",
      },
    },
    discover: {
      name: "Discover",
      cards: {
        "discover-it": "it Cash Back",
        "discover-it-miles": "it Miles",
        "discover-it-student": "it Student",
      },
    },
  }

  const getIssuerName = (issuerKey: string) => {
    return issuerData[issuerKey]?.name || issuerKey
  }

  const getCardName = (issuerKey: string, cardKey: string) => {
    return issuerData[issuerKey]?.cards[cardKey] || cardKey
  }

  return { getIssuerName, getCardName }
}

export function ReviewGenerateStep({ wizardData, onUpdate, onNext, onPrev }: ReviewGenerateStepProps) {
  const [docGenerated, setDocGenerated] = useState(wizardData?.submission?.docGenerated || false)
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [showDocPreview, setShowDocPreview] = useState(false)
  const [submissionId, setSubmissionId] = useState(
    wizardData?.submission?.submissionId || `SUB-${Math.floor(Math.random() * 10000)}`,
  )
  const [zoomLevel, setZoomLevel] = useState(1)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    introduction: true,
    creativeUpdates: true,
    concepts: true,
    projectInfo: true,
    preApproved: true,
    compliance: true,
    delivery: true,
  })
  const modalRef = useRef<HTMLDivElement>(null)
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false)
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null)
  const previewContentRef = useRef<HTMLDivElement>(null)
  const [customFilename, setCustomFilename] = useState(() => {
    const issuerStr = wizardData.projectInfo.issuer.replace(/\s+/g, "-")
    const cardProductStr = wizardData.projectInfo.cardProduct.replace(/\s+/g, "-")
    const timestampStr = new Date().toISOString().split("T")[0]
    return `${issuerStr}-${cardProductStr}-compliance-${timestampStr}`
  })

  const [introductionText, setIntroductionText] = useState(() => {
    const submissionType = wizardData.submissionType.submissionType
    const { getIssuerName, getCardName } = getDisplayNames()
    const issuerName = getIssuerName(wizardData.projectInfo.issuer)
    const cardName = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow && previewContentRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Compliance Document</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e3a8a; }
              h2 { color: #1e3a8a; margin-top: 20px; }
              .section { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 8px; border: 1px solid #ddd; }
              th { background-color: #f3f4f6; }
              .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            ${previewContentRef.current.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const getReportTitle = () => {
    const { getIssuerName, getCardName } = getDisplayNames()
    const brand = getIssuerName(wizardData.projectInfo.issuer) || "UpgradedPoints"
    const cardProduct = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct) || ""
    const submissionType = wizardData.submissionType.submissionType || ""

    switch (submissionType) {
      case "Full Campaign":
        return `${brand} - ${cardProduct} Compliance Submission`
      case "New Creative Only":
        return `${brand} - ${cardProduct} Additional Ad Creative Requests`
      case "New Primary Text":
        return `${brand} - ${cardProduct} Added Primary Text Variations for Already Approved Meta Ads`
      case "Headline Text":
        return `${brand} - ${cardProduct} Added Headline Variations for Already Approved Meta Ads`
      case "Headline and Primary":
        return `${brand} - ${cardProduct} Added Text Variations for Already Approved Meta Ads`
      case "Motion Graphic":
        return `${brand} - ${cardProduct} Motion Graphic Ad Requests`
      default:
        return `${brand} - ${cardProduct} Compliance Submission`
    }
  }

  const getIntroductionText = () => {
    const submissionType = wizardData.submissionType.submissionType
    const { getCardName } = getDisplayNames()
    const cardName = getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)

    switch (submissionType) {
      case "Full Campaign":
        return `a new campaign for the ${cardName}. This document outlines the ad copy and proposed visual mockups intended for use across Meta platforms.`
      case "New Creative Only":
        return `updated creative imagery to accompany previously approved copy for our ${cardName} campaigns. This document outlines the proposed visual mockups intended for use across Meta platforms.`
      case "New Primary Text":
        return `new primary text variations for our ${cardName} campaigns. We've already had a number of ads approved and would like to expand our testing with these new variations.`
      case "Headline Text":
        return `new headline variations for our ${cardName} campaigns. We've already had a number of ads approved and would like to expand our testing with these new variations.`
      case "Headline and Primary":
        return `new primary text and headline variations for our ${cardName} campaigns. We've already had a number of ads approved and would like to expand our testing with these new variations.`
      case "Motion Graphic":
        return `motion graphic ads for the ${cardName}. This document outlines the proposed motion graphics intended for use across Meta platforms.`
      default:
        return `a new campaign for the ${cardName}.`
    }
  }

  const generateMockDoc = async (): Promise<Blob> => {
    // In a real implementation, we would use a library like docx.js to create a Word document
    // For this mock, we'll create a text file with the content that would go in the Word doc

    const submissionType = wizardData.submissionType.submissionType
    const title = getReportTitle()
    const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

    let content = `${title}\n${date}\n\n`

    // 1. Introduction & The Ask
    content += "Introduction\n"
    content += "We are seeking approval for " + getIntroductionText() + "\n\n"

    // 2. Description of Creative Updates
    content += "Description of Creative Updates\n"

    // Ad Copy Section
    if (["Full Campaign", "New Primary Text", "Headline Text", "Headline and Primary"].includes(submissionType)) {
      content += "Ad Copy:\n"
      if (submissionType === "Full Campaign") {
        content +=
          "New headlines and primary text are being introduced to refresh the messaging while maintaining brand alignment.\n\n"
      } else if (submissionType === "New Primary Text") {
        content +=
          "New primary text variations are being introduced to refresh the messaging while maintaining brand alignment.\n\n"
      } else if (submissionType === "Headline Text") {
        content +=
          "New headline variations are being introduced to refresh the messaging while maintaining brand alignment.\n\n"
      } else if (submissionType === "Headline and Primary") {
        content +=
          "New primary text and headline variations are being introduced to refresh the messaging while maintaining brand alignment.\n\n"
      }
    }

    // In-Creative Copy Structure
    if (["Full Campaign", "New Creative Only"].includes(submissionType)) {
      content += "All ads will use the same in-creative copy structure of:\n\n"
      content += "[BENEFIT/DOLLAR AMOUNT]\n"
      content += `With The ${wizardData.projectInfo.cardProduct}®\n`
      content += "Partner Offer. Terms Apply.\n\n"
    }

    // Images Section
    if (["Full Campaign", "New Creative Only"].includes(submissionType)) {
      content += "Images:\n"
      content +=
        "New imagery concepts are being introduced to refresh the creative while maintaining brand alignment.\n\n"
    }

    // Landing Page Information
    if (wizardData.assets.landingPageUrls.length > 0) {
      content += "The landing page will remain the same: "
      content += wizardData.assets.landingPageUrls[0]
      content += "\n\n"
    }

    // 3. Creative References
    if (["Full Campaign", "New Creative Only"].includes(submissionType)) {
      content += "Creative References\n"
      content += "New Creative Mockups\n"
      content += "The following are examples of how the proposed creative will look on Meta and Instagram:\n\n"
      content += "[Image mockups would be embedded here in actual Word document]\n\n"
      content += "Example of previously approved ad:\n\n"
      content += "[Previously approved ad would be embedded here in actual Word document]\n\n"
    }

    // 4. Concepts for Approval
    content += "Concepts for Approval\n"

    if (submissionType === "Full Campaign") {
      content += "These are the creative variations we are submitting for approval:\n\n"

      // Organize by benefits for full campaign
      const benefits = ["dining", "groceries", "travel", "uber", "dining_credit"]

      benefits.forEach((benefit) => {
        if (benefitsData[benefit]) {
          content += `Benefit - ${benefitsData[benefit].name}\n\n`

          // Primary Text
          if (wizardData.assets.primaryText.length > 0) {
            content += "PRIMARY TEXT:\n"
            wizardData.assets.primaryText.forEach((text, index) => {
              content += `Option ${index + 1}:\n${text}\n\n`
            })
          }

          // Headlines
          if (wizardData.assets.headlines.length > 0) {
            content += "HEADLINES:\n"
            wizardData.assets.headlines.forEach((headline) => {
              content += `${headline}\n`
            })
            content += "\n"
          }
        }
      })
    } else if (submissionType === "New Primary Text") {
      content += `${wizardData.projectInfo.cardProduct} - "Primary Text" Variations\n`
      content += "Already Approved:\n"
      content += "[Insert previously approved primary text here]\n\n"
      content += "Seeking Approval:\n"
      wizardData.assets.primaryText.forEach((text, index) => {
        content += `Variation #${index + 1}\n${text}\n\n`
      })
    } else if (submissionType === "Headline Text") {
      content += `${wizardData.projectInfo.cardProduct} - Headline Variations\n`
      content +=
        "Please note that the full card name will always be shown above these headlines, allowing us to use the short card name compliantly.\n\n"
      content += "Already Approved:\n"
      content += "[Insert previously approved headlines here]\n\n"
      content += "Seeking Approval:\n"
      wizardData.assets.headlines.forEach((headline, index) => {
        content += `${index + 1}. ${headline}\n`
      })
      content += "\n"
    } else if (submissionType === "Headline and Primary") {
      // Primary Text
      content += `${wizardData.projectInfo.cardProduct} - "Primary Text" Variations\n`
      content += "Already Approved:\n"
      content += "[Insert previously approved primary text here]\n\n"
      content += "Seeking Approval:\n"
      wizardData.assets.primaryText.forEach((text, index) => {
        content += `Variation #${index + 1}\n${text}\n\n`
      })

      // Headlines
      content += `${wizardData.projectInfo.cardProduct} - Headline Variations\n`
      content +=
        "Please note that the full card name will always be shown above these headlines, allowing us to use the short card name compliantly.\n\n"
      content += "Already Approved:\n"
      content += "[Insert previously approved headlines here]\n\n"
      content += "Seeking Approval:\n"
      wizardData.assets.headlines.forEach((headline, index) => {
        content += `${index + 1}. ${headline}\n`
      })
      content += "\n"
    } else if (submissionType === "New Creative Only") {
      content += "We would like to seek approval for the following images to be used in our Meta ads.\n\n"
      const totalImages = wizardData.assets.staticAds.length + wizardData.assets.mockupScreenshots.length
      for (let i = 1; i <= totalImages; i++) {
        content += `#${i}\n[Image would be embedded here in actual Word document]\n\n`
      }
    } else if (submissionType === "Motion Graphic") {
      content += "We are submitting the following motion graphics for approval:\n\n"
      wizardData.assets.videoFiles.forEach((video, index) => {
        content += `● ${video.name}\n`
      })
      content += "\n"
    }

    // 5. Project Information
    content += "Project Information:\n"
    content += `Issuer: ${wizardData.projectInfo.issuer}\n`
    content += `Card Product: ${wizardData.projectInfo.cardProduct}\n`
    content += `Submission Name: ${wizardData.projectInfo.submissionName}\n`
    content += `Submission Type: ${wizardData.submissionType.submissionType}\n\n`

    // 6. Landing Page URLs (if not already included)
    if (
      wizardData.assets.landingPageUrls.length > 0 &&
      !["Full Campaign", "New Creative Only"].includes(submissionType)
    ) {
      content += "Landing page example:\n"
      wizardData.assets.landingPageUrls.forEach((url) => {
        content += `${url}\n`
      })
      content += "\n"
    }

    // 7. Pre-approved Assets Used
    if (
      wizardData.preApproved.selectedPrimaryText?.length > 0 ||
      wizardData.preApproved.selectedHeadlines?.length > 0 ||
      wizardData.preApproved.selectedCreative.length > 0 ||
      wizardData.preApproved.selectedUrls.length > 0
    ) {
      content += "Pre-Approved Assets Used:\n"

      if (wizardData.preApproved.selectedPrimaryText?.length > 0) {
        content += `Pre-Approved Primary Text (${wizardData.preApproved.selectedPrimaryText.length}):\n`
        wizardData.preApproved.selectedPrimaryText.forEach((primaryId) => {
          const primaryText = preApprovedAssets.primaryText[primaryId]
          if (!primaryText) {
            content += `ID: ${primaryId}\nPrimary text not found in database\n\n`
          } else {
            content += `ID: ${primaryId}\n${primaryText}\n\n`
          }
        })
      }

      if (wizardData.preApproved.selectedHeadlines?.length > 0) {
        content += `Pre-Approved Headlines (${wizardData.preApproved.selectedHeadlines.length}):\n`
        wizardData.preApproved.selectedHeadlines.forEach((headlineId) => {
          const headline = preApprovedAssets.headlines[headlineId]
          if (!headline) {
            content += `ID: ${headlineId}\nHeadline not found in database\n\n`
          } else {
            content += `ID: ${headlineId}\n${headline}\n\n`
          }
        })
      }

      if (wizardData.preApproved.selectedCreative.length > 0) {
        content += `Pre-Approved Creative (${wizardData.preApproved.selectedCreative.length}):\n`
        wizardData.preApproved.selectedCreative.forEach((creativeId) => {
          const creative = preApprovedAssets.creative[creativeId]
          if (!creative) {
            content += `ID: ${creativeId}\nCreative not found in database\n\n`
          } else {
            content += `ID: ${creativeId}\n${creative.title}\n${creative.description}\n${creative.type} • ${creative.dimensions}\n\n`
          }
        })
      }

      if (wizardData.preApproved.selectedUrls.length > 0) {
        content += `Pre-Approved URLs (${wizardData.preApproved.selectedUrls.length}):\n`
        wizardData.preApproved.selectedUrls.forEach((urlId) => {
          const url = preApprovedAssets.urls[urlId]
          if (!url) {
            content += `ID: ${urlId}\nURL not found in database\n\n`
          } else {
            content += `ID: ${urlId}\n${url.title}\n${url.url}\n${url.description}\n\n`
          }
        })
      }
    }

    // 8. Delivery Instructions
    if (wizardData.assets.deliveryInstructions) {
      content += "Delivery Instructions:\n"
      content += `${wizardData.assets.deliveryInstructions}\n\n`
    }

    // 9. Footer
    content += `Submission ID: ${submissionId}\n`
    content += "Generated by UpgradedPoints Brand Compliance Tool\n"

    // For a real implementation, we would convert this content to a .docx file
    // For now, we'll return it as a text file
    return new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
  }

  const handlePreviewDoc = () => {
    setShowDocPreview(true)
  }

  const handleDownloadDoc = async () => {
    try {
      // Generate document when download is requested
      const mockDocBlob = await generateMockDoc()
      const url = URL.createObjectURL(mockDocBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${wizardData.projectInfo.issuer.replace(/\s+/g, "-")}-${wizardData.projectInfo.cardProduct.replace(/\s+/g, "-")}-compliance-document.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      URL.revokeObjectURL(url)

      // Update wizard data to mark as generated
      onUpdate({
        docGenerated: true,
        submissionId,
        status: "pending_review",
      })
    } catch (error) {
      console.error("Error generating document:", error)
    }
  }

  const closeDocPreview = () => {
    setShowDocPreview(false)
  }

  const handleNext = () => {
    onNext()
  }

  // Effect to scroll to top when modal opens
  useEffect(() => {
    if (showDocPreview && modalRef.current) {
      // Add a small delay to ensure the modal is fully rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollTop = 0
        }
      }, 100)
    }
  }, [showDocPreview])

  // Replace the body scroll lock useEffect with this simpler version
  useEffect(() => {
    if (showDocPreview) {
      // Scroll to top of page when modal opens
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Focus management - focus the modal
      const modal = document.querySelector('[role="dialog"]')
      if (modal) {
        ;(modal as HTMLElement).focus()
      }
    }
  }, [showDocPreview])

  // Add this useEffect for keyboard handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDocPreview) {
        closeDocPreview()
      }
    }

    if (showDocPreview) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showDocPreview])

  // Add these new functions
  const handlePreviewDocument = async () => {
    try {
      console.log("=== Starting document preview ===")
      setIsGeneratingDocument(true)

      // Helper to convert file/blob to base64
      const toBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
        })
      }

      // 1. Convert uploaded assets
      const staticAdsBase64 = await Promise.all(
        (wizardData.assets.staticAds || []).map(async (file: File) => ({
          name: file.name,
          dataURL: await toBase64(file),
        })),
      )
      const mockupScreenshotsBase64 = await Promise.all(
        (wizardData.assets.mockupScreenshots || []).map(async (file: File) => ({
          name: file.name,
          dataURL: await toBase64(file),
        })),
      )

      // 2. Fetch and convert pre-approved assets
      const preApprovedCreativeBase64 = await Promise.all(
        (wizardData.preApproved.selectedCreative || []).map(async (creativeId: string) => {
          const creative = preApprovedAssets.creative[creativeId]
          if (!creative) return null

          try {
            // creative.imageUrl is the public path like '/amex-creative-1.png'
            const response = await fetch(creative.imageUrl)
            if (!response.ok) {
              throw new Error(`Failed to fetch pre-approved creative: ${response.statusText}`)
            }
            const blob = await response.blob()
            const dataURL = await toBase64(blob)
            return {
              id: creativeId,
              title: creative.title,
              dataURL: dataURL,
            }
          } catch (error) {
            console.error(`Failed to process pre-approved creative ${creativeId}:`, error)
            return {
              id: creativeId,
              title: creative.title,
              dataURL: `/placeholder.svg?height=100&width=150&text=Error`, // Fallback
            }
          }
        }),
      )

      // 3. Construct final payload
      const wizardDataWithImages = {
        ...wizardData,
        assets: {
          ...wizardData.assets,
          staticAdsBase64,
          mockupScreenshotsBase64,
        },
        preApproved: {
          ...wizardData.preApproved,
          // Add the new base64 data here
          preApprovedCreativeBase64: preApprovedCreativeBase64.filter(Boolean),
        },
      }

      console.log("Sending request to API with all images as base64...")
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wizardData: wizardDataWithImages,
          format: "html",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        throw new Error(`API Error (${response.status}): ${errorData.message || errorData.error || "Unknown error"}`)
      }

      const htmlContent = await response.text()
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      setDocumentPreviewUrl(url)
      setShowDocPreview(true)
      console.log("Preview setup complete")
    } catch (error) {
      console.error("=== Error in handlePreviewDocument ===", error)
      toast({
        title: "Preview Failed",
        description: `Failed to generate document preview: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingDocument(false)
    }
  }

  const handleDownloadDocument = async (format: "pdf" | "docx" = "pdf") => {
    try {
      setIsGeneratingDocument(true)

      // Helper to convert file/blob to base64
      const toBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
        })
      }

      // 1. Convert uploaded assets
      const staticAdsBase64 = await Promise.all(
        (wizardData.assets.staticAds || []).map(async (file: File) => ({
          name: file.name,
          dataURL: await toBase64(file),
        })),
      )
      const mockupScreenshotsBase64 = await Promise.all(
        (wizardData.assets.mockupScreenshots || []).map(async (file: File) => ({
          name: file.name,
          dataURL: await toBase64(file),
        })),
      )

      // 2. Fetch and convert pre-approved assets
      const preApprovedCreativeBase64 = await Promise.all(
        (wizardData.preApproved.selectedCreative || []).map(async (creativeId: string) => {
          const creative = preApprovedAssets.creative[creativeId]
          if (!creative) return null
          try {
            const response = await fetch(creative.imageUrl)
            if (!response.ok) throw new Error("Failed to fetch pre-approved creative")
            const blob = await response.blob()
            const dataURL = await toBase64(blob)
            return { id: creativeId, title: creative.title, dataURL: dataURL }
          } catch (error) {
            console.error(`Failed to process pre-approved creative ${creativeId}:`, error)
            return { id: creativeId, title: creative.title, dataURL: "/placeholder.svg?text=Error" }
          }
        }),
      )

      // 3. Construct final payload
      const wizardDataWithImages = {
        ...wizardData,
        assets: {
          ...wizardData.assets,
          staticAdsBase64,
          mockupScreenshotsBase64,
        },
        preApproved: {
          ...wizardData.preApproved,
          preApprovedCreativeBase64: preApprovedCreativeBase64.filter(Boolean),
        },
      }

      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wizardData: wizardDataWithImages,
          format,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate document")
      }

      const htmlContent = await response.text()
      const newWindow = window.open("", "_blank")
      if (newWindow) {
        const updatedHtmlContent = htmlContent.replace(/<title>.*?<\/title>/, `<title>${customFilename}</title>`)
        newWindow.document.write(updatedHtmlContent)
        newWindow.document.close()
      } else {
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }

      onUpdate({
        docGenerated: true,
        submissionId,
        status: "pending_review",
      })

      toast({
        title: "Document Ready!",
        description: "The document has opened in a new tab. Use the 'Save as PDF' button in that window.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error generating document:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingDocument(false)
    }
  }

  const getDocumentFilename = (wizardData: WizardData) => {
    return `${wizardData.projectInfo.issuer.replace(/\s+/g, "-")}-${wizardData.projectInfo.cardProduct.replace(/\s+/g, "-")}-compliance-document`
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
          Review your submission details and generate a Word document for submission.
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
                  {getDisplayNames().getIssuerName(wizardData.projectInfo.issuer)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Card Product</div>
                <div className="text-base font-medium text-slate-800">
                  {getDisplayNames().getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-500">Submission Name</div>
                <div className="text-base font-medium text-slate-800">{wizardData.projectInfo.submissionName}</div>
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
                This introduction will appear at the beginning of your compliance document and should clearly state what
                you're requesting approval for.
              </div>
            </div>
          </div>

          {/* Submitted Assets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Submitted Assets</h3>

            {/* Primary Text */}
            {wizardData.assets.primaryText.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  Primary Text
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.primaryText.map((text, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-700">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headlines */}
            {wizardData.assets.headlines.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Headlines
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.headlines.map((headline, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-700">{headline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landing Page URLs */}
            {wizardData.assets.landingPageUrls.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Link className="h-4 w-4 text-blue-600" />
                  Landing Page URLs
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.landingPageUrls.map((url, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Static Ads */}
            {wizardData.assets.staticAds.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                  Static Ads
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wizardData.assets.staticAds.map((ad, index) => (
                    <div key={index} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="aspect-video bg-slate-200 rounded flex items-center justify-center mb-2">
                        <img
                          src={URL.createObjectURL(ad) || "/placeholder.svg"}
                          alt={`Ad ${index + 1}`}
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{ad.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mockup Screenshots */}
            {wizardData.assets.mockupScreenshots.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-indigo-600" />
                  Mockup Screenshots
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wizardData.assets.mockupScreenshots.map((screenshot, index) => (
                    <div key={index} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="aspect-video bg-slate-200 rounded flex items-center justify-center mb-2">
                        <img
                          src={URL.createObjectURL(screenshot) || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{screenshot.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Files */}
            {wizardData.assets.videoFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Video Files
                </h4>
                <div className="space-y-2">
                  {wizardData.assets.videoFiles.map((video, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{video.name}</p>
                        <p className="text-xs text-slate-500">{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Instructions */}
            {wizardData.assets.deliveryInstructions && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2">Delivery Instructions</h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">{wizardData.assets.deliveryInstructions}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pre-Approved Assets */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pre-Approved Assets</h3>

            {/* Pre-Approved Primary Text */}
            {wizardData.preApproved.selectedPrimaryText?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  Pre-Approved Primary Text ({wizardData.preApproved.selectedPrimaryText.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedPrimaryText.map((primaryId) => {
                    const primaryText = preApprovedAssets.primaryText[primaryId]
                    if (!primaryText) {
                      return (
                        <div key={primaryId} className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-sm text-slate-700">Primary text not found in database</p>
                        </div>
                      )
                    }
                    return (
                      <div key={primaryId} className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-slate-700">{primaryText}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="h-3 w-3 text-slate-400" />
                  </div>
                  Pre-Approved Primary Text
                </h4>
                <p className="text-sm text-slate-500 italic">No pre-approved primary text selected</p>
              </div>
            )}

            {/* Pre-Approved Headlines */}
            {wizardData.preApproved.selectedHeadlines?.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-orange-600" />
                  </div>
                  Pre-Approved Headlines ({wizardData.preApproved.selectedHeadlines.length})
                </h4>
                <div className="space-y-2">
                  {wizardData.preApproved.selectedHeadlines.map((headlineId) => {
                    const headline = preApprovedAssets.headlines[headlineId]
                    if (!headline) {
                      return (
                        <div key={headlineId} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <p className="text-sm text-slate-700">Headline not found in database</p>
                        </div>
                      )
                    }
                    return (
                      <div key={headlineId} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-sm text-slate-700">{headline}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="h-3 w-3 text-slate-400" />
                  </div>
                  Pre-Approved Headlines
                </h4>
                <p className="text-sm text-slate-500 italic">No pre-approved headlines selected</p>
              </div>
            )}

            {/* Pre-Approved Creative */}
            {wizardData.preApproved.selectedCreative.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                  </div>
                  Pre-Approved Creative ({wizardData.preApproved.selectedCreative.length})
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {wizardData.preApproved.selectedCreative.map((creativeId) => {
                    const creative = preApprovedAssets.creative[creativeId]
                    if (!creative) {
                      return (
                        <div key={creativeId} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-sm text-slate-700">Creative not found in database</p>
                        </div>
                      )
                    }
                    return (
                      <div key={creativeId} className="bg-blue-50 border border-blue-300 rounded-xl overflow-hidden">
                        <div className="relative aspect-square">
                          <img
                            src={creative.imageUrl || "/placeholder.svg"}
                            alt={creative.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="text-xs text-slate-600">
                            {creative.publisher} • {creative.cardProduct}
                          </div>
                          <div className="text-xs text-slate-500">
                            {creative.dimensions} • {creative.fileType} • {creative.fileSize}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="h-3 w-3 text-slate-400" />
                  </div>
                  Pre-Approved Creative
                </h4>
                <p className="text-sm text-slate-500 italic">No pre-approved creative selected</p>
              </div>
            )}

            {/* Pre-Approved URLs */}
            {wizardData.preApproved.selectedUrls.length > 0 ? (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-purple-600" />
                  </div>
                  Pre-Approved URLs ({wizardData.preApproved.selectedUrls.length})
                </h4>
                <div className="space-y-4">
                  {wizardData.preApproved.selectedUrls.map((urlId) => {
                    const url = preApprovedAssets.urls[urlId]
                    if (!url) {
                      return (
                        <div key={urlId} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <p className="text-sm text-slate-700">URL not found in database</p>
                        </div>
                      )
                    }
                    return (
                      <div key={urlId} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block truncate"
                        >
                          {url.url}
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="h-3 w-3 text-slate-400" />
                  </div>
                  Pre-Approved URLs
                </h4>
                <p className="text-sm text-slate-500 italic">No pre-approved URLs selected</p>
              </div>
            )}
          </div>

          {/* Compliance Summary */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Compliance Summary</h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <h4 className="text-base font-medium text-blue-800">Compliance Checks</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                {wizardData.complianceResults?.allPassed ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    All compliance checks passed
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <X className="h-4 w-4 text-red-600" />
                    Some compliance checks failed
                  </span>
                )}
              </p>
              <div className="text-xs text-blue-600 italic">
                Note: Compliance check details will not be included in the generated document.
              </div>
            </div>
          </div>

          {/* Preview Document Button */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePreviewDocument}
              disabled={isGeneratingDocument}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 py-2 px-4"
            >
              {isGeneratingDocument ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Preview Document"
              )}
            </button>

            <button
              onClick={() => handleDownloadDocument("pdf")}
              disabled={isGeneratingDocument}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 py-2 px-4"
            >
              {isGeneratingDocument ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Save as PDF
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
      <div className="flex justify-between p-8">
        <button
          onClick={onPrev}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-muted hover:bg-muted/80 h-10 py-2 px-4"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 py-2 px-4"
        >
          Next
        </button>
      </div>

      {/* Document Preview Modal */}
      {showDocPreview && documentPreviewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "0.5rem",
            paddingTop: "0.5rem",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDocPreview()
            }
          }}
        >
          <div
            className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden"
            style={{ height: "90vh" }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 id="modal-title" className="text-xl font-bold">
                Document Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadDocument("pdf")}
                  disabled={isGeneratingDocument}
                  className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded font-medium disabled:opacity-50 transition-colors"
                >
                  Save as PDF
                </button>
                <button
                  onClick={closeDocPreview}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 h-8 w-8"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <iframe
              src={documentPreviewUrl}
              className="w-full"
              style={{ height: "calc(90vh - 80px)" }}
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </Card>
  )
}
