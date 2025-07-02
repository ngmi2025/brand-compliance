"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

import { ProjectSetupStep } from "./wizard-steps/project-setup-step"
import { SubmissionTypeStep } from "./wizard-steps/submission-type-step"
import { AssetUploadStep } from "./wizard-steps/asset-upload-step"
import { ComplianceReviewStep } from "./wizard-steps/compliance-review-step"
import { PreApprovedStep } from "./wizard-steps/pre-approved-step"
import { ReviewGenerateStep } from "./wizard-steps/review-generate-step" // Correct import
import { SaveDashboardStep } from "./wizard-steps/save-dashboard-step"

export interface WizardData {
  projectInfo: {
    issuer: string
    cardProduct: string
    submissionName: string
  }
  submissionType: {
    submissionType: string
  }
  assets: {
    staticAds: File[]
    primaryText: string[]
    headlines: string[]
    landingPageUrls: string[]
    mockupScreenshots: File[]
    videoFiles: File[] // Assuming this is still needed
    deliveryInstructions: string // Assuming this is still needed
    // For uploaded assets that get URLs from blob storage
    staticAdsUrls?: { name: string; url: string }[]
    mockupUrls?: { name: string; url: string }[]
    linkDescriptions: string[]
  }
  complianceResults: {
    checks?: any[] // Replace 'any' with actual type if known
    allPassed?: boolean
    summary?: string
  }
  preApproved: {
    selectedPrimaryText: string[]
    selectedHeadlines: string[]
    selectedCreative: string[]
    selectedUrls: string[]
    // For pre-approved assets that get URLs from blob storage
    preApprovedCreativeUrls?: { id: string; title: string; url: string }[]
  }
  submission: {
    // pdfGenerated?: boolean // Consider if this is still the best way to track
    docGenerated?: boolean // Added this from ReviewGenerateStep's onUpdate
    submissionId: string
    status: string
    // Potentially store document URLs here if generated and stored
    document?: {
      pdfUrl?: string | null
      htmlPreviewUrl?: string | null // if you store the blob URL for HTML preview
    }
  }
  // Fields for ReviewGenerateStep state
  introductionText?: string
  documentFilename?: string
}

const initialWizardData: WizardData = {
  projectInfo: { issuer: "", cardProduct: "", submissionName: "" },
  submissionType: { submissionType: "" },
  assets: {
    staticAds: [],
    primaryText: [],
    headlines: [],
    landingPageUrls: [],
    mockupScreenshots: [],
    videoFiles: [],
    deliveryInstructions: "",
    linkDescriptions: [],
  },
  complianceResults: { allPassed: false, checks: [], summary: "" },
  preApproved: { selectedPrimaryText: [], selectedHeadlines: [], selectedCreative: [], selectedUrls: [] },
  submission: { submissionId: `sub_${Date.now()}`, status: "draft", docGenerated: false },
  introductionText: "",
  documentFilename: "",
}

const steps = [
  { id: 1, title: "Select Issuer & Card", description: "Choose issuer and card product" },
  { id: 2, title: "Submission Type", description: "Select submission category" },
  { id: 3, title: "Upload & Enter Assets", description: "Add creative and copy assets" },
  { id: 4, title: "Compliance Review", description: "AI-powered compliance check" },
  { id: 5, title: "Pre-Approved Assets", description: "Add approved references" },
  { id: 6, title: "Review & Generate PDF", description: "Create submission document" },
  { id: 7, title: "Save to Dashboard", description: "Store and track submission" },
]

