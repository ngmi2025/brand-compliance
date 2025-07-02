"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText, ImageIcon, Layout, Type, Zap, CheckCircle } from "lucide-react"

interface SubmissionTypeData {
  submissionType: string
}

interface SubmissionTypeStepProps {
  data: SubmissionTypeData
  onUpdate: (data: SubmissionTypeData) => void
  onNext: () => void
  onPrev: () => void
}

const submissionTypes = [
  {
    value: "full-campaign",
    title: "Full Campaign",
    description: "Complete campaign submission with all creative assets, copy, and landing pages",
    icon: <Layout className="h-7 w-7" />,
    iconColor: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    fields: [
      "New creative(s)",
      "New primary text(s)",
      "New headline(s)",
      "New landing page(s)",
      "Motion Graphic(s) - optional",
    ],
  },
  {
    value: "creative-headline-primary",
    title: "Creative, Headline + Primary",
    description: "New creative assets with headline and primary text updates",
    icon: <ImageIcon className="h-7 w-7" />,
    iconColor: "text-indigo-600",
    bgColor: "from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
    fields: ["Creative(s)", "Headline(s)", "Primary text(s)"],
  },
  {
    value: "new-creative-only",
    title: "New Creative Only",
    description: "New visual creative assets with existing approved copy",
    icon: <ImageIcon className="h-7 w-7" />,
    iconColor: "text-green-600",
    bgColor: "from-green-50 to-green-100",
    borderColor: "border-green-200",
    fields: ["Creative(s)"],
  },
  {
    value: "new-primary-text",
    title: "New Primary Only",
    description: "New primary text copy with existing approved creative",
    icon: <FileText className="h-7 w-7" />,
    iconColor: "text-purple-600",
    bgColor: "from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    fields: ["Primary text(s)"],
  },
  {
    value: "headline-text",
    title: "New Headline Only",
    description: "New headline copy variations for existing campaigns",
    icon: <Type className="h-7 w-7" />,
    iconColor: "text-orange-600",
    bgColor: "from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
    fields: ["Headline(s)"],
  },
  {
    value: "headline-primary",
    title: "Headline + Primary",
    description: "Combined headline and primary text updates",
    icon: <FileText className="h-7 w-7" />,
    iconColor: "text-red-600",
    bgColor: "from-red-50 to-red-100",
    borderColor: "border-red-200",
    fields: ["Primary text(s)", "Headline(s)"],
  },
]

export function SubmissionTypeStep({ data, onUpdate, onNext, onPrev }: SubmissionTypeStepProps) {
  const [selectedType, setSelectedType] = useState(data.submissionType)

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    onUpdate({ submissionType: type })
  }

  const selectedSubmission = submissionTypes.find((type) => type.value === selectedType)

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Choose Your Submission Type</div>
            <div className="text-sm font-normal text-slate-600 mt-1">Step 2 of 7</div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-600 mt-3">
          Select the type of submission you're creating. This controls which form fields and requirements will appear in
          the following steps, ensuring you only provide what's needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissionTypes.map((type) => (
            <div
              key={type.value}
              className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedType === type.value
                  ? `${type.borderColor} bg-gradient-to-br ${type.bgColor} ring-2 ring-blue-200 shadow-lg scale-105`
                  : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
              }`}
              onClick={() => handleTypeSelect(type.value)}
            >
              {selectedType === type.value && (
                <div className="absolute -top-2 -right-2 p-1 bg-green-500 rounded-full">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}

              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm ${type.iconColor}`}>{type.icon}</div>

                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{type.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{type.description}</p>
                </div>

                <div className="space-y-2 w-full">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Includes:</div>
                  {type.fields.map((field, index) => (
                    <div key={index} className="text-xs text-slate-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedSubmission && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Perfect Choice: {selectedSubmission.title}</h4>
                <p className="text-sm text-green-800 mb-3">{selectedSubmission.description}</p>
                <p className="text-xs text-green-700">
                  The following steps will be customized specifically for this submission type, streamlining your
                  workflow.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={onPrev}
            className="px-6 py-3 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!selectedType}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue to Upload Assets
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
