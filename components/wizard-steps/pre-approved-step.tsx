"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, CheckCircle, Database, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { WizardData } from "../compliance-wizard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDisplayNames } from "@/lib/display-names"
import { Badge } from "@/components/ui/badge"

interface PreApprovedStepProps {
  wizardData: WizardData
  onUpdate: (data: {
    selectedPrimaryText: string[]
    selectedHeadlines: string[]
    selectedCreative: string[]
    selectedUrls: string[]
  }) => void
  onNext: () => void
  onPrev: () => void
}

// Mock pre-approved assets database
const preApprovedAssets = {
  headlines: {
    "headline-1": {
      text: "Is the Amex Platinum worth it?",
      publisher: "American Express",
      cardProduct: "Platinum Card",
      category: "Question",
      tags: ["platinum", "worth-it", "question"],
    },
    "headline-2": {
      text: "The Amex Gold Card",
      publisher: "American Express",
      cardProduct: "Gold Card",
      category: "Statement",
      tags: ["gold", "statement"],
    },
    "headline-3": {
      text: "Is the American Express® Gold Card Worth It?",
      publisher: "American Express",
      cardProduct: "Gold Card",
      category: "Question",
      tags: ["gold", "worth-it", "question"],
    },
    "headline-4": {
      text: "See Why You Need The Business Platinum",
      publisher: "American Express",
      cardProduct: "Business Platinum Card",
      category: "Call-to-Action",
      tags: ["business", "platinum", "cta", "need"],
    },
  },
  primaryText: {
    "primary-1": {
      text: "The Business Platinum Card® from American Express is our favorite business card for airport lounge access — and a whole lot more. See why.",
      publisher: "American Express",
      cardProduct: "Business Platinum Card",
      category: "Recommendation",
      tags: ["business", "platinum", "lounge", "access", "favorite"],
    },
    "primary-2": {
      text: "The Platinum Card® from American Express is one of the most talked about cards with rewards and perks.",
      publisher: "American Express",
      cardProduct: "Platinum Card",
      category: "Positioning",
      tags: ["platinum", "talked-about", "rewards", "perks"],
    },
    "primary-3": {
      text: "6% Cash Back at U.S. supermarkets on up to $6,000 per year in purchases (then 1%). Terms Apply.",
      publisher: "American Express",
      cardProduct: "Gold Card",
      category: "Benefit",
      tags: ["cashback", "supermarkets", "6%", "grocery"],
    },
    "primary-4": {
      text: "6% Cash Back on select U.S. streaming subscriptions. Terms Apply.",
      publisher: "American Express",
      cardProduct: "Gold Card",
      category: "Benefit",
      tags: ["cashback", "streaming", "6%", "subscriptions"],
    },
  },
  creative: {
    "creative-1": {
      imageUrl: "/amex-creative-1.png",
      publisher: "American Express",
      cardProduct: "Gold Card",
      dimensions: "800x800",
      fileType: "PNG",
      fileSize: "245KB",
      tags: ["dining", "100k-points", "gold-card"],
    },
    "creative-2": {
      imageUrl: "/amex-creative-2.png",
      publisher: "American Express",
      cardProduct: "Gold Card",
      dimensions: "800x800",
      fileType: "PNG",
      fileSize: "198KB",
      tags: ["dining", "100k-points", "gold-card", "restaurant"],
    },
    "creative-3": {
      imageUrl: "/amex-creative-3.png",
      publisher: "American Express",
      cardProduct: "Platinum Card",
      dimensions: "800x800",
      fileType: "PNG",
      fileSize: "312KB",
      tags: ["travel", "175k-points", "platinum-card", "japan"],
    },
  },
  urls: {
    "url-1": {
      title: "Chase Sapphire Preferred Application Page",
      url: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
      description: "Official application landing page with current bonus offer",
      publisher: "Chase",
      cardProduct: "Chase Sapphire Preferred",
    },
    "url-2": {
      title: "Chase Ultimate Rewards Portal",
      url: "https://ultimaterewards.chase.com",
      description: "Points redemption portal for travel and shopping",
      publisher: "Chase",
      cardProduct: "Chase Sapphire Preferred",
    },
    "url-3": {
      title: "Chase Sapphire Benefits Page",
      url: "https://creditcards.chase.com/sapphire/benefits",
      description: "Detailed benefits and features overview page",
      publisher: "Chase",
      cardProduct: "Chase Sapphire Preferred",
    },
    "url-4": {
      title: "American Express Gold Card Application",
      url: "https://www.americanexpress.com/us/credit-cards/card/gold/",
      description: "Official Gold Card application page",
      publisher: "American Express",
      cardProduct: "Gold Card",
    },
    "url-5": {
      title: "American Express Platinum Card Application",
      url: "https://www.americanexpress.com/us/credit-cards/card/platinum/",
      description: "Official Platinum Card application page",
      publisher: "American Express",
      cardProduct: "Platinum Card",
    },
  },
}

