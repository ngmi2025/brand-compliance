"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

// Import step components
import { ProjectSetupStep } from "./wizard-steps/project-setup-step"
import { SubmissionTypeStep } from "./wizard-steps/submission-type-step"
import { AssetUploadStep } from "./wizard-steps/asset-upload-step"
import { ComplianceReviewStep } from "./wizard-steps/compliance-review-step"
import { PreApprovedStep } from "./wizard-steps/pre-approved-step"
import { ReviewGenerateStep } from "./wizard-steps/review-generate-step"
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
    videoFiles: File[]
    deliveryInstructions: string
  }
  complianceResults: {
    checks: any[]
    allPassed: boolean
  }
  preApproved: {
    selectedPrimaryText: string[]
    selectedHeadlines: string[]
    selectedCreative: string[]
    selectedUrls: string[]
  }
  submission: {
    pdfGenerated: boolean
    submissionId: string
    status: string
  }
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
  const [wizardData, setWizardData] = useState<WizardData>({
    projectInfo: {
      issuer: "",
      cardProduct: "",
      submissionName: "",
    },
    submissionType: {
      submissionType: "",
    },
    assets: {
      staticAds: [],
      primaryText: [],
      headlines: [],
      landingPageUrls: [],
      mockupScreenshots: [],
      videoFiles: [],
      deliveryInstructions: "",
    },
    complianceResults: {
      checks: [],
      allPassed: false,
    },
    preApproved: {
      selectedPrimaryText: [],
      selectedHeadlines: [],
      selectedCreative: [],
      selectedUrls: [],
    },
    submission: {
      pdfGenerated: false,
      submissionId: "",
      status: "draft",
    },
  })

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData((prev) => {
      // Deep merge to ensure nested objects are properly updated
      const updated = { ...prev }
      Object.keys(stepData).forEach((key) => {
        if (stepData[key as keyof WizardData] && typeof stepData[key as keyof WizardData] === "object") {
          updated[key as keyof WizardData] = {
            ...updated[key as keyof WizardData],
            ...stepData[key as keyof WizardData],
          }
        } else {
          updated[key as keyof WizardData] = stepData[key as keyof WizardData] as any
        }
      })
      return updated
    })
  }

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId])
    }
  }

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId)
    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      markStepComplete(currentStep)
      setCurrentStep(currentStep + 1)
      // Scroll to top when going to next step
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Scroll to top when going to previous step
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
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
            wizardData={wizardData} // Pass the full wizardData to access card info
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
          <ReviewGenerateStep
            wizardData={wizardData}
            onUpdate={(data) => updateWizardData({ submission: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 7:
        return <SaveDashboardStep wizardData={wizardData} onComplete={() => markStepComplete(7)} onPrev={prevStep} />
      default:
        return null
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with UpgradedPoints Branding */}
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

          {/* Progress Section */}
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

                {/* Step Navigation */}
                <div className="grid grid-cols-7 gap-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`text-center cursor-pointer transition-all duration-300 ${
                        step.id === currentStep
                          ? "scale-105"
                          : completedSteps.includes(step.id)
                            ? "opacity-75 hover:opacity-100"
                            : "opacity-50 hover:opacity-75"
                      }`}
                      onClick={() => goToStep(step.id)}
                    >
                      <div
                        className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                          step.id === currentStep
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                            : completedSteps.includes(step.id)
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <span className="font-semibold">{step.id}</span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-700">{step.title}</div>
                      <div className="text-xs text-slate-500 hidden sm:block mt-1">{step.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Step Content */}
          <div className="mb-8">{renderCurrentStep()}</div>
        </div>
      </div>
    </div>
  )
}
