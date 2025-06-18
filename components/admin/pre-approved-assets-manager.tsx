"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Asset {
  id: string
  content: string
  issuer: string
  product: string
  createdAt: string
}

interface IssuerData {
  [key: string]: {
    name: string
    cards: { value: string; label: string }[]
  }
}

export function PreApprovedAssetsManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIssuer, setSelectedIssuer] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null)

  const [assetsData, setAssetsData] = useState<{ [key: string]: Asset[] }>({
    "primary-text": [
      {
        id: "1",
        content:
          "Earn 4X Membership Rewards points at restaurants worldwide and at U.S. supermarkets (on up to $25,000 per year in purchases, then 1X).",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        content: "No Foreign Transaction Fees when you use your Card for purchases made outside the United States.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-10",
      },
      {
        id: "3",
        content:
          "Get up to $120 in statement credits annually when you use your Gold Card for eligible purchases at Grubhub, Seamless, The Cheesecake Factory, Ruth's Chris Steak House, Boxed and participating Shake Shack locations.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-08",
      },
      {
        id: "4",
        content: "Earn 3X points on dining and 1X points on all other purchases with your Gold Card.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-05",
      },
      {
        id: "5",
        content: "Access to exclusive events, presales, and experiences through American Express Entertainment.",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-03",
      },
    ],
    headlines: [
      {
        id: "6",
        content: "The Gold Standard of Rewards",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-20",
      },
      {
        id: "7",
        content: "Earn More on Dining & Groceries",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-18",
      },
      {
        id: "8",
        content: "Unlock Premium Dining Experiences",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-16",
      },
      {
        id: "9",
        content: "Your Gateway to Exceptional Rewards",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-14",
      },
      {
        id: "10",
        content: "Elevate Every Purchase",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-12",
      },
    ],
    creative: [
      {
        id: "11",
        content: "/amex-creative-1.png",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-12",
      },
      {
        id: "12",
        content: "/amex-creative-2.png",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-10",
      },
      {
        id: "13",
        content: "/amex-creative-3.png",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-08",
      },
    ],
    urls: [
      {
        id: "14",
        content: "https://www.americanexpress.com/us/credit-cards/card/gold/",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-25",
      },
      {
        id: "15",
        content: "https://www.americanexpress.com/us/credit-cards/card-application/apply/gold-card/",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-23",
      },
      {
        id: "16",
        content: "https://www.americanexpress.com/us/rewards-info/gold/",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-21",
      },
      {
        id: "17",
        content: "https://www.americanexpress.com/us/credit-cards/features-benefits/dining/",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-19",
      },
      {
        id: "18",
        content: "https://www.americanexpress.com/us/credit-cards/benefits/membership-rewards/",
        issuer: "american-express",
        product: "amex-gold",
        createdAt: "2024-01-17",
      },
    ],
  })
  const [selectedAssetType, setSelectedAssetType] = useState("primary-text")
  const { toast } = useToast()

  // Available options for dropdowns
  const issuerData: IssuerData = {
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

  const issuers = Object.entries(issuerData).map(([key, issuer]) => ({
    value: key,
    label: issuer.name,
  }))

  const products = Object.values(issuerData).flatMap((issuer) => issuer.cards)

  const handleAddAsset = (newAsset: Asset) => {
    setAssetsData((prev) => ({
      ...prev,
      [selectedAssetType]: [...prev[selectedAssetType], newAsset],
    }))
    setIsAddingNew(false)
    toast({
      title: "Asset added successfully!",
    })
  }

  const handleEditAsset = (updatedAsset: Asset) => {
    setAssetsData((prev) => ({
      ...prev,
      [selectedAssetType]: prev[selectedAssetType].map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset,
      ),
    }))
    toast({
      title: "Asset updated successfully!",
    })
  }

  const confirmDelete = (id: string) => {
    setAssetToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteAsset = () => {
    if (assetToDelete) {
      setAssetsData((prev) => ({
        ...prev,
        [selectedAssetType]: prev[selectedAssetType].filter((asset) => asset.id !== assetToDelete),
      }))
      toast({
        title: "Asset deleted successfully!",
      })
      setDeleteConfirmOpen(false)
      setAssetToDelete(null)
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const AssetList = ({ assets, type }: { assets: Asset[]; type: string }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null)

    const filteredAssets = assets.filter((asset) => {
      const matchesIssuer = selectedIssuer === "all" || asset.issuer === selectedIssuer
      const matchesProduct = selectedProduct === "all" || asset.product === selectedProduct

      return matchesIssuer && matchesProduct
    })

    const isCreativeAsset = (content: string) => {
      return (
        content.includes(".png") || content.includes(".jpg") || content.includes(".jpeg") || content.includes(".gif")
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Issuers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issuers</SelectItem>
                {issuers.map((issuer) => (
                  <SelectItem key={issuer.value} value={issuer.value}>
                    {issuer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Cards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cards</SelectItem>
                {selectedIssuer === "all"
                  ? products.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        {product.label}
                      </SelectItem>
                    ))
                  : issuerData[selectedIssuer]?.cards.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        {product.label}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddingNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
                <Plus className="h-4 w-4" />
                Add {type}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New {type}</DialogTitle>
                <DialogDescription>Enter the details for the new {type}.</DialogDescription>
              </DialogHeader>
              <NewAssetForm
                type={type}
                onAdd={handleAddAsset}
                onClose={() => setIsAddingNew(false)}
                assetType={selectedAssetType}
                issuers={issuers}
                issuerData={issuerData}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/20"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    {/* Show thumbnail for creative assets */}
                    {isCreativeAsset(asset.content) && (
                      <div className="flex-shrink-0">
                        <img
                          src={asset.content || "/placeholder.svg"}
                          alt="Creative asset"
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          {issuerData[asset.issuer]?.name || asset.issuer}
                        </Badge>
                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                          {issuerData[asset.issuer]?.cards.find((c) => c.value === asset.product)?.label ||
                            asset.product}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900 mb-2 break-words">{asset.content}</p>
                      <p className="text-xs text-gray-500">Added {asset.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAssetToEdit(asset)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {type}</DialogTitle>
                          <DialogDescription>Edit the details for the {type}.</DialogDescription>
                        </DialogHeader>
                        {assetToEdit && (
                          <EditAssetForm
                            asset={assetToEdit}
                            onEdit={handleEditAsset}
                            onClose={() => {
                              setIsEditDialogOpen(false)
                              setAssetToEdit(null)
                            }}
                            assetType={selectedAssetType}
                            issuers={issuers}
                            issuerData={issuerData}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(asset.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="text-xl">Pre-approved Assets Management</CardTitle>
          <CardDescription className="text-blue-100">
            Manage headlines, primary text, creative assets, and URLs for compliance submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="primary-text"
            className="space-y-6"
            onValueChange={(value) => {
              setSelectedAssetType(value)
            }}
          >
            <TabsList className="grid w-full grid-cols-4 bg-blue-50 border border-blue-200">
              <TabsTrigger
                value="primary-text"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Primary Text ({assetsData["primary-text"].length})
              </TabsTrigger>
              <TabsTrigger value="headlines" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Headlines ({assetsData["headlines"].length})
              </TabsTrigger>
              <TabsTrigger value="creative" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Creative ({assetsData["creative"].length})
              </TabsTrigger>
              <TabsTrigger value="urls" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                URLs ({assetsData["urls"].length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="primary-text">
              <AssetList assets={assetsData["primary-text"]} type="Primary Text" />
            </TabsContent>

            <TabsContent value="headlines">
              <AssetList assets={assetsData["headlines"]} type="Headline" />
            </TabsContent>

            <TabsContent value="creative">
              <AssetList assets={assetsData["creative"]} type="Creative Asset" />
            </TabsContent>

            <TabsContent value="urls">
              <AssetList assets={assetsData["urls"]} type="URL" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAsset}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface NewAssetFormProps {
  type: string
  onAdd: (asset: Asset) => void
  onClose: () => void
  assetType: string
  issuers: { value: string; label: string }[]
  issuerData: IssuerData
}

const NewAssetForm: React.FC<NewAssetFormProps> = ({ type, onAdd, onClose, assetType, issuers, issuerData }) => {
  const [content, setContent] = useState("")
  const [issuer, setIssuer] = useState("")
  const [product, setProduct] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAsset: Asset = {
      id: Math.random().toString(36).substring(7),
      content,
      issuer,
      product,
      createdAt: new Date().toLocaleDateString(),
    }
    onAdd(newAsset)
    setContent("")
    setIssuer("")
    setProduct("")
    onClose()
  }

  const handleIssuerChange = (value: string) => {
    setIssuer(value)
    setProduct("") // Reset product when issuer changes
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="issuer">Issuer</Label>
        <Select value={issuer} onValueChange={handleIssuerChange}>
          <SelectTrigger id="issuer">
            <SelectValue placeholder="Select issuer" />
          </SelectTrigger>
          <SelectContent>
            {issuers.map((issuer) => (
              <SelectItem key={issuer.value} value={issuer.value}>
                {issuer.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="product">Card</Label>
        <Select value={product} onValueChange={setProduct} disabled={!issuer}>
          <SelectTrigger id="product">
            <SelectValue placeholder={issuer ? "Select card" : "Select an issuer first"} />
          </SelectTrigger>
          <SelectContent>
            {issuer &&
              issuerData[issuer]?.cards.map((product) => (
                <SelectItem key={product.value} value={product.value}>
                  {product.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={!content || !issuer || !product}>
        Add {type}
      </Button>
    </form>
  )
}

interface EditAssetFormProps {
  asset: Asset
  onEdit: (asset: Asset) => void
  onClose: () => void
  assetType: string
  issuers: { value: string; label: string }[]
  issuerData: IssuerData
}

const EditAssetForm: React.FC<EditAssetFormProps> = ({ asset, onEdit, onClose, assetType, issuers, issuerData }) => {
  const [content, setContent] = useState(asset.content)
  const [issuer, setIssuer] = useState(asset.issuer)
  const [product, setProduct] = useState(asset.product)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedAsset: Asset = {
      ...asset,
      content,
      issuer,
      product,
    }
    onEdit(updatedAsset)
    onClose()
  }

  const handleIssuerChange = (value: string) => {
    setIssuer(value)
    setProduct("") // Reset product when issuer changes
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="issuer">Issuer</Label>
        <Select value={issuer} onValueChange={handleIssuerChange}>
          <SelectTrigger id="issuer">
            <SelectValue placeholder="Select issuer" />
          </SelectTrigger>
          <SelectContent>
            {issuers.map((issuerOption) => (
              <SelectItem key={issuerOption.value} value={issuerOption.value}>
                {issuerOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="product">Card</Label>
        <Select value={product} onValueChange={setProduct} disabled={!issuer}>
          <SelectTrigger id="product">
            <SelectValue placeholder={issuer ? "Select card" : "Select an issuer first"} />
          </SelectTrigger>
          <SelectContent>
            {issuer &&
              issuerData[issuer]?.cards.map((productOption) => (
                <SelectItem key={productOption.value} value={productOption.value}>
                  {productOption.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={!content || !issuer || !product}>
        Update Asset
      </Button>
    </form>
  )
}