// Available publishers and cards for dropdowns
const availablePublishers = ["American Express", "Chase", "Capital One", "Citi", "Discover"]
const availableCards = {
  "American Express": [
    "Gold Card",
    "Platinum Card",
    "Green Card",
    "Blue Cash Preferred",
    "Business Gold Card",
    "Business Platinum Card",
  ],
  Chase: [
    "Chase Sapphire Preferred",
    "Chase Sapphire Reserve",
    "Chase Freedom Unlimited",
    "Chase Freedom Flex",
    "Chase Ink Business Preferred",
  ],
  "Capital One": ["Capital One Venture", "Capital One Venture X", "Capital One Savor", "Capital One Quicksilver"],
  Citi: ["Citi Premier Card", "Citi Double Cash", "Citi Custom Cash", "Citi AAdvantage Platinum"],
  Discover: ["Discover it Cash Back", "Discover it Miles", "Discover it Student"],
}

export function PreApprovedStep({ wizardData, onUpdate, onNext, onPrev }: PreApprovedStepProps) {
  const [selectedPrimaryText, setSelectedPrimaryText] = useState<string[]>(
    wizardData?.preApproved?.selectedPrimaryText || [],
  )
  const [selectedHeadlines, setSelectedHeadlines] = useState<string[]>(wizardData?.preApproved?.selectedHeadlines || [])
  const [selectedCreative, setSelectedCreative] = useState<string[]>(wizardData?.preApproved?.selectedCreative || [])
  const [selectedUrls, setSelectedUrls] = useState<string[]>(wizardData?.preApproved?.selectedUrls || [])

  // Search and Filter State
  const [searchText, setSearchText] = useState("")

  const { getIssuerName, getCardName } = getDisplayNames()

  // Pre-selected filters from Step 1 - convert to display names
  const [activePublisher, setActivePublisher] = useState<string | undefined>(
    wizardData?.projectInfo?.issuer ? getIssuerName(wizardData.projectInfo.issuer) : undefined,
  )
  const [activeCard, setActiveCard] = useState<string | undefined>(
    wizardData?.projectInfo?.issuer && wizardData?.projectInfo?.cardProduct
      ? getCardName(wizardData.projectInfo.issuer, wizardData.projectInfo.cardProduct)
      : undefined,
  )

  // Dropdown states
  const [showPublisherDropdown, setShowPublisherDropdown] = useState(false)
  const [showCardDropdown, setShowCardDropdown] = useState(false)

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const [visitedTabs, setVisitedTabs] = useState<string[]>(["primaryText"]) // Start with first tab as visited

  const handleTabChange = (value: string) => {
    if (!visitedTabs.includes(value)) {
      setVisitedTabs((prev) => [...prev, value])
    }
  }

  const handlePrimaryTextToggle = (id: string) => {
    setSelectedPrimaryText((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleHeadlineToggle = (id: string) => {
    setSelectedHeadlines((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleCreativeToggle = (id: string) => {
    setSelectedCreative((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleUrlToggle = (id: string) => {
    setSelectedUrls((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleNext = () => {
    onUpdate({
      selectedPrimaryText,
      selectedHeadlines,
      selectedCreative,
      selectedUrls,
    })
    onNext()
  }

  const handlePublisherRemove = () => {
    setActivePublisher(undefined)
    setActiveCard(undefined) // Reset card when publisher is removed
    setShowPublisherDropdown(true)
  }

  const handleCardRemove = () => {
    setActiveCard(undefined)
    setShowCardDropdown(true)
  }

  const handlePublisherSelect = (publisher: string) => {
    setActivePublisher(publisher)
    setActiveCard(undefined) // Reset card when publisher changes
    setShowPublisherDropdown(false)
  }

  const handleCardSelect = (card: string) => {
    setActiveCard(card)
    setShowCardDropdown(false)
  }

  // Filter Helper Function
  const filterAssets = (assets: any) => {
    return Object.entries(assets).filter(([id, asset]: [string, any]) => {
      const textMatch = asset.text.toLowerCase().includes(searchText.toLowerCase())
      const publisherMatch = activePublisher ? asset.publisher === activePublisher : true
      const cardMatch = activeCard ? asset.cardProduct === activeCard : true

      return textMatch && publisherMatch && cardMatch
    })
  }

  // Filter Helper Function for Creative
  const filterCreativeAssets = (assets: any) => {
    return Object.entries(assets).filter(([id, asset]: [string, any]) => {
      const publisherMatch = activePublisher ? asset.publisher === activePublisher : true
      const cardMatch = activeCard ? asset.cardProduct === activeCard : true
      const tagMatch = asset.tags.some((tag: string) => tag.toLowerCase().includes(searchText.toLowerCase()))

      return publisherMatch && cardMatch && (searchText === "" || tagMatch)
    })
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Pre-Approved Assets</div>
            <div className="text-sm font-normal text-slate-600 mt-1">Step 5 of 7</div>
          </div>
        </CardTitle>
        <CardDescription className="text-slate-600 mt-3">
          Select pre-approved assets to include in your submission. These assets have already been approved for use.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Tabs defaultValue="primaryText" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="primaryText" className="relative">
              Primary Text ({Object.keys(preApprovedAssets.primaryText).length})
              {visitedTabs.includes("primaryText") && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="headlines" className="relative">
              Headlines ({Object.keys(preApprovedAssets.headlines).length})
              {visitedTabs.includes("headlines") && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="creative" className="relative">
              Creative ({Object.keys(preApprovedAssets.creative).length})
              {visitedTabs.includes("creative") && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="urls" className="relative">
              URLs ({Object.keys(preApprovedAssets.urls).length})
              {visitedTabs.includes("urls") && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </TabsTrigger>
          </TabsList>

          {visitedTabs.length < 4 && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Be sure to review all {4 - visitedTabs.length} remaining sections to see all
                available pre-approved assets.
              </p>
            </div>
          )}

          <TabsContent value="headlines" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Pre-Approved Headlines</h3>
                <div className="text-sm text-slate-500">
                  Selected: {selectedHeadlines.length} / {Object.keys(preApprovedAssets.headlines).length}
                </div>
              </div>

              {/* Search and Filter UI */}
              <div className="flex gap-4 items-center">
                <Input
                  type="text"
                  placeholder="Search headlines..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-[60%]"
                />
                <div className="flex gap-2 flex-1">
                  {/* Publisher Filter */}
                  {activePublisher && !showPublisherDropdown ? (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {activePublisher}
                      <button onClick={handlePublisherRemove} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handlePublisherSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Publisher" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePublishers.map((publisher) => (
                          <SelectItem key={publisher} value={publisher}>
                            {publisher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Card Filter */}
                  {activeCard && !showCardDropdown ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {activeCard}
                      <button onClick={handleCardRemove} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handleCardSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={activePublisher ? "Card" : "All Cards"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activePublisher && availableCards[activePublisher]
                          ? availableCards[activePublisher].map((card) => (
                              <SelectItem key={card} value={card}>
                                {card}
                              </SelectItem>
                            ))
                          : Object.values(availableCards)
                              .flat()
                              .map((card) => (
                                <SelectItem key={card} value={card}>
                                  {card}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {filterAssets(preApprovedAssets.headlines).map(([id, headline]: [string, any]) => (
                  <div
                    key={id}
                    className={`p-4 rounded-xl border transition-colors ${
                      selectedHeadlines.includes(id) ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`copy-${id}`}
                        checked={selectedHeadlines.includes(id)}
                        onCheckedChange={() => handleHeadlineToggle(id)}
                        className={selectedHeadlines.includes(id) ? "text-green-500 border-green-500" : ""}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {headline.publisher}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {headline.cardProduct}
                          </Badge>
                        </div>
                        <label htmlFor={`copy-${id}`} className="text-sm text-slate-600 font-medium cursor-pointer">
                          {headline.text}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="primaryText" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Pre-Approved Primary Text</h3>
                <div className="text-sm text-slate-500">
                  Selected: {selectedPrimaryText.length} / {Object.keys(preApprovedAssets.primaryText).length}
                </div>
              </div>

              {/* Search and Filter UI */}
              <div className="flex gap-4 items-center">
                <Input
                  type="text"
                  placeholder="Search primary text..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-[60%]"
                />
                <div className="flex gap-2 flex-1">
                  {/* Publisher Filter */}
                  {activePublisher && !showPublisherDropdown ? (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {activePublisher}
                      <button onClick={handlePublisherRemove} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handlePublisherSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Publisher" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePublishers.map((publisher) => (
                          <SelectItem key={publisher} value={publisher}>
                            {publisher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Card Filter */}
                  {activeCard && !showCardDropdown ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {activeCard}
                      <button onClick={handleCardRemove} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handleCardSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={activePublisher ? "Card" : "All Cards"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activePublisher && availableCards[activePublisher]
                          ? availableCards[activePublisher].map((card) => (
                              <SelectItem key={card} value={card}>
                                {card}
                              </SelectItem>
                            ))
                          : Object.values(availableCards)
                              .flat()
                              .map((card) => (
                                <SelectItem key={card} value={card}>
                                  {card}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {filterAssets(preApprovedAssets.primaryText).map(([id, primaryText]: [string, any]) => (
                  <div
                    key={id}
                    className={`p-4 rounded-xl border transition-colors ${
                      selectedPrimaryText.includes(id) ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`copy-${id}`}
                        checked={selectedPrimaryText.includes(id)}
                        onCheckedChange={() => handlePrimaryTextToggle(id)}
                        className={selectedPrimaryText.includes(id) ? "text-green-500 border-green-500" : ""}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {primaryText.publisher}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {primaryText.cardProduct}
                          </Badge>
                        </div>
                        <label htmlFor={`copy-${id}`} className="text-sm text-slate-600 font-medium cursor-pointer">
                          {primaryText.text}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="creative" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Pre-Approved Creative</h3>
                <div className="text-sm text-slate-500">
                  Selected: {selectedCreative.length} / {Object.keys(preApprovedAssets.creative).length}
                </div>
              </div>

              {/* Search and Filter UI */}
              <div className="flex gap-4 items-center">
                <Input
                  type="text"
                  placeholder="Search creative..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-[60%]"
                />
                <div className="flex gap-2 flex-1">
                  {/* Publisher Filter */}
                  {activePublisher && !showPublisherDropdown ? (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {activePublisher}
                      <button onClick={handlePublisherRemove} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handlePublisherSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Publisher" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePublishers.map((publisher) => (
                          <SelectItem key={publisher} value={publisher}>
                            {publisher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Card Filter */}
                  {activeCard && !showCardDropdown ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {activeCard}
                      <button onClick={handleCardRemove} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handleCardSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={activePublisher ? "Card" : "All Cards"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activePublisher && availableCards[activePublisher]
                          ? availableCards[activePublisher].map((card) => (
                              <SelectItem key={card} value={card}>
                                {card}
                              </SelectItem>
                            ))
                          : Object.values(availableCards)
                              .flat()
                              .map((card) => (
                                <SelectItem key={card} value={card}>
                                  {card}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Creative Grid */}
              <div className="grid grid-cols-3 gap-6">
                {filterCreativeAssets(preApprovedAssets.creative).map(([id, creative]: [string, any]) => (
                  <div
                    key={id}
                    className={`relative rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedCreative.includes(id)
                        ? "bg-blue-50 border-blue-300 shadow-lg"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => handleCreativeToggle(id)}
                  >
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox
                        id={`creative-${id}`}
                        checked={selectedCreative.includes(id)}
                        onCheckedChange={() => handleCreativeToggle(id)}
                        className={`bg-white border-2 ${
                          selectedCreative.includes(id) ? "text-blue-500 border-blue-500" : "border-slate-400"
                        }`}
                      />
                    </div>

                    {/* Expand Icon */}
                    <div className="absolute top-2 left-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightboxImage(creative.imageUrl)
                        }}
                        className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors"
                        title="View full size"
                      >
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square">
                      <img
                        src={creative.imageUrl || "/placeholder.svg"}
                        alt={`Creative ${id}`}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="p-3 space-y-1">
                      <div className="text-xs text-slate-600">
                        {creative.publisher} • {creative.cardProduct}
                      </div>
                      <div className="text-xs text-slate-500">
                        {creative.dimensions} • {creative.fileType} • {creative.fileSize}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="urls" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Pre-Approved URLs</h3>
                <div className="text-sm text-slate-500">
                  Selected: {selectedUrls.length} / {Object.keys(preApprovedAssets.urls).length}
                </div>
              </div>

              {/* Search and Filter UI */}
              <div className="flex gap-4 items-center">
                <Input
                  type="text"
                  placeholder="Search URLs..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-[60%]"
                />
                <div className="flex gap-2 flex-1">
                  {/* Publisher Filter */}
                  {activePublisher && !showPublisherDropdown ? (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {activePublisher}
                      <button onClick={handlePublisherRemove} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handlePublisherSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Publisher" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePublishers.map((publisher) => (
                          <SelectItem key={publisher} value={publisher}>
                            {publisher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Card Filter */}
                  {activeCard && !showCardDropdown ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {activeCard}
                      <button onClick={handleCardRemove} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                        ×
                      </button>
                    </div>
                  ) : (
                    <Select onValueChange={handleCardSelect}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={activePublisher ? "Card" : "All Cards"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activePublisher && availableCards[activePublisher]
                          ? availableCards[activePublisher].map((card) => (
                              <SelectItem key={card} value={card}>
                                {card}
                              </SelectItem>
                            ))
                          : Object.values(availableCards)
                              .flat()
                              .map((card) => (
                                <SelectItem key={card} value={card}>
                                  {card}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(preApprovedAssets.urls)
                  .filter(([id, url]: [string, any]) => {
                    const urlMatch = url.url.toLowerCase().includes(searchText.toLowerCase())
                    const publisherMatch = activePublisher ? url.publisher === activePublisher : true
                    const cardMatch = activeCard ? url.cardProduct === activeCard : true
                    return urlMatch && publisherMatch && cardMatch
                  })
                  .map(([id, url]: [string, any]) => (
                    <div
                      key={id}
                      className={`p-4 rounded-xl border transition-colors ${
                        selectedUrls.includes(id) ? "bg-purple-50 border-purple-200" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`url-${id}`}
                          checked={selectedUrls.includes(id)}
                          onCheckedChange={() => handleUrlToggle(id)}
                          className={selectedUrls.includes(id) ? "text-purple-500 border-purple-500" : ""}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {url.publisher}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {url.cardProduct}
                            </Badge>
                          </div>
                          <label
                            htmlFor={`url-${id}`}
                            className="text-sm text-slate-600 font-medium cursor-pointer block mb-1"
                          >
                            {url.title}
                          </label>
                          <p className="text-xs text-slate-500 mb-1">{url.description}</p>
                          <p className="text-xs text-blue-600 break-all">{url.url}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url.url, "_blank")}
                          className="text-xs px-2 py-1"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={lightboxImage || "/placeholder.svg"}
                alt="Full size preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Pre-Approved Asset Library</p>
              <p className="text-sm text-blue-700 mt-1">
                All assets in this library have been pre-approved by the issuer for use in marketing materials.
                Including these assets in your submission can expedite the approval process.
              </p>
            </div>
          </div>
        </div>

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
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
