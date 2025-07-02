"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"

interface ComplianceCheck {
  id: string
  name: string
  status: "pending" | "running" | "passed" | "warning" | "failed"
  description: string
  details?: string
}

interface ReviewResultsStepProps {
  results: ComplianceCheck[]
  onNext: () => void
  onPrev: () => void
}

export function ReviewResultsStep({ results, onNext, onPrev }: ReviewResultsStepProps) {
  const passedChecks = results.filter((check) => check.status === "passed").length
  const warningChecks = results.filter((check) => check.status === "warning").length
  const failedChecks = results.filter((check) => check.status === "failed").length
  const totalChecks = results.length

  const overallScore = Math.round(((passedChecks + warningChecks * 0.5) / totalChecks) * 100)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: "default",
      warning: "secondary",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Step 6: Review Compliance Results
        </CardTitle>
        <CardDescription>Review the detailed results of your compliance check and identify any issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>{overallScore}%</div>
          <p className="text-lg font-medium text-gray-700">Overall Compliance Score</p>
          <p className="text-sm text-gray-600 mt-1">Based on {totalChecks} compliance checks</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
            <div className="text-sm text-green-700">Passed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{warningChecks}</div>
            <div className="text-sm text-yellow-700">Warnings</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{failedChecks}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div>
          <h3 className="font-medium mb-4">Detailed Results</h3>
          <div className="space-y-3">
            {results.map((check) => (
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
        </div>

        {/* Recommendations */}
        {(warningChecks > 0 || failedChecks > 0) && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Recommendations</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {failedChecks > 0 && <li>• Address all failed checks before proceeding with your campaign</li>}
              {warningChecks > 0 && <li>• Review warning items to ensure they meet your brand standards</li>}
              <li>• Consider updating your brand guidelines based on these findings</li>
            </ul>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2">
            Generate Report
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
