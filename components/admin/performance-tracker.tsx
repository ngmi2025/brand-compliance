"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Upload, Download } from "lucide-react"
import { toast } from "sonner"

interface ConvertingCopy {
  id: string
  copy: string
  type: "primary-text" | "headline"
  publisher: string
  card: string
  clicks: number
  impressions: number
  ctr: number
  sales: number
  conversionRate: number
  addedDate: string
}

const issuerData = {
  "american-express": {
    name: "American Express",
    products: {
      "amex-gold": "Gold Card",
      "amex-platinum": "Platinum Card",
      "amex-green": "Green Card",
      "amex-blue": "Blue Cash Preferred",
      "amex-business-gold": "Business Gold Card",
    },
  },
  chase: {
    name: "Chase",
    products: {
      "chase-sapphire-preferred": "Sapphire Preferred",
      "chase-sapphire-reserve": "Sapphire Reserve",
      "chase-freedom": "Freedom Unlimited",
      "chase-ink": "Ink Business Preferred",
    },
  },
  "capital-one": {
    name: "Capital One",
    products: {
      "capital-one-venture": "Venture Rewards",
      "capital-one-savor": "Savor Cash Rewards",
      "capital-one-quicksilver": "Quicksilver",
    },
  },
}

export function PerformanceTracker() {
  const [activeTab, setActiveTab] = useState<"primary-text" | "headline">("primary-text")
  const [selectedPublisher, setSelectedPublisher] = useState<string>("all")
  const [selectedCard, setSelectedCard] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState<boolean>(false)
  const [editingItem, setEditingItem] = useState<ConvertingCopy | null>(null)
  const [deletingItem, setDeleteingItem] = useState<ConvertingCopy | null>(null)

  // Mock data for best converting copy
  const [convertingCopy, setConvertingCopy] = useState<ConvertingCopy[]>([
    {
      id: "1",
      copy: "The Gold Standard of Rewards - Earn 4X points on dining",
      type: "headline",
      publisher: "american-express",
      card: "amex-gold",
      clicks: 12500,
      impressions: 298000,
      ctr: 4.19,
      sales: 350,
      conversionRate: 2.8,
      addedDate: "2024-01-15",
    },
    {
      id: "2",
      copy: "Earn 4X Membership Rewards points at restaurants worldwide and 4X points at U.S. supermarkets (up to $25,000 per year in purchases, then 1X), plus 3X points on flights booked directly with airlines or on amex travel.com.",
      type: "primary-text",
      publisher: "american-express",
      card: "amex-gold",
      clicks: 8900,
      impressions: 234000,
      ctr: 3.8,
      sales: 275,
      conversionRate: 3.1,
      addedDate: "2024-01-12",
    },
    {
      id: "3",
      copy: "Unlock Premium Travel Benefits",
      type: "headline",
      publisher: "american-express",
      card: "amex-platinum",
      clicks: 15200,
      impressions: 412000,
      ctr: 3.69,
      sales: 456,
      conversionRate: 3.0,
      addedDate: "2024-01-10",
    },
  ])

  const [newItem, setNewItem] = useState({
    copy: "",
    type: activeTab as "primary-text" | "headline",
    publisher: "",
    card: "",
    clicks: 0,
    impressions: 0,
    sales: 0,
  })

  const filteredCopy = convertingCopy.filter((item) => {
    const matchesType = item.type === activeTab
    const matchesPublisher = selectedPublisher === "all" || item.publisher === selectedPublisher
    const matchesCard = selectedCard === "all" || item.card === selectedCard
    return matchesType && matchesPublisher && matchesCard
  })

  const availableCards =
    selectedPublisher === "all"
      ? Object.values(issuerData).flatMap((issuer) =>
          Object.entries(issuer.products).map(([key, name]) => ({ key, name })),
        )
      : Object.entries(issuerData[selectedPublisher as keyof typeof issuerData]?.products || {}).map(([key, name]) => ({
          key,
          name,
        }))

  const handleAdd = () => {
    if (!newItem.copy || !newItem.publisher || !newItem.card) {
      toast.error("Please fill in all fields.")
      return
    }

    const ctr = newItem.impressions > 0 ? (newItem.clicks / newItem.impressions) * 100 : 0
    const conversionRate = newItem.clicks > 0 ? (newItem.sales / newItem.clicks) * 100 : 0

    const item: ConvertingCopy = {
      id: Date.now().toString(),
      copy: newItem.copy,
      type: activeTab,
      publisher: newItem.publisher,
      card: newItem.card,
      clicks: newItem.clicks,
      impressions: newItem.impressions,
      ctr: Number(ctr.toFixed(2)),
      sales: newItem.sales,
      conversionRate: Number(conversionRate.toFixed(2)),
      addedDate: new Date().toISOString().split("T")[0],
    }

    setConvertingCopy([...convertingCopy, item])
    setNewItem({
      copy: "",
      type: activeTab as "primary-text" | "headline",
      publisher: "",
      card: "",
      clicks: 0,
      impressions: 0,
      sales: 0,
    })
    setShowAddDialog(false)
    toast.success("Copy added successfully!")
  }

  const handleEdit = () => {
    if (!editingItem) {
      toast.error("No item selected for editing.")
      return
    }

    if (!editingItem.copy || !editingItem.publisher || !editingItem.card) {
      toast.error("Please fill in all fields.")
      return
    }

    const ctr = editingItem.impressions > 0 ? (editingItem.clicks / editingItem.impressions) * 100 : 0
    const conversionRate = editingItem.clicks > 0 ? (editingItem.sales / editingItem.clicks) * 100 : 0

    const updatedItem = {
      ...editingItem,
      ctr: Number(ctr.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
    }

    setConvertingCopy(convertingCopy.map((item) => (item.id === editingItem.id ? updatedItem : item)))
    setEditingItem(null)
    setShowEditDialog(false)
    toast.success("Copy updated successfully!")
  }

  const handleDelete = () => {
    if (!deletingItem) {
      toast.error("No item selected for deletion.")
      return
    }
    setConvertingCopy(convertingCopy.filter((item) => item.id !== deletingItem.id))
    setDeleteingItem(null)
    setShowDeleteDialog(false)
    toast.success("Copy deleted successfully!")
  }

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast.error("No file selected.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      if (
        headers.length < 6 ||
        headers[0] !== "Copy" ||
        headers[1] !== "Publisher" ||
        headers[2] !== "Card" ||
        headers[3] !== "Clicks" ||
        headers[4] !== "Impressions" ||
        headers[5] !== "Sales"
      ) {
        toast.error("Invalid CSV format. Please use the provided template.")
        return
      }

      const newItems: ConvertingCopy[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        if (values.length < headers.length) continue

        const copy = values[0]
        const publisher = values[1]
        const card = values[2]
        const clicks = Number.parseInt(values[3]) || 0
        const impressions = Number.parseInt(values[4]) || 0
        const sales = Number.parseInt(values[5]) || 0

        if (copy && publisher && card) {
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
          const conversionRate = clicks > 0 ? (sales / clicks) * 100 : 0

          newItems.push({
            id: Date.now().toString() + i,
            copy,
            type: activeTab as "primary-text" | "headline",
            publisher,
            card,
            clicks,
            impressions,
            ctr: Number(ctr.toFixed(2)),
            sales,
            conversionRate: Number(conversionRate.toFixed(2)),
            addedDate: new Date().toISOString().split("T")[0],
          })
        }
      }

      setConvertingCopy([...convertingCopy, ...newItems])
      setShowBulkUploadDialog(false)
      toast.success("Bulk upload successful!")
    }
    reader.readAsText(file)
  }

  const downloadCSVTemplate = () => {
    const csvContent =
      "Copy,Publisher,Card,Clicks,Impressions,Sales\n" +
      "Sample headline text,american-express,amex-gold,1000,25000,50\n" +
      "Sample primary text,american-express,amex-gold,800,20000,40"

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk-upload-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
        <CardTitle className="text-xl">Best Converting Copy</CardTitle>
        <CardDescription className="text-purple-100">
          Track high-performing copy to improve AI suggestions for Primary Text and Headlines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList className="bg-purple-50 border border-purple-200">
              <TabsTrigger
                value="primary-text"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Primary Text
              </TabsTrigger>
              <TabsTrigger
                value="headline"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Headlines
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Converting Copy</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file with columns: Copy, Publisher, Card, Clicks, Impressions, Sales
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Input id="csv-file" type="file" accept=".csv" onChange={handleBulkUpload} />
                    </div>
                    <Button variant="outline" onClick={downloadCSVTemplate} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Add {activeTab === "primary-text" ? "Primary Text" : "Headline"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New {activeTab === "primary-text" ? "Primary Text" : "Headline"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="copy">Copy</Label>
                      <Textarea
                        id="copy"
                        value={newItem.copy}
                        onChange={(e) => setNewItem({ ...newItem, copy: e.target.value })}
                        placeholder={`Enter ${activeTab === "primary-text" ? "primary text" : "headline"} copy...`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publisher">Publisher</Label>
                        <Select
                          value={newItem.publisher}
                          onValueChange={(value) => setNewItem({ ...newItem, publisher: value, card: "" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select publisher" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(issuerData).map(([key, issuer]) => (
                              <SelectItem key={key} value={key}>
                                {issuer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="card">Card</Label>
                        <Select
                          value={newItem.card}
                          onValueChange={(value) => setNewItem({ ...newItem, card: value })}
                          disabled={!newItem.publisher}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select card" />
                          </SelectTrigger>
                          <SelectContent>
                            {newItem.publisher &&
                              Object.entries(
                                issuerData[newItem.publisher as keyof typeof issuerData]?.products || {},
                              ).map(([key, name]) => (
                                <SelectItem key={key} value={key}>
                                  {name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="clicks">Clicks</Label>
                        <Input
                          id="clicks"
                          type="number"
                          value={newItem.clicks}
                          onChange={(e) => setNewItem({ ...newItem, clicks: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="impressions">Impressions</Label>
                        <Input
                          id="impressions"
                          type="number"
                          value={newItem.impressions}
                          onChange={(e) =>
                            setNewItem({ ...newItem, impressions: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="sales">Sales</Label>
                        <Input
                          id="sales"
                          type="number"
                          value={newItem.sales}
                          onChange={(e) => setNewItem({ ...newItem, sales: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd}>Add Copy</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select
              value={selectedPublisher}
              onValueChange={(value) => {
                setSelectedPublisher(value)
                setSelectedCard("all")
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Publishers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Publishers</SelectItem>
                {Object.entries(issuerData).map(([key, issuer]) => (
                  <SelectItem key={key} value={key}>
                    {issuer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCard} onValueChange={setSelectedCard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                {availableCards.map(({ key, name }) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="primary-text" className="space-y-4">
            {filteredCopy.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No primary text data found. Add some converting copy to get started.
              </div>
            ) : (
              filteredCopy.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-r from-white to-purple-50/20"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                            {issuerData[item.publisher as keyof typeof issuerData]?.name}
                          </Badge>
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            {
                              issuerData[item.publisher as keyof typeof issuerData]?.products[
                                item.card as keyof (typeof issuerData)[keyof typeof issuerData]["products"]
                              ]
                            }
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900 mb-3 max-w-3xl">{item.copy}</p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                          <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium">Clicks</p>
                            <p className="font-bold text-blue-800">{item.clicks.toLocaleString()}</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 font-medium">Impressions</p>
                            <p className="font-bold text-green-800">{item.impressions.toLocaleString()}</p>
                          </div>
                          <div
                            className={`p-2 rounded-lg border ${
                              item.ctr >= 3
                                ? "bg-green-50 border-green-200"
                                : item.ctr >= 2
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-red-50 border-red-200"
                            }`}
                          >
                            <p
                              className={`text-xs font-medium ${
                                item.ctr >= 3 ? "text-green-600" : item.ctr >= 2 ? "text-yellow-600" : "text-red-600"
                              }`}
                            >
                              CTR
                            </p>
                            <p
                              className={`font-bold ${
                                item.ctr >= 3 ? "text-green-800" : item.ctr >= 2 ? "text-yellow-800" : "text-red-800"
                              }`}
                            >
                              {item.ctr}%
                            </p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 font-medium">Sales</p>
                            <p className="font-bold text-purple-800">{item.sales.toLocaleString()}</p>
                          </div>
                          <div
                            className={`p-2 rounded-lg border ${
                              item.conversionRate >= 3
                                ? "bg-green-50 border-green-200"
                                : item.conversionRate >= 2
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-red-50 border-red-200"
                            }`}
                          >
                            <p
                              className={`text-xs font-medium ${
                                item.conversionRate >= 3
                                  ? "text-green-600"
                                  : item.conversionRate >= 2
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              Conversion Rate
                            </p>
                            <p
                              className={`font-bold ${
                                item.conversionRate >= 3
                                  ? "text-green-800"
                                  : item.conversionRate >= 2
                                    ? "text-yellow-800"
                                    : "text-red-800"
                              }`}
                            >
                              {item.conversionRate}%
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">Added: {item.addedDate}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteingItem(item)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="headline" className="space-y-4">
            {filteredCopy.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No headline data found. Add some converting copy to get started.
              </div>
            ) : (
              filteredCopy.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-r from-white to-purple-50/20"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                            {issuerData[item.publisher as keyof typeof issuerData]?.name}
                          </Badge>
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            {
                              issuerData[item.publisher as keyof typeof issuerData]?.products[
                                item.card as keyof (typeof issuerData)[keyof typeof issuerData]["products"]
                              ]
                            }
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900 mb-3 max-w-3xl">{item.copy}</p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                          <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium">Clicks</p>
                            <p className="font-bold text-blue-800">{item.clicks.toLocaleString()}</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 font-medium">Impressions</p>
                            <p className="font-bold text-green-800">{item.impressions.toLocaleString()}</p>
                          </div>
                          <div
                            className={`p-2 rounded-lg border ${
                              item.ctr >= 3
                                ? "bg-green-50 border-green-200"
                                : item.ctr >= 2
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-red-50 border-red-200"
                            }`}
                          >
                            <p
                              className={`text-xs font-medium ${
                                item.ctr >= 3 ? "text-green-600" : item.ctr >= 2 ? "text-yellow-600" : "text-red-600"
                              }`}
                            >
                              CTR
                            </p>
                            <p
                              className={`font-bold ${
                                item.ctr >= 3 ? "text-green-800" : item.ctr >= 2 ? "text-yellow-800" : "text-red-800"
                              }`}
                            >
                              {item.ctr}%
                            </p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 font-medium">Sales</p>
                            <p className="font-bold text-purple-800">{item.sales.toLocaleString()}</p>
                          </div>
                          <div
                            className={`p-2 rounded-lg border ${
                              item.conversionRate >= 3
                                ? "bg-green-50 border-green-200"
                                : item.conversionRate >= 2
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-red-50 border-red-200"
                            }`}
                          >
                            <p
                              className={`text-xs font-medium ${
                                item.conversionRate >= 3
                                  ? "text-green-600"
                                  : item.conversionRate >= 2
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              Conversion Rate
                            </p>
                            <p
                              className={`font-bold ${
                                item.conversionRate >= 3
                                  ? "text-green-800"
                                  : item.conversionRate >= 2
                                    ? "text-yellow-800"
                                    : "text-red-800"
                              }`}
                            >
                              {item.conversionRate}%
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">Added: {item.addedDate}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteingItem(item)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit {editingItem?.type === "primary-text" ? "Primary Text" : "Headline"}</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-copy">Copy</Label>
                  <Textarea
                    id="edit-copy"
                    value={editingItem.copy}
                    onChange={(e) => setEditingItem({ ...editingItem, copy: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-publisher">Publisher</Label>
                    <Select
                      value={editingItem.publisher}
                      onValueChange={(value) => setEditingItem({ ...editingItem, publisher: value, card: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(issuerData).map(([key, issuer]) => (
                          <SelectItem key={key} value={key}>
                            {issuer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-card">Card</Label>
                    <Select
                      value={editingItem.card}
                      onValueChange={(value) => setEditingItem({ ...editingItem, card: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          issuerData[editingItem.publisher as keyof typeof issuerData]?.products || {},
                        ).map(([key, name]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-clicks">Clicks</Label>
                    <Input
                      id="edit-clicks"
                      type="number"
                      value={editingItem.clicks}
                      onChange={(e) => setEditingItem({ ...editingItem, clicks: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-impressions">Impressions</Label>
                    <Input
                      id="edit-impressions"
                      type="number"
                      value={editingItem.impressions}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, impressions: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-sales">Sales</Label>
                    <Input
                      id="edit-sales"
                      type="number"
                      value={editingItem.sales}
                      onChange={(e) => setEditingItem({ ...editingItem, sales: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Converting Copy</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this{" "}
                {deletingItem?.type === "primary-text" ? "primary text" : "headline"}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