export default function ComplianceWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [wizardData, setWizardData] = useState<WizardData>(() => ({
    ...initialWizardData,
    submission: {
      ...initialWizardData.submission,
      submissionId: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    },
  }))

  useEffect(() => {
    // This effect can be used for loading saved data or other initializations if needed
    // For now, the initial state is set with a unique submissionId directly in useState
  }, [])

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData((prev) => {
      const updated = { ...prev }
      // Deep merge for nested objects like projectInfo, assets, etc.
      Object.keys(stepData).forEach((key) => {
        const K = key as keyof WizardData
        if (
          typeof prev[K] === "object" &&
          prev[K] !== null &&
          !Array.isArray(prev[K]) &&
          typeof stepData[K] === "object" &&
          stepData[K] !== null &&
          !Array.isArray(stepData[K])
        ) {
          updated[K] = { ...prev[K], ...stepData[K] } as WizardData[keyof WizardData]
        } else {
          updated[K] = stepData[K] as WizardData[keyof WizardData]
        }
      })
      return updated
    })
  }

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId].sort((a, b) => a - b))
    }
  }

  const goToStep = (stepId: number) => {
    if (stepId <= currentStep || completedSteps.includes(stepId - 1) || stepId === 1) {
      setCurrentStep(stepId)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      markStepComplete(currentStep)
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const resetWizardAndStartOver = () => {
    setWizardData({
      ...initialWizardData,
      submission: {
        ...initialWizardData.submission,
        submissionId: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      },
    })
    setCurrentStep(1)
    setCompletedSteps([])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectSetupStep
            data={wizardData.projectInfo}
            onUpdate={(data) => updateWizardData({ projectInfo: data })}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <SubmissionTypeStep
            data={wizardData.submissionType}
            onUpdate={(data) => updateWizardData({ submissionType: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <AssetUploadStep
            data={wizardData.assets}
            submissionType={wizardData.submissionType.submissionType}
            wizardData={wizardData}
            onUpdate={(data) => updateWizardData({ assets: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <ComplianceReviewStep
            wizardData={wizardData}
            onUpdate={(data) => updateWizardData({ complianceResults: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 5:
        return (
          <PreApprovedStep
            wizardData={wizardData}
            onUpdate={(data) => updateWizardData({ preApproved: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 6:
        return (
          <ReviewGenerateStep wizardData={wizardData} onUpdate={updateWizardData} onNext={nextStep} onPrev={prevStep} />
        )
      case 7:
        return (
          <SaveDashboardStep
            wizardData={wizardData}
            onComplete={() => {
              markStepComplete(7) /* Potentially reset or navigate */
            }}
            onPrev={prevStep}
            onStartNew={resetWizardAndStartOver}
          />
        )
      default:
        return null
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/upgraded-points-logo.png" alt="UpgradedPoints" className="h-8 w-auto" />
              <div className="h-6 w-px bg-white/30"></div>
              <span className="text-white/80 font-medium">Brand Compliance Tools</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Brand Ads Compliance Document Generator</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Create fully compliant brand advertising submissions for card issuers in a guided, auditable flow.
            </p>
          </div>

          <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-800">Submission Progress</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    Step {currentStep} of {steps.length}
                  </span>
                </div>
              </div>
              <CardDescription className="text-slate-600">
                {steps[currentStep - 1]?.title}: {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`text-center cursor-pointer transition-all duration-300 p-2 rounded-lg ${step.id === currentStep ? "scale-105 shadow-lg bg-blue-50" : completedSteps.includes(step.id) ? "opacity-80 hover:opacity-100 bg-green-50" : "opacity-60 hover:opacity-80 bg-slate-50"} ${step.id > currentStep && !completedSteps.includes(step.id - 1) && step.id !== 1 ? "cursor-not-allowed opacity-40" : ""}`}
                      onClick={() => goToStep(step.id)}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl flex items-center justify-center mb-1 sm:mb-2 transition-all duration-300 shadow-md ${step.id === currentStep ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : completedSteps.includes(step.id) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}
                      >
                        {completedSteps.includes(step.id) && step.id !== currentStep ? (
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <span className="font-semibold text-sm sm:text-base">{step.id}</span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-700">{step.title}</div>
                      <div className="text-xs text-slate-500 hidden md:block mt-0.5">{step.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">{renderCurrentStep()}</div>

          <footer className="mt-8 pt-4 border-t border-white/20 text-center">
            <p className="text-white/60 text-sm space-x-2">
              <span>Powered by UpgradedPoints.com</span>
              <span>-</span>
              <Link href="/reports" className="font-bold text-white hover:text-blue-200 underline">
                Dashboard
              </Link>
              <span>|</span>
              <Link href="/admin" className="font-bold text-white hover:text-blue-200 underline">
                Access Admin Panel
              </Link>
              <span>|</span>
              <button
                onClick={() => alert("Logout functionality to be implemented.")}
                className="font-bold text-white hover:text-blue-200 underline bg-transparent border-none cursor-pointer p-0"
              >
                Logout
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
