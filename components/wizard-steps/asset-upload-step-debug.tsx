"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, FileImage } from "lucide-react"

interface AssetData {
  staticAds: File[]
  primaryText: string[]
  headlines: string[]
  landingPageUrls: string[]
  mockupScreenshots: File[]
  videoFiles: File[]
  deliveryInstructions: string
}

interface AssetUploadStepProps {
  data: AssetData
  submissionType: string
  onUpdate: (data: AssetData) => void
  onNext: () => void
  onPrev: () => void
}

export function AssetUploadStepDebug({ data, submissionType, onUpdate, onNext, onPrev }: AssetUploadStepProps) {
  const [formData, setFormData] = useState<AssetData>(data)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File select triggered", e.target.files)

    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      console.log("New files:", newFiles)

      const updatedData = {
        ...formData,
        staticAds: [...formData.staticAds, ...newFiles],
      }

      console.log("Updated data:", updatedData)
      setFormData(updatedData)
      onUpdate(updatedData)
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = formData.staticAds.filter((_, i) => i !== index)
    const updatedData = { ...formData, staticAds: updatedFiles }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Debug Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simple File Upload */}
        <div>
          <Label htmlFor="simple-upload">Simple File Upload Test</Label>
          <Input
            id="simple-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="mt-2"
          />
        </div>

        {/* Display uploaded files */}
        {formData.staticAds.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Uploaded Files ({formData.staticAds.length})</h4>
            <div className="space-y-2">
              {formData.staticAds.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  )
}
