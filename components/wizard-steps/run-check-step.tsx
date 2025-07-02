"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Clock, Play, ChevronLeft, ChevronRight } from "lucide-react"
import type { WizardData } from "../compliance-wizard"

interface ComplianceCheck {
  id: string
  name: string
  status: "pending" | "running" | "passed" | "warning" | "failed"
  description: string
  details?: string
}

interface RunCheckStepProps {
  wizardData: WizardData
  onUpdate: (results: ComplianceCheck[]) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
}

export function RunCheckStep({ wizardData, onUpdate, onNext, onPrev, onComplete }: RunCheckStepProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [checks, setChecks] = useState<ComplianceCheck[]>([
    {
      id: "1",
      name: "Logo Usage Guidelines",
      status: "pending",
      description: "Verify logo placement, sizing, and clear space requirements",
    },
    {
      id: "2",
      name: "Color Palette Compliance",
      status: "pending",
      description: "Check brand color usage and contrast ratios",
    },
    {
      id: "3",
      name: "Typography Standards",
      status: "pending",
      description: "Validate font usage and text hierarchy",
    },
    {
      id: "4",
      name: "Legal Disclaimers",
      status: "pending",
      description: "Ensure required legal text and disclaimers are present",
    },
    {
      id: "5",
      name: "Accessibility Standards",
      status: "pending",
      description: "Check WCAG compliance and accessibility requirements",
    },
    {
      id: "6",
      name: "Industry Regulations",
      status: "pending",
      description: "Verify compliance with industry-specific regulations",
    },
  ])

  const runComplianceCheck = async () => {
    setIsRunning(true)
    setProgress(0)

    // Simulate running checks
    for (let i = 0; i < checks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setProgress(((i + 1) / checks.length) * 100)

      setChecks((prev) =>
        prev.map((check, index) => {
          if (index === i) {
            // Simulate different outcomes
            const outcomes = ["passed", "warning", "failed"] as const
            const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)]

            return {
              ...check,
              status: randomOutcome,
              details: getCheckDetails(check.name, randomOutcome),
            }
          }
          if (index < i) return { ...check, status: check.status }
          if (index === i + 1) return { ...check, status: "running" }
          return check
        }),
      )
    }

    setIsRunning(false)
    onComplete()
    onUpdate(checks)
  }

  const getCheckDetails = (name: string, status: string) => {
    const details = {
      passed: "All requirements met successfully",
      warning: "Minor issues found - review recommended",
      failed: "Critical issues found - immediate attention required",
    }
    return details[status as keyof typeof details]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: "default",
      warning: "secondary",
      failed: "destructive",
      running: "outline",
      pending: "outline",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const completedChecks = checks.filter((check) => ["passed", "warning", "failed"].includes(check.status)).length
  const hasResults = completedChecks > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-6 w-6 text-blue-600" />
          Step 5: Run Compliance Check
        </CardTitle>
        <CardDescription>
          Execute automated compliance checks against your selected guidelines and rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Check Progress</h3>
            <span className="text-sm text-gray-600">
              {isRunning
                ? `Running... ${Math.round(progress)}% complete`
                : hasResults
                  ? `Completed ${completedChecks} of ${checks.length} checks`
                  : "Ready to run compliance checks"}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Run Button */}
        {!hasResults && (
          <div className="text-center">
            <Button onClick={runComplianceCheck} disabled={isRunning} size="lg" className="px-8">
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running Checks...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Compliance Check
                </>
              )}
            </Button>
          </div>
        )}

        {/* Individual Checks */}
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium">{check.name}</h4>
                    <p className="text-sm text-gray-600">{check.description}</p>
                    {check.details && <p className="text-sm text-gray-500 mt-1">{check.details}</p>}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} disabled={!hasResults}>
            Review Results
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
