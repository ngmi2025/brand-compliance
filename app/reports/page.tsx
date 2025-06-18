import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Calendar, FileText } from "lucide-react"

const reports = [
  {
    id: "1",
    name: "Q2 2024 Marketing Campaign",
    date: "2024-06-08",
    status: "completed",
    score: 92,
    issues: 2,
    type: "Full Compliance Report",
  },
  {
    id: "2",
    name: "Social Media Kit - June",
    date: "2024-06-07",
    status: "completed",
    score: 78,
    issues: 5,
    type: "Brand Guidelines Check",
  },
  {
    id: "3",
    name: "Product Launch Assets",
    date: "2024-06-05",
    status: "completed",
    score: 95,
    issues: 1,
    type: "Full Compliance Report",
  },
  {
    id: "4",
    name: "Email Campaign Templates",
    date: "2024-06-03",
    status: "in-progress",
    score: null,
    issues: null,
    type: "Accessibility Audit",
  },
]

export default function ReportsPage() {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      "in-progress": "secondary",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Compliance Reports</h1>
            <p className="text-lg text-gray-600">View and download detailed compliance reports for your brand assets</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">24</div>
                <p className="text-sm text-gray-600">Generated this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">87%</div>
                <p className="text-sm text-gray-600">Compliance rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Issues Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">156</div>
                <p className="text-sm text-gray-600">This quarter</p>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your latest compliance reports and audits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{report.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                          <span>{report.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {report.score !== null && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(report.score)}`}>{report.score}%</div>
                          <div className="text-sm text-gray-600">
                            {report.issues} {report.issues === 1 ? "issue" : "issues"}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {getStatusBadge(report.status)}

                        {report.status === "completed" && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button variant="outline">Load More Reports</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
