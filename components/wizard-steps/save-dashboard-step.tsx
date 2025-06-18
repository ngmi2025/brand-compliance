"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CheckCircle, BarChart3, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { WizardData } from "../compliance-wizard"

interface SaveDashboardStepProps {
  wizardData: WizardData
  onComplete: () => void
  onPrev: () => void
}

export function SaveDashboardStep({ wizardData, onComplete, onPrev }: SaveDashboardStepProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveSubmission = async () => {
    setIsSaving(true)

    // Simulate saving to database
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSaved(true)
    setIsSaving(false)
    onComplete()
  }

  const getIssuerName = () => {
    const issuers: Record<string, string> = {
      "american-express": "American Express",
      chase: "Chase",
      "capital-one": "Capital One",
      citi: "Citi",
      discover: "Discover",
    }
    return issuers[wizardData.projectInfo.issuer as keyof typeof issuers] || wizardData.projectInfo.issuer
  }

  const getCardName = () => {
    const issuerKey = wizardData.projectInfo.issuer
    const cardKey = wizardData.projectInfo.cardProduct

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

  const getSubmissionTypeName = () => {
    const types: Record<string, string> = {
      "full-campaign": "Full Campaign",
      "new-creative-only": "New Creative Only",
      "new-primary-text": "New Primary Text",
      "headline-text": "Headline Text",
      "headline-primary": "Headline + Primary",
      "motion-graphic": "Motion Graphic",
    }
    return (
      types[wizardData.submissionType.submissionType as keyof typeof types] || wizardData.submissionType.submissionType
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Step 7: Save to Dashboard
        </CardTitle>
        <CardDescription>
          Save your submission to the internal dashboard for tracking and future reference.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!saved ? (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-semibold">Submission Details</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submission ID</h4>
                    <p className="font-medium">{wizardData.submission.submissionId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Issuer & Card</h4>
                    <p className="font-medium">
                      {getIssuerName()} - {getCardName()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submission Type</h4>
                    <p className="font-medium">{getSubmissionTypeName()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submission Name</h4>
                    <p className="font-medium">{wizardData.projectInfo.submissionName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <Badge>Draft</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={saveSubmission} disabled={isSaving} size="lg" className="px-8">
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
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Submission Saved Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your submission has been saved to the dashboard and is ready for review.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button variant="outline" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Submission
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Create New Submission
              </Button>
            </div>
          </div>
        )}

        {!saved && (
          <div className="flex justify-start">
            <Button variant="outline" onClick={onPrev}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
