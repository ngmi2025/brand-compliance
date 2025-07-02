"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  FileText,
  Info,
  Target,
  ChevronDown,
  ChevronUp,
  MinusCircle,
} from "lucide-react"
import type { WizardData } from "../compliance-wizard"
import { useToast } from "@/hooks/use-toast"
import { runComplianceChecks } from "@/lib/ai-compliance-service"
import { complianceChecks } from "@/lib/compliance-rules"

interface ComplianceReviewStepProps {
  wizardData: WizardData
  onUpdate: (data: { complianceResults: any }) => void
  onNext: () => void
  onPrev: () => void
}

export function ComplianceReviewStep({ wizardData, onUpdate, onNext, onPrev }: ComplianceReviewStepProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [skipCompliance, setSkipCompliance] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const runChecks = async () => {
    if (skipCompliance) {
      // Generate mock passing results if skipping compliance
      const mockResults = {
        checks: [
          {
            rule: "Logo Detection",
            message: "No American Express logo detected. This is acceptable if branding is not required.",
            status: "not_applicable",
            category: "logoUsage",
            assessmentConfidence: 95,
            passConfidence: 100,
          },
          {
            rule: "Logo Size",
            message: "Logo size check not applicable - no American Express logo present.",
            status: "not_applicable",
            category: "logoUsage",
            assessmentConfidence: 100,
            passConfidence: 100,
          },
          {
            rule: "Logo Clear Space",
            message: "Clear space check not applicable - no American Express logo present.",
            status: "not_applicable",
            category: "logoUsage",
            assessmentConfidence: 100,
            passConfidence: 100,
          },
          {
            rule: "Logo Modifications",
            message: "Logo modification check not applicable - no American Express logo present.",
            status: "not_applicable",
            category: "logoUsage",
            assessmentConfidence: 100,
            passConfidence: 100,
          },
          {
            rule: "Brand Color Usage",
            message: "Brand color check not applicable - no American Express logo present.",
            status: "not_applicable",
            category: "colorPalette",
            assessmentConfidence: 100,
            passConfidence: 100,
          },
          {
            rule: "Copy Guidelines",
            message:
              '"American Express Card" is not abbreviated, "Card" is capitalized, and preferred phrases are contextually appropriate.',
            status: "passed",
            category: "legalRequirements",
            assessmentConfidence: 90,
            passConfidence: 90,
          },
          {
            rule: "Trademark Usage",
            message: "The ® symbol is used correctly with the American Express name.",
            status: "passed",
            category: "legalRequirements",
            assessmentConfidence: 100,
            passConfidence: 95,
          },
          {
            rule: "Regulatory Compliance",
            message: "Financial disclosures are present where required, content is truthful and not misleading.",
            status: "passed",
            category: "industryRegulations",
            assessmentConfidence: 85,
            passConfidence: 90,
          },
          {
            rule: "Typography Standards",
            message: "Typography follows American Express font guidelines with proper hierarchy.",
            status: "warning",
            category: "designStandards",
            assessmentConfidence: 60,
            passConfidence: 70,
          },
          {
            rule: "Accessibility Standards",
            message: "Content meets most WCAG 2.1 AA accessibility standards but could be improved.",
            status: "warning",
            category: "accessibilityCompliance",
            assessmentConfidence: 75,
            passConfidence: 65,
          },
        ],
        isDemo: true,
      }

      setResults(mockResults)
      onUpdate({ complianceResults: mockResults })

      toast({
        title: "Compliance Check Skipped",
        description: "All checks marked as passed for testing purposes.",
        variant: "default",
      })

      return
    }

    setIsRunning(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Run actual compliance checks
      const { results: checkResults, isDemo } = await runComplianceChecks({
        staticAds: wizardData.assets?.staticAds || [],
        primaryText: wizardData.assets?.primaryText || [],
        headlines: wizardData.assets?.headlines || [],
        landingPageUrls: wizardData.assets?.landingPageUrls || [],
      })

      clearInterval(progressInterval)
      setProgress(100)

      // Format results for display
      const formattedResults = {
        checks: checkResults,
        isDemo,
      }

      setResults(formattedResults)
      onUpdate({ complianceResults: formattedResults })

      toast({
        title: "Compliance Check Complete",
        description: isDemo
          ? "Demo results generated. Connect your API key for real analysis."
          : "All assets have been analyzed for compliance.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error running compliance checks:", error)

      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : "There was a problem analyzing your assets."

      toast({
        title: "Compliance Check Failed",
        description: errorMessage,
        variant: "destructive",
      })

      // Set a special error state
      setResults({ error: true, message: errorMessage })
    } finally {
      setIsRunning(false)
    }
  }

  const toggleExpandedResult = (checkId: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(checkId)) {
      newExpanded.delete(checkId)
    } else {
      newExpanded.add(checkId)
    }
    setExpandedResults(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "not_applicable":
        return <MinusCircle className="h-5 w-5 text-slate-400" />
      case "pending":
        return <Clock className="h-5 w-5 text-slate-400" />
      case "running":
        return <Play className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "passed":
        return "border-l-emerald-500"
      case "warning":
        return "border-l-amber-500"
      case "failed":
        return "border-l-red-500"
      case "not_applicable":
        return "border-l-slate-300"
      default:
        return "border-l-slate-300"
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-emerald-700"
      case "warning":
        return "text-amber-700"
      case "failed":
        return "text-red-700"
      case "not_applicable":
        return "text-slate-600"
      default:
        return "text-slate-700"
    }
  }

  const getProgressBarColor = (value: number, type: "assessment" | "pass") => {
    if (type === "assessment") {
      // Assessment confidence: Blue gradient based on confidence level
      if (value >= 80) return "bg-blue-600"
      if (value >= 60) return "bg-blue-500"
      if (value >= 40) return "bg-blue-400"
      return "bg-blue-300"
    } else {
      // Pass likelihood: Green/Amber/Red based on likelihood
      if (value >= 70) return "bg-emerald-500"
      if (value >= 40) return "bg-amber-500"
      return "bg-red-500"
    }
  }

  const getComplianceStats = () => {
    if (!results || !results.checks || results.checks.length === 0) {
      return { passed: 0, warnings: 0, failed: 0, notApplicable: 0, total: 0 }
    }

    const checks = results.checks

    return {
      passed: checks.filter((c: any) => c.status === "passed").length,
      warnings: checks.filter((c: any) => c.status === "warning").length,
      failed: checks.filter((c: any) => c.status === "failed").length,
      notApplicable: checks.filter((c: any) => c.status === "not_applicable").length,
      total: checks.length,
    }
  }

  const stats = getComplianceStats()

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Compliance Review</div>
            <div className="text-sm font-normal text-slate-600 mt-1">Step 4 of 7</div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-600 mt-3">
          Run automated compliance checks against your assets to ensure they meet brand guidelines.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        {!results ? (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Compliance Check Preview</p>
                  <p className="text-sm text-blue-700 mt-1">
                    The following checks will be performed on your assets to ensure compliance with{" "}
                    {wizardData.publisher || "American Express"} brand guidelines.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Compliance Checks to be Performed</h3>
              {complianceChecks.map((check, index) => (
                <div key={index} className="p-4 rounded-xl border bg-slate-50 text-slate-600 border-slate-200">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-700">{check.name}</div>
                      <div className="text-sm mt-1">{check.description}</div>
                      <div className="text-xs mt-2 px-2 py-1 bg-slate-200 text-slate-600 rounded-md inline-block">
                        Category: {check.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-6">
              <Button
                onClick={runChecks}
                className="px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                <Play className="h-5 w-5 mr-2" />
                Run Compliance Check
              </Button>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="skip-compliance"
                checked={skipCompliance}
                onCheckedChange={(checked) => setSkipCompliance(checked === true)}
              />
              <label
                htmlFor="skip-compliance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Skip compliance check (testing only - all checks will pass)
              </label>
            </div>

            {isRunning ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800">Running Compliance Checks</h3>
                  <p className="text-sm text-slate-600 mt-1">Please wait while we analyze your assets...</p>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="text-center text-sm text-slate-600">
                  {progress < 30 && "Initializing analysis..."}
                  {progress >= 30 && progress < 60 && "Analyzing logo usage and color palette..."}
                  {progress >= 60 && progress < 90 && "Checking text content and trademark usage..."}
                  {progress >= 90 && "Finalizing results..."}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : results.error ? (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Compliance Check Failed</p>
                  <p className="text-sm text-red-700 mt-1">{results.message}</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600">
                You can skip the compliance check to continue with the wizard, or try running the check again after
                configuring your API key.
              </p>

              <div className="flex gap-4 justify-center">
                <Button onClick={runChecks} variant="outline" className="px-6 py-2">
                  <Play className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setSkipCompliance(true)
                    setResults(null)
                    toast({
                      title: "Compliance Check Skipped",
                      description: "You can continue without running compliance checks.",
                      variant: "default",
                    })
                  }}
                  className="px-6 py-2"
                >
                  Skip and Continue
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">{stats.passed}</div>
                <div className="text-sm text-emerald-600">Passed</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
                <div className="text-2xl font-bold text-amber-700">{stats.warnings}</div>
                <div className="text-sm text-amber-600">Warnings</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center border border-red-100">
                <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-700">{stats.notApplicable}</div>
                <div className="text-sm text-slate-600">N/A</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
            </div>

            {results.isDemo && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Demo Mode Active</p>
                    <p className="text-sm text-amber-700 mt-1">
                      These are sample results. Connect your OpenAI API key in the settings to run real compliance
                      checks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Compliance Check Results</h3>
                <div className="text-xs text-slate-500">
                  Assessment = AI analysis quality | Pass = Compliance likelihood
                </div>
              </div>
              {results.checks.map((check: any, index: number) => (
                <div
                  key={index}
                  className={`bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 ${getStatusBorderColor(check.status)}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(check.status)}

                      {/* Left side - Main content */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold ${getStatusTextColor(check.status)} mb-2`}>
                          {check.rule || check.name}
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed pr-4">
                          {check.message || check.details}
                        </div>

                        {check.actionableSteps && check.actionableSteps.length > 0 && (
                          <div className="mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandedResult(check.id)}
                              className="p-0 h-auto text-sm text-slate-600 hover:text-slate-800 font-medium"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              {expandedResults.has(check.id) ? "Hide" : "Show"} Action Steps
                              {expandedResults.has(check.id) ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Right side - Confidence metrics */}
                      {(check.assessmentConfidence !== undefined || check.passConfidence !== undefined) && (
                        <div className="flex-shrink-0 w-48 space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-slate-600">Assessment Confidence</span>
                              <span className="text-xs font-semibold text-slate-700">
                                {check.assessmentConfidence || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(check.assessmentConfidence || 0, "assessment")}`}
                                style={{ width: `${check.assessmentConfidence || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-slate-600">Pass Likelihood</span>
                              <span className="text-xs font-semibold text-slate-700">{check.passConfidence || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(check.passConfidence || 0, "pass")}`}
                                style={{ width: `${check.passConfidence || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded action steps */}
                    {expandedResults.has(check.id) && check.actionableSteps && check.actionableSteps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-sm font-medium text-slate-700 mb-3">Recommended Actions:</div>
                          <ul className="text-sm text-slate-600 space-y-2">
                            {check.actionableSteps.map((step: string, stepIndex: number) => (
                              <li key={stepIndex} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button onClick={runChecks} variant="outline" className="px-6 py-2">
                <Play className="h-4 w-4 mr-2" />
                Run Check Again
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-slate-100 mt-8">
          <Button
            variant="outline"
            onClick={onPrev}
            className="px-6 py-3 border-slate-300 hover:bg-slate-50 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={(!results || results.error) && !skipCompliance}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white flex items-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
