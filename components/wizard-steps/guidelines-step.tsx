"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Palette, Type, Eye, ImageIcon } from "lucide-react"

interface Guidelines {
  logoUsage: boolean
  colorPalette: boolean
  typography: boolean
  accessibility: boolean
}

interface GuidelinesStepProps {
  data: Guidelines
  onUpdate: (data: Guidelines) => void
  onNext: () => void
  onPrev: () => void
}

export function GuidelinesStep({ data, onUpdate, onNext, onPrev }: GuidelinesStepProps) {
  const handleCheckboxChange = (field: keyof Guidelines, checked: boolean) => {
    onUpdate({ ...data, [field]: checked })
  }

  const guidelines = [
    {
      key: "logoUsage" as keyof Guidelines,
      icon: <ImageIcon className="h-6 w-6 text-blue-600" />,
      title: "Logo Usage Guidelines",
      description: "Check logo placement, sizing, clear space, and proper usage across materials",
    },
    {
      key: "colorPalette" as keyof Guidelines,
      icon: <Palette className="h-6 w-6 text-purple-600" />,
      title: "Color Palette Compliance",
      description: "Verify brand colors are used correctly and meet contrast requirements",
    },
    {
      key: "typography" as keyof Guidelines,
      icon: <Type className="h-6 w-6 text-green-600" />,
      title: "Typography Standards",
      description: "Ensure proper font usage, hierarchy, and text formatting guidelines",
    },
    {
      key: "accessibility" as keyof Guidelines,
      icon: <Eye className="h-6 w-6 text-orange-600" />,
      title: "Accessibility Standards",
      description: "Check WCAG compliance, alt text, and accessibility best practices",
    },
  ]

  const selectedCount = Object.values(data).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-blue-600" />
          Step 3: Brand Guidelines Configuration
        </CardTitle>
        <CardDescription>Select which brand guidelines you want to check against your uploaded assets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {guidelines.map((guideline) => (
            <div
              key={guideline.key}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                data[guideline.key] ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleCheckboxChange(guideline.key, !data[guideline.key])}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={data[guideline.key]}
                  onCheckedChange={(checked) => handleCheckboxChange(guideline.key, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {guideline.icon}
                    <h3 className="font-semibold">{guideline.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{guideline.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCount > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              {selectedCount} guideline{selectedCount > 1 ? "s" : ""} selected for compliance checking
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} disabled={selectedCount === 0}>
            Continue to Compliance Rules
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
