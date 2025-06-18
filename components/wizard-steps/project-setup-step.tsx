"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, CreditCard, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProjectInfo {
  issuer: string
  cardProduct: string
  submissionName: string
}

interface ProjectSetupStepProps {
  data: ProjectInfo
  onUpdate: (data: ProjectInfo) => void
  onNext: () => void
}

// Card issuer data with their products
const issuerData = {
  "american-express": {
    name: "American Express",
    cards: [
      { value: "amex-gold", label: "Gold Card" },
      { value: "amex-platinum", label: "Platinum Card" },
      { value: "amex-green", label: "Green Card" },
      { value: "amex-blue-cash", label: "Blue Cash Preferred" },
      { value: "amex-business-gold", label: "Business Gold Card" },
      { value: "amex-business-platinum", label: "Business Platinum Card" },
    ],
  },
  chase: {
    name: "Chase",
    cards: [
      { value: "chase-sapphire-preferred", label: "Chase Sapphire Preferred" },
      { value: "chase-sapphire-reserve", label: "Chase Sapphire Reserve" },
      { value: "chase-freedom-unlimited", label: "Chase Freedom Unlimited" },
      { value: "chase-freedom-flex", label: "Chase Freedom Flex" },
      { value: "chase-ink-business", label: "Chase Ink Business Preferred" },
    ],
  },
  "capital-one": {
    name: "Capital One",
    cards: [
      { value: "capital-one-venture", label: "Capital One Venture" },
      { value: "capital-one-venture-x", label: "Capital One Venture X" },
      { value: "capital-one-savor", label: "Capital One Savor" },
      { value: "capital-one-quicksilver", label: "Capital One Quicksilver" },
    ],
  },
  citi: {
    name: "Citi",
    cards: [
      { value: "citi-premier", label: "Citi Premier Card" },
      { value: "citi-double-cash", label: "Citi Double Cash" },
      { value: "citi-custom-cash", label: "Citi Custom Cash" },
      { value: "citi-aa-platinum", label: "Citi AAdvantage Platinum" },
    ],
  },
  discover: {
    name: "Discover",
    cards: [
      { value: "discover-it", label: "Discover it Cash Back" },
      { value: "discover-it-miles", label: "Discover it Miles" },
      { value: "discover-it-student", label: "Discover it Student" },
    ],
  },
}

export function ProjectSetupStep({ data, onUpdate, onNext }: ProjectSetupStepProps) {
  const [formData, setFormData] = useState(data)

  const handleInputChange = (field: keyof ProjectInfo, value: string) => {
    const newData = { ...formData, [field]: value }

    // Reset card selection if issuer changes
    if (field === "issuer" && value !== formData.issuer) {
      newData.cardProduct = ""
    }

    setFormData(newData)
    onUpdate(newData)
  }

  const selectedIssuer = formData.issuer ? issuerData[formData.issuer as keyof typeof issuerData] : null
  const canProceed = formData.issuer && formData.cardProduct && formData.submissionName.trim()

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-blue-500 rounded-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Select Your Card Issuer & Product</div>
            <div className="text-sm font-normal text-slate-600 mt-1">Step 1 of 7</div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-600 mt-3">
          Choose the card issuer and specific card product for your brand advertising submission. This determines which
          compliance rules and brand guidelines will be applied during the review process.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="issuer" className="text-base font-semibold text-slate-700 mb-3 block">
                Card Issuer *
              </Label>
              <Select value={formData.issuer} onValueChange={(value) => handleInputChange("issuer", value)}>
                <SelectTrigger id="issuer" className="h-12 text-base border-slate-200 focus:border-blue-500">
                  <SelectValue placeholder="Select card issuer" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(issuerData).map(([key, issuer]) => (
                    <SelectItem key={key} value={key} className="text-base py-3">
                      {issuer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="card-product" className="text-base font-semibold text-slate-700 mb-3 block">
                Card Product *
              </Label>
              <Select
                value={formData.cardProduct}
                onValueChange={(value) => handleInputChange("cardProduct", value)}
                disabled={!formData.issuer}
              >
                <SelectTrigger id="card-product" className="h-12 text-base border-slate-200 focus:border-blue-500">
                  <SelectValue placeholder={formData.issuer ? "Select card product" : "Select issuer first"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedIssuer?.cards.map((card) => (
                    <SelectItem key={card.value} value={card.value} className="text-base py-3">
                      {card.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="submission-name" className="text-base font-semibold text-slate-700 mb-3 block">
                Submission Name *
              </Label>
              <Input
                id="submission-name"
                placeholder="e.g., Q2 Rewards Campaign, Holiday Promo"
                value={formData.submissionName}
                onChange={(e) => handleInputChange("submissionName", e.target.value)}
                className="h-12 text-base border-slate-200 focus:border-blue-500"
              />
              <p className="text-sm text-slate-500 mt-2">Give this submission a name for tracking purposes</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Show selected compliance info */}
            {formData.issuer && formData.cardProduct && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">We've Got You Covered</h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                      {selectedIssuer?.name} brand guidelines, legal disclosure requirements, and card-specific
                      compliance rules will be automatically enforced for this submission. Our expertise makes complex
                      compliance simple.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits list */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">What You'll Get:</h4>
              <div className="space-y-3">
                {[
                  "Automated brand guideline compliance checking",
                  "AI-powered content analysis and recommendations",
                  "Professional PDF reports for submission",
                  "Pre-approved asset library integration",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue to Submission Type
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
