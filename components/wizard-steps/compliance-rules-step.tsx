"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Shield, FileText, Building, Users } from "lucide-react"

interface ComplianceRules {
  legalDisclaimers: boolean
  industryRegulations: boolean
  brandStandards: boolean
  accessibilityStandards: boolean
}

interface ComplianceRulesStepProps {
  data: ComplianceRules
  onUpdate: (data: ComplianceRules) => void
  onNext: () => void
  onPrev: () => void
}

export function ComplianceRulesStep({ data, onUpdate, onNext, onPrev }: ComplianceRulesStepProps) {
  const handleCheckboxChange = (field: keyof ComplianceRules, checked: boolean) => {
    onUpdate({ ...data, [field]: checked })
  }

  const rules = [
    {
      key: "legalDisclaimers" as keyof ComplianceRules,
      icon: <FileText className="h-6 w-6 text-red-600" />,
      title: "Legal Disclaimers",
      description: "Ensure required legal text, copyright notices, and disclaimers are present",
    },
    {
      key: "industryRegulations" as keyof ComplianceRules,
      icon: <Building className="h-6 w-6 text-blue-600" />,
      title: "Industry Regulations",
      description: "Check compliance with industry-specific regulations and standards",
    },
    {
      key: "brandStandards" as keyof ComplianceRules,
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Brand Standards",
      description: "Verify adherence to internal brand guidelines and style standards",
    },
    {
      key: "accessibilityStandards" as keyof ComplianceRules,
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Accessibility Standards",
      description: "Check WCAG compliance and accessibility requirements for all users",
    },
  ]

  const selectedCount = Object.values(data).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Step 4: Compliance Rules Selection
        </CardTitle>
        <CardDescription>Choose which compliance rules and regulations to check your assets against.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.key}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                data[rule.key] ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleCheckboxChange(rule.key, !data[rule.key])}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={data[rule.key]}
                  onCheckedChange={(checked) => handleCheckboxChange(rule.key, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {rule.icon}
                    <h3 className="font-semibold">{rule.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCount > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">
              {selectedCount} compliance rule{selectedCount > 1 ? "s" : ""} selected for checking
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} disabled={selectedCount === 0}>
            Continue to Run Check
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
