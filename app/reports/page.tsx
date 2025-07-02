"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Download, Eye, Calendar, FileText, ListChecks, ExternalLink, Search, Filter, Info } from "lucide-react"
import type { SavedSubmission } from "@/components/wizard-steps/save-dashboard-step"
import type { WizardData as WizardDataType } from "@/components/compliance-wizard" // Corrected import source
import Link from "next/link"
import { Label } from "@/components/ui/label"

export default function ReportsPage() {
  const [allSavedReports, setAllSavedReports] = useState<SavedSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIssuer, setSelectedIssuer] = useState("all")
  const [selectedCard, setSelectedCard] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedReportForView, setSelectedReportForView] = useState<SavedSubmission | null>(null)

  useEffect(() => {
    try {
      const submissionsRaw = localStorage.getItem("brandComplianceSubmissions")
      if (submissionsRaw) {
        const parsedSubmissions: SavedSubmission[] = JSON.parse(submissionsRaw)
        const properlyParsedSubmissions = parsedSubmissions.map((sub) => {
          if (typeof sub.wizardDataSnapshot === "string") {
            try {
              return { ...sub, wizardDataSnapshot: JSON.parse(sub.wizardDataSnapshot) as WizardDataType }
            } catch (e) {
              console.error("Failed to parse wizardDataSnapshot for submission:", sub.id, e)
              return { ...sub, wizardDataSnapshot: {} as WizardDataType } // Fallback to empty object
            }
          }
          return sub
        })
        properlyParsedSubmissions.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        setAllSavedReports(properlyParsedSubmissions)
      }
    } catch (error) {
      console.error("Failed to load submissions from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uniqueIssuers = useMemo(() => ["all", ...new Set(allSavedReports.map((r) => r.issuer))], [allSavedReports])
  const uniqueCards = useMemo(() => {
    const cards = allSavedReports
      .filter((r) => selectedIssuer === "all" || r.issuer === selectedIssuer)
      .map((r) => r.cardProduct)
    return ["all", ...new Set(cards)]
  }, [allSavedReports, selectedIssuer])

  const uniqueYears = useMemo(() => {
    const years = new Set(allSavedReports.map((r) => new Date(r.savedAt).getFullYear().toString()))
    return ["all", ...Array.from(years).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))]
  }, [allSavedReports])

  const uniqueMonths = useMemo(() => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const months = new Set(
      allSavedReports
        .filter((r) => selectedYear === "all" || new Date(r.savedAt).getFullYear().toString() === selectedYear)
        .map((r) => new Date(r.savedAt).getMonth()),
    )
    return [
      "all",
      ...Array.from(months)
        .sort((a, b) => a - b)
        .map((m) => ({ value: (m + 1).toString(), label: monthNames[m] })),
    ]
  }, [allSavedReports, selectedYear])

  const filteredReports = useMemo(() => {
    return allSavedReports.filter((report) => {
      const searchMatch = report.name.toLowerCase().includes(searchTerm.toLowerCase())
      const issuerMatch = selectedIssuer === "all" || report.issuer === selectedIssuer
      const cardMatch = selectedCard === "all" || report.cardProduct === selectedCard
      const yearMatch = selectedYear === "all" || new Date(report.savedAt).getFullYear().toString() === selectedYear
      const monthMatch =
        selectedMonth === "all" || (new Date(report.savedAt).getMonth() + 1).toString() === selectedMonth
      return searchMatch && issuerMatch && cardMatch && yearMatch && monthMatch
    })
  }, [allSavedReports, searchTerm, selectedIssuer, selectedCard, selectedMonth, selectedYear])

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "saved":
      case "completed":
        return "default"
      case "in progress":
      case "draft":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleViewSubmission = (report: SavedSubmission) => {
    setSelectedReportForView(report)
    setIsViewModalOpen(true)
  }

  const handleDownloadPdf = (report: SavedSubmission) => {
    const wizardData = report.wizardDataSnapshot // Already cast to WizardDataType in useEffect
    const pdfUrl = wizardData?.submission?.document?.pdfUrl
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    } else {
      alert(
        "PDF not available for this submission or download from dashboard is not yet fully implemented. Try generating from the wizard if needed.",
      )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
          <p className="text-lg text-gray-700">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Dashboard</h1>
                <p className="text-lg text-gray-600">View and manage your saved compliance submissions</p>
              </div>
              <Link href="/" passHref>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Back to Compliance Tool
                </Button>
              </Link>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" /> Filter & Search
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-2">
                  <Label htmlFor="search-submission-reports" className="text-sm font-medium">
                    Search by Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="search-submission-reports"
                      type="text"
                      placeholder="Enter submission name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filter-issuer-reports" className="text-sm font-medium">
                    Issuer
                  </Label>
                  <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
                    <SelectTrigger id="filter-issuer-reports">
                      <SelectValue placeholder="All Issuers" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueIssuers.map((issuer) => (
                        <SelectItem key={issuer} value={issuer}>
                          {issuer === "all" ? "All Issuers" : issuer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filter-card-reports" className="text-sm font-medium">
                    Card Product
                  </Label>
                  <Select
                    value={selectedCard}
                    onValueChange={setSelectedCard}
                    disabled={selectedIssuer === "all" && uniqueCards.length <= 1}
                  >
                    <SelectTrigger id="filter-card-reports">
                      <SelectValue placeholder="All Cards" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCards.map((card) => (
                        <SelectItem key={card} value={card}>
                          {card === "all" ? "All Cards" : card}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="filter-year-reports" className="text-sm font-medium">
                      Year
                    </Label>
                    <Select
                      value={selectedYear}
                      onValueChange={(val) => {
                        setSelectedYear(val)
                        setSelectedMonth("all")
                      }}
                    >
                      <SelectTrigger id="filter-year-reports">
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year === "all" ? "All Years" : year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filter-month-reports" className="text-sm font-medium">
                      Month
                    </Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                      disabled={selectedYear === "all" && uniqueMonths.length <= 1}
                    >
                      <SelectTrigger id="filter-month-reports">
                        <SelectValue placeholder="All Months" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueMonths.map((monthObj) =>
                          typeof monthObj === "string" ? (
                            <SelectItem key={monthObj} value={monthObj}>
                              All Months
                            </SelectItem>
                          ) : (
                            <SelectItem key={monthObj.value} value={monthObj.value}>
                              {monthObj.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Submissions ({filteredReports.length})</CardTitle>
                <CardDescription>Your compliance submissions from the wizard</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReports.length === 0 ? (
                  <div className="text-center py-10">
                    <ListChecks className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matching Submissions</h3>
                    <p className="text-gray-500">
                      {allSavedReports.length === 0
                        ? "You haven't saved any submissions yet."
                        : "Try adjusting your search or filters."}
                    </p>
                    {allSavedReports.length === 0 && (
                      <Link href="/compliance" passHref>
                        <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Start New Submission</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        id={report.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-3 sm:mb-0 flex-grow">
                          <FileText className="h-8 w-8 text-blue-500 shrink-0 mt-1 sm:mt-0" />
                          <div className="flex-grow">
                            <h3 className="font-semibold text-gray-800">{report.name || "Untitled Submission"}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {new Date(report.savedAt).toLocaleDateString()}
                              </span>
                              <span title={`${report.issuer} - ${report.cardProduct}`}>
                                {report.issuer} - {report.cardProduct}
                              </span>
                              <span title={`Type: ${report.submissionType}`}>Type: {report.submissionType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end sm:justify-start shrink-0 mt-3 sm:mt-0">
                          <Badge variant={getStatusBadgeVariant(report.status)}>{report.status || "Unknown"}</Badge>
                          <Button variant="outline" size="sm" onClick={() => handleViewSubmission(report)}>
                            <Eye className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(report)}
                            disabled={!report.wizardDataSnapshot?.submission?.document?.pdfUrl}
                          >
                            <Download className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">PDF</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedReportForView && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Submission Details: {selectedReportForView.name}</DialogTitle>
              <DialogDescription>
                Summary of saved submission. Full view and edit will be available in a future update.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <strong className="text-gray-600">Issuer:</strong> {selectedReportForView.issuer}
                </div>
                <div>
                  <strong className="text-gray-600">Card Product:</strong> {selectedReportForView.cardProduct}
                </div>
                <div>
                  <strong className="text-gray-600">Submission Type:</strong> {selectedReportForView.submissionType}
                </div>
                <div>
                  <strong className="text-gray-600">Saved At:</strong>{" "}
                  {new Date(selectedReportForView.savedAt).toLocaleString()}
                </div>
                <div>
                  <strong className="text-gray-600">Status:</strong> {selectedReportForView.status}
                </div>
              </div>

              {selectedReportForView.wizardDataSnapshot?.assets?.primaryText?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mt-3 mb-1">Submitted Primary Text:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-xs bg-gray-50 p-2 rounded">
                    {selectedReportForView.wizardDataSnapshot.assets.primaryText.map((txt, i) => (
                      <li key={`rpt-pt-${i}`}>{txt}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedReportForView.wizardDataSnapshot?.assets?.headlines?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mt-3 mb-1">Submitted Headlines:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-xs bg-gray-50 p-2 rounded">
                    {selectedReportForView.wizardDataSnapshot.assets.headlines.map((hl, i) => (
                      <li key={`rpt-hl-${i}`}>{hl}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedReportForView.wizardDataSnapshot?.assets?.landingPageUrls?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mt-3 mb-1">Submitted Landing Page URLs:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-xs bg-gray-50 p-2 rounded">
                    {selectedReportForView.wizardDataSnapshot.assets.landingPageUrls.map((url, i) => (
                      <li key={`rpt-url-${i}`}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex items-start gap-2">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  Image previews and full document regeneration from this dashboard are planned for a future update.
                </span>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
