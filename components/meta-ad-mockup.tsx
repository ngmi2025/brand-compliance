"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Download,
  RefreshCw,
  ThumbsUp,
  Share2,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Send,
  Bookmark,
  Loader2,
  Monitor,
  Smartphone,
  Facebook,
  Instagram,
  Check,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import * as htmlToImage from "html-to-image"

interface MetaAdMockupProps {
  images: File[]
  headlines: string[]
  primaryText: string[]
  landingPageUrls: string[]
  onSaveMockup: (mockupData: any) => void
}

// Make sure to export the component properly
export default function MetaAdMockup({
  images,
  headlines,
  primaryText,
  landingPageUrls,
  onSaveMockup,
}: MetaAdMockupProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0)
  const [selectedHeadline, setSelectedHeadline] = useState<number>(0)
  const [selectedPrimaryText, setSelectedPrimaryText] = useState<number>(0)
  const [selectedUrl, setSelectedUrl] = useState<number>(0)
  const [adFormat, setAdFormat] = useState<string>("facebook-feed")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)

  // Fixed brand settings for Upgraded Points
  const pageName = "Upgraded Points"
  const ctaText = "Learn More"
  const isVerified = true

  // Random engagement numbers
  const [engagementData] = useState(() => ({
    likes: Math.floor(Math.random() * 200) + 50, // 50-250 likes
    comments: Math.floor(Math.random() * 20) + 3, // 3-23 comments
    shares: Math.floor(Math.random() * 10) + 1, // 1-11 shares
  }))

  // Convert File objects to URLs for display
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setImageUrls(urls)
    return () => {
      // Clean up the URLs when component unmounts
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  const captureFullMockup = async () => {
    setIsCapturing(true)

    try {
      const mockupElement = document.getElementById("mockup-preview")
      if (!mockupElement) {
        throw new Error("Mockup element not found")
      }

      // Wait a moment for any images to load
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Configure capture options for best quality
      const dataUrl = await htmlToImage.toPng(mockupElement, {
        quality: 1.0,
        pixelRatio: 2, // For higher resolution
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        filter: (node) => {
          // Filter out any unwanted elements
          return !node.classList?.contains("no-capture")
        },
      })

      // Convert data URL to File object
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `mockup-${adFormat}-${Date.now()}.png`, { type: "image/png" })

      // Create mockup data
      const mockupData = {
        imageUrl: dataUrl,
        headline: headlines[selectedHeadline] || "",
        primaryText: primaryText[selectedPrimaryText] || "",
        landingPageUrl: landingPageUrls[selectedUrl] || "",
        adFormat,
        pageName,
        ctaText,
        engagementData,
      }

      onSaveMockup({ ...mockupData, file })

      toast({
        title: "Mockup Saved Successfully!",
        description: "Your ad mockup has been captured and will be included in the final PDF.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error capturing mockup:", error)
      toast({
        title: "Capture Failed",
        description: "Failed to capture mockup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSaveMockup = async () => {
    await captureFullMockup()
  }

  const getRandomCombination = () => {
    if (images.length && headlines.length && primaryText.length) {
      setSelectedImage(Math.floor(Math.random() * images.length))
      setSelectedHeadline(Math.floor(Math.random() * headlines.length))
      setSelectedPrimaryText(Math.floor(Math.random() * primaryText.length))
      if (landingPageUrls.length) {
        setSelectedUrl(Math.floor(Math.random() * landingPageUrls.length))
      }
    }
  }

  // Format URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace("www.", "")

      // Both Facebook and Instagram use lowercase for URLs
      return domain.toLowerCase()
    } catch (e) {
      // Fallback for invalid URLs
      const cleanUrl = url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
      return cleanUrl.toLowerCase()
    }
  }

  const FacebookFeedAd = () => (
    <div className="max-w-md mx-auto bg-white border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            UP
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{pageName}</span>
              {isVerified && (
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-500 rounded-full">
                  <svg
                    className="w-2 h-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Sponsored</span>
              <span>•</span>
              <span>2h</span>
            </div>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-500" />
      </div>

      {/* Primary Text */}
      {primaryText.length > 0 && (
        <div className="p-3">
          <p className="text-sm leading-relaxed">{primaryText[selectedPrimaryText]}</p>
        </div>
      )}

      {/* Image */}
      {imageUrls.length > 0 && (
        <div className="relative">
          <img
            src={imageUrls[selectedImage] || "/placeholder.svg"}
            alt="Ad creative"
            className="w-full aspect-square object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Link Preview */}
      <div className="border-t bg-gray-50">
        <div className="p-3 space-y-1">
          {landingPageUrls.length > 0 && (
            <p className="text-xs text-gray-500 lowercase">{formatUrl(landingPageUrls[selectedUrl])}</p>
          )}
          {headlines.length > 0 && (
            <h3 className="font-semibold text-base leading-tight">{headlines[selectedHeadline]}</h3>
          )}
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm text-gray-600 flex-1">{ctaText}</p>
            <Button size="sm" className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs px-4 py-1">
              {ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="px-3 py-2 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />
            <span>{engagementData.likes}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{engagementData.comments} comments</span>
            <span>{engagementData.shares} shares</span>
          </div>
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="p-3 border-t flex justify-between items-center">
        <button className="flex items-center gap-2 text-blue-600 font-medium">
          <ThumbsUp className="h-5 w-5" />
          <span className="text-sm">Like</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">Comment</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <Share2 className="h-5 w-5" />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </div>
  )

  const MobileFacebookFeedAd = () => (
    <div
      className="max-w-sm mx-auto bg-white border border-gray-100 overflow-hidden shadow-sm"
      style={{ width: "375px" }}
    >
      {/* Mobile Facebook Header - more compact */}
      <div className="p-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            UP
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{pageName}</span>
              {isVerified && (
                <span className="inline-flex items-center justify-center w-3 h-3 bg-blue-500 rounded-full">
                  <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Sponsored</span>
              <span>•</span>
              <span>2h</span>
            </div>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-gray-500" />
      </div>

      {/* Primary Text - Mobile optimized */}
      {primaryText.length > 0 && (
        <div className="p-3 pb-2">
          <p className="text-sm leading-relaxed">{primaryText[selectedPrimaryText]}</p>
        </div>
      )}

      {/* Image - Mobile aspect ratio */}
      {imageUrls.length > 0 && (
        <div className="relative">
          <img
            src={imageUrls[selectedImage] || "/placeholder.svg"}
            alt="Ad creative"
            className="w-full aspect-square object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Link Preview - Mobile compact */}
      <div className="border-t bg-gray-50">
        <div className="p-3 space-y-1">
          {landingPageUrls.length > 0 && (
            <p className="text-xs text-gray-500 tracking-wide">{formatUrl(landingPageUrls[selectedUrl])}</p>
          )}
          {headlines.length > 0 && (
            <h3 className="font-semibold text-sm leading-tight">{headlines[selectedHeadline]}</h3>
          )}
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-600 flex-1">{ctaText}</p>
            <Button size="sm" className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs px-3 py-1 h-7">
              {ctaText}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Engagement Stats */}
      <div className="px-3 py-2 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 text-blue-500" />
            <span>{engagementData.likes}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{engagementData.comments} comments</span>
            <span>{engagementData.shares} shares</span>
          </div>
        </div>
      </div>

      {/* Mobile Engagement Bar */}
      <div className="p-2 border-t flex justify-between items-center">
        <button className="flex items-center gap-1.5 text-blue-600 font-medium flex-1 justify-center py-2">
          <ThumbsUp className="h-4 w-4" />
          <span className="text-sm">Like</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 flex-1 justify-center py-2">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">Comment</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 flex-1 justify-center py-2">
          <Share2 className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </div>
  )

  const MobileInstagramFeedAd = () => (
    <div
      className="max-w-sm mx-auto bg-white border border-gray-100 overflow-hidden shadow-sm"
      style={{ width: "375px" }}
    >
      {/* Mobile Instagram Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            UP
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{pageName.toLowerCase().replace(/\s+/g, "")}</span>
              {isVerified && (
                <span className="text-blue-500">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 6.5-6.5 1.4 1.4-7.9 7.9z" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">Sponsored</span>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-gray-800" />
      </div>

      {/* Image - Mobile square */}
      {imageUrls.length > 0 && (
        <div className="relative">
          <img
            src={imageUrls[selectedImage] || "/placeholder.svg"}
            alt="Ad creative"
            className="w-full aspect-square object-cover"
            crossOrigin="anonymous"
          />

          {/* Add CTA button overlay on image - same as desktop */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="bg-blue-500 text-white text-center py-3 font-medium">
              {ctaText}
              <span className="ml-2">›</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Instagram Engagement Bar */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-gray-800" />
            <MessageCircle className="h-6 w-6 text-gray-800" />
            <div className="flex items-center justify-center h-6 w-6">
              <Send className="h-5 w-5 text-gray-800 transform -rotate-12 translate-x-[1px]" />
            </div>
          </div>
          <Bookmark className="h-6 w-6 text-gray-800" />
        </div>

        <div className="mb-2">
          <span className="text-sm font-semibold">{engagementData.likes} likes</span>
        </div>

        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-semibold">{pageName.toLowerCase().replace(/\s+/g, "")}</span>{" "}
            {primaryText.length > 0 && primaryText[selectedPrimaryText]}
          </p>
          <p className="text-xs text-gray-500">View all {engagementData.comments} comments</p>
        </div>
      </div>
    </div>
  )

  const InstagramFeedAd = () => (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            UP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">{pageName.toLowerCase().replace(/\s+/g, "")}</span>
              {isVerified && (
                <span className="text-blue-500">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 6.5-6.5 1.4 1.4-7.9 7.9z" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">Sponsored</span>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-800" />
      </div>

      {/* Image */}
      {imageUrls.length > 0 && (
        <div className="relative">
          <img
            src={imageUrls[selectedImage] || "/placeholder.svg"}
            alt="Ad creative"
            className="w-full aspect-square object-cover"
            crossOrigin="anonymous"
          />

          {/* Optional CTA button overlay on image */}
          {adFormat === "instagram-feed" && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="bg-blue-500 text-white text-center py-3 font-medium">
                {ctaText}
                <span className="ml-2">›</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-gray-800" />
            <MessageCircle className="h-6 w-6 text-gray-800" />
            <div className="flex items-center justify-center h-6 w-6">
              <Send className="h-5 w-5 text-gray-800 transform -rotate-12 translate-x-[1px]" />
            </div>
          </div>
          <Bookmark className="h-6 w-6 text-gray-800" />
        </div>

        {/* Likes */}
        <div className="mb-2">
          <span className="text-sm font-semibold">{engagementData.likes} likes</span>
        </div>

        {/* Caption - FIXED to match Instagram's exact layout */}
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-semibold">{pageName.toLowerCase().replace(/\s+/g, "")}</span>{" "}
            {primaryText.length > 0 && primaryText[selectedPrimaryText]}
          </p>
          <p className="text-xs text-gray-500">View all {engagementData.comments} comments</p>
        </div>
      </div>
    </div>
  )

  // Format option definitions
  const adFormatOptions = [
    {
      id: "facebook-feed",
      name: "Facebook Feed",
      icon: <Facebook className="h-5 w-5" />,
      device: "desktop",
      deviceIcon: <Monitor className="h-4 w-4" />,
      description: "Standard desktop Facebook feed ad",
    },
    {
      id: "facebook-mobile",
      name: "Facebook Mobile",
      icon: <Facebook className="h-5 w-5" />,
      device: "mobile",
      deviceIcon: <Smartphone className="h-4 w-4" />,
      description: "Mobile-optimized Facebook feed ad",
    },
    {
      id: "instagram-feed",
      name: "Instagram Feed",
      icon: <Instagram className="h-5 w-5" />,
      device: "desktop",
      deviceIcon: <Monitor className="h-4 w-4" />,
      description: "Standard desktop Instagram feed ad",
    },
    {
      id: "instagram-mobile",
      name: "Instagram Mobile",
      icon: <Instagram className="h-5 w-5" />,
      device: "mobile",
      deviceIcon: <Smartphone className="h-4 w-4" />,
      description: "Mobile-optimized Instagram feed ad",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ad Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Platform & Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {adFormatOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`flex items-center p-3 border rounded-lg transition-all ${
                      adFormat === option.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    onClick={() => setAdFormat(option.id)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          adFormat === option.id ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        {option.icon}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="flex items-center text-xs mt-1 gap-1">
                        {option.deviceIcon}
                        <span>{option.device === "desktop" ? "Desktop" : "Mobile"}</span>
                      </div>
                    </div>
                    {adFormat === option.id && (
                      <div className="ml-2 text-blue-500">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  UP
                </div>
                <span className="font-medium text-sm">Upgraded Points</span>
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-blue-500 rounded-full">
                  <svg
                    className="w-2 h-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Brand settings are pre-configured for Upgraded Points with verified badge and engagement metrics.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>
                Image ({selectedImage + 1} of {images.length})
              </Label>
              <Select
                value={selectedImage.toString()}
                onValueChange={(value) => setSelectedImage(Number.parseInt(value))}
                disabled={images.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select image" />
                </SelectTrigger>
                <SelectContent>
                  {images.map((image, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {image.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Headline ({selectedHeadline + 1} of {headlines.length})
              </Label>
              <Select
                value={selectedHeadline.toString()}
                onValueChange={(value) => setSelectedHeadline(Number.parseInt(value))}
                disabled={headlines.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select headline" />
                </SelectTrigger>
                <SelectContent>
                  {headlines.map((headline, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {headline.length > 30 ? headline.substring(0, 30) + "..." : headline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Primary Text ({selectedPrimaryText + 1} of {primaryText.length})
              </Label>
              <Select
                value={selectedPrimaryText.toString()}
                onValueChange={(value) => setSelectedPrimaryText(Number.parseInt(value))}
                disabled={primaryText.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary text" />
                </SelectTrigger>
                <SelectContent>
                  {primaryText.map((text, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {text.length > 30 ? text.substring(0, 30) + "..." : text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {landingPageUrls.length > 0 && (
              <div>
                <Label>
                  Landing URL ({selectedUrl + 1} of {landingPageUrls.length})
                </Label>
                <Select
                  value={selectedUrl.toString()}
                  onValueChange={(value) => setSelectedUrl(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select URL" />
                  </SelectTrigger>
                  <SelectContent>
                    {landingPageUrls.map((url, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {formatUrl(url)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Current engagement:</strong> {engagementData.likes} likes, {engagementData.comments} comments,{" "}
              {engagementData.shares} shares
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {adFormat === "facebook-feed"
              ? "Facebook Feed Preview (Desktop)"
              : adFormat === "facebook-mobile"
                ? "Facebook Mobile Feed Preview"
                : adFormat === "instagram-feed"
                  ? "Instagram Feed Preview (Desktop)"
                  : "Instagram Mobile Feed Preview"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div id="mockup-preview">
            {adFormat === "facebook-feed" ? (
              <FacebookFeedAd />
            ) : adFormat === "facebook-mobile" ? (
              <MobileFacebookFeedAd />
            ) : adFormat === "instagram-feed" ? (
              <InstagramFeedAd />
            ) : (
              <MobileInstagramFeedAd />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions - MOVED HERE to appear below the preview */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={getRandomCombination} disabled={isCapturing}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Random Combination
        </Button>
        <Button onClick={handleSaveMockup} disabled={isCapturing}>
          {isCapturing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Save Mockup
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Also add a named export for backward compatibility
export { MetaAdMockup }
