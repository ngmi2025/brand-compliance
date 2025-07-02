"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ChevronLeft, CheckCircle, Calendar, User } from "lucide-react"
import type { WizardData } from "../compliance-wizard"

interface GenerateReportStepProps {
  wizardData: WizardData
  onUpdate: (generated: boolean) => void
  onPrev: () => void
  onComplete: () => void
}

export function GenerateReportStep({ wizardData, onUpdate, onPrev, onComplete }: GenerateReportStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(wizardData.reportGenerated)

  const generateReport = async () => {
    setIsGenerating(true)

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setReportGenerated(true)
    onUpdate(true)
    onComplete()
    setIsGenerating(false)
  }

  const passedChecks = wizardData.checkResults.filter((check: any) => check.status === "passed").length
  const totalChecks = wizardData.checkResults.length
  const overallScore = Math.round((passedChecks / totalChecks) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Step 7: Generate Compliance Report
        </CardTitle>
        <CardDescription>
          Create a comprehensive compliance report with all findings and recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Preview */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold mb-4">Report Summary</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Campaign:</span>
                <span>{wizardData.projectInfo.campaignName || "Untitled Campaign"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Assets Checked:</span>
                <span>{wizardData.uploadedFiles.length} files</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Overall Score:</span>
                <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
                  {overallScore}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Total Checks:</span>
                <span>{totalChecks}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={overallScore >= 80 ? "default" : "secondary"}>
                  {overallScore >= 80 ? "Compliant" : "Needs Review"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Report Contents */}
        <div>
          <h3 className="font-medium mb-3">Report Contents</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Executive Summary</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Detailed Compliance Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Asset Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Recommendations & Action Items</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Compliance Certification</span>
            </div>
          </div>
        </div>

        {/* Generate/Download Section */}
        {!reportGenerated ? (
          <div className="text-center">
            <Button onClick={generateReport} disabled={isGenerating} size="lg" className="px-8">
              {isGenerating ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-pulse" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Compliance Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800">Report Generated Successfully!</p>
              <p className="text-sm text-green-600">Your compliance report is ready for download.</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                View Online
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {reportGenerated && <Button onClick={() => window.location.reload()}>Start New Check</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
