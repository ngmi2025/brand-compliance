"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Clock, Play } from "lucide-react"

interface ComplianceCheck {
  id: string
  name: string
  status: "pending" | "running" | "passed" | "warning" | "failed"
  description: string
  details?: string
}

export default function CompliancePage() {
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

  const passedChecks = checks.filter((check) => check.status === "passed").length
  const warningChecks = checks.filter((check) => check.status === "warning").length
  const failedChecks = checks.filter((check) => check.status === "failed").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Compliance Check</h1>
            <p className="text-lg text-gray-600">Run automated compliance checks against your brand guidelines</p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Check Progress</CardTitle>
              <CardDescription>
                {isRunning
                  ? `Running compliance checks... ${Math.round(progress)}% complete`
                  : completedChecks > 0
                    ? `Completed ${completedChecks} of ${checks.length} checks`
                    : "Ready to run compliance checks"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />

                {completedChecks > 0 && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
                      <div className="text-sm text-green-700">Passed</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{warningChecks}</div>
                      <div className="text-sm text-yellow-700">Warnings</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{failedChecks}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  </div>
                )}

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
              </div>
            </CardContent>
          </Card>

          {/* Individual Checks */}
          <div className="space-y-4">
            {checks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(check.status)}
                      <div>
                        <h3 className="font-semibold">{check.name}</h3>
                        <p className="text-sm text-gray-600">{check.description}</p>
                        {check.details && <p className="text-sm text-gray-500 mt-1">{check.details}</p>}
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
