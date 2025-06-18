"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ImageIcon, TrendingUp } from "lucide-react"
import { PreApprovedAssetsManager } from "./pre-approved-assets-manager"
import { BrandGuidelinesManager } from "./brand-guidelines-manager"
import { PerformanceTracker } from "./performance-tracker"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("assets")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Compliance Tool
            </Button>
          </Link>
        </div>
        <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Manage brand compliance content and guidelines</p>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border">
            <TabsTrigger
              value="assets"
              className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
            >
              <ImageIcon className="h-4 w-4" />
              Pre-approved Assets
            </TabsTrigger>
            <TabsTrigger
              value="guidelines"
              className="gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200"
            >
              <FileText className="h-4 w-4" />
              Brand Guidelines
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200"
            >
              <TrendingUp className="h-4 w-4" />
              Best Converting Copy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="bg-gradient-to-br from-blue-50/50 to-white rounded-xl">
            <PreApprovedAssetsManager />
          </TabsContent>

          <TabsContent value="guidelines" className="bg-gradient-to-br from-green-50/50 to-white rounded-xl">
            <BrandGuidelinesManager />
          </TabsContent>

          <TabsContent value="performance" className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl">
            <PerformanceTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
