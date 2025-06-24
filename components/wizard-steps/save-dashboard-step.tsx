"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CheckCircle, BarChart3, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { WizardData } from "../compliance-wizard" // Assuming WizardData is exported from here

// Define a type for saved submissions for better structure in localStorage
export interface SavedSubmission {
  id: string
  name: string
  issuer: string
  cardProduct: string
  submissionType: string
  status: string
  savedAt: string
  wizardDataSnapshot: WizardData // Store the whole snapshot for future use
}

// Helper function to get issuer display name
const getIssuerDisplayName = (issuerKey: string, wizardData: WizardData) => {
  const issuers: Record<string, string> = {
    "american-express": "American Express",
    chase: "Chase",
    "capital-one": "Capital One",
    citi: "Citi",
    discover: "Discover",
  }
  return issuers[issuerKey as keyof typeof issuers] || issuerKey
}

// Helper function to get card product display name
const getCardProductDisplayName = (issuerKey: string, cardKey: string, wizardData: WizardData) => {
  if (issuerKey === "american-express") {
    const cards: Record<string, string> = {
      "amex-gold": "Gold Card",
      "amex-platinum": "Platinum Card",
      "amex-green": "Green Card",
      "amex-blue-cash": "Blue Cash Preferred",
      "amex-business-gold": "Business Gold Card",
      "amex-business-platinum": "Business Platinum Card",
    }
    return cards[cardKey as keyof typeof cards] || cardKey
  }
  if (issuerKey === "chase") {
    const cards: Record<string, string> = {
      "chase-sapphire-preferred": "Sapphire Preferred",
      "chase-sapphire-reserve": "Sapphire Reserve",
      "chase-freedom-unlimited": "Freedom Unlimited",
      "chase-freedom-flex": "Freedom Flex",
      "chase-ink-business": "Ink Business Preferred",
    }
    return cards[cardKey as keyof typeof cards] || cardKey
  }
  return cardKey
}

// Helper function to get submission type display name
const getSubmissionTypeDisplayName = (typeKey: string, wizardData: WizardData) => {
  const types: Record<string, string> = {
    "full-campaign": "Full Campaign",
    "new-creative-only": "New Creative Only",
    "new-primary-text": "New Primary Text",
    "headline-text": "Headline Text",
    "headline-primary": "Headline + Primary",
    "motion-graphic": "Motion Graphic",
  }
  return types[typeKey as keyof typeof types] || typeKey
}

export function SaveDashboardStep({ wizardData, onComplete, onPrev }: SaveDashboardStepProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter() // Initialize router

  const currentIssuerName = getIssuerDisplayName(wizardData.projectInfo.issuer, wizardData)
  const currentCardName = getCardProductDisplayName(
    wizardData.projectInfo.issuer,
    wizardData.projectInfo.cardProduct,
    wizardData,
  )
  const currentSubmissionTypeName = getSubmissionTypeDisplayName(wizardData.submissionType.submissionType, wizardData)

  const saveSubmission = async () => {
    setIsSaving(true)

    // Actual saving to localStorage
    try {
      const existingSubmissionsRaw = localStorage.getItem("brandComplianceSubmissions")
      const existingSubmissions: SavedSubmission[] = existingSubmissionsRaw ? JSON.parse(existingSubmissionsRaw) : []

      const newSubmission: SavedSubmission = {
        id: wizardData.submission.submissionId,
        name: wizardData.projectInfo.submissionName,
        issuer: currentIssuerName,
        cardProduct: currentCardName,
        submissionType: currentSubmissionTypeName,
        status: "Saved",
        savedAt: new Date().toISOString(),
        wizardDataSnapshot: JSON.parse(JSON.stringify(wizardData)), // Deep copy wizardData
      }

      existingSubmissions.push(newSubmission)
      localStorage.setItem("brandComplianceSubmissions", JSON.stringify(existingSubmissions))

      setSaved(true)
      if (onComplete) onComplete()
    } catch (error) {
      console.error("Failed to save submission to localStorage:", error)
      // Handle error appropriately, maybe show a toast message
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push("/reports")
  }

  const handleViewSubmission = () => {
    // For Phase 2: Navigate to a specific submission view page
    // For now, it can also go to the dashboard or be disabled
    router.push(`/reports#${wizardData.submission.submissionId}`) // Simple navigation for now
  }

  const handleCreateNewSubmission = () => {
    // A more robust reset would involve calling a function from props to reset wizardData in parent
    // and navigate to step 1. For now, reload is a simple way.
    window.location.reload()
  }

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Step 7: Save to Dashboard
        </CardTitle>
        <CardDescription className="text-slate-600">
          Save your submission to the internal dashboard for tracking and future reference.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!saved ? (
          <>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-700">Submission Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Submission ID</h4>
                    <p className="font-medium text-slate-700">{wizardData.submission.submissionId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Date</h4>
                    <p className="font-medium text-slate-700">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Issuer & Card</h4>
                    <p className="font-medium text-slate-700">
                      {currentIssuerName} - {currentCardName}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Submission Type</h4>
                    <p className="font-medium text-slate-700">{currentSubmissionTypeName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Submission Name</h4>
                    <p className="font-medium text-slate-700">{wizardData.projectInfo.submissionName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Status</h4>
                    <Badge variant="secondary">Ready to Save</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Button
                onClick={saveSubmission}
                disabled={isSaving}
                size="lg"
                className="px-8 bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Saving Submission...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Save to Dashboard
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Submission Saved Successfully!</h3>
              <p className="text-slate-600 mb-6">
                Your submission has been saved to the dashboard and is ready for review.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGoToDashboard} className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button variant="outline" size="lg" onClick={handleViewSubmission}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Submission
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <Button variant="outline" onClick={handleCreateNewSubmission}>
                Create New Submission
              </Button>
            </div>
          </div>
        )}

        {!saved && (
          <div className="flex justify-start pt-4">
            <Button variant="outline" onClick={onPrev} disabled={isSaving}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SaveDashboardStepProps {
  wizardData: WizardData
  onComplete?: () => void // Made optional as it's just marking step complete
  onPrev: () => void
}
