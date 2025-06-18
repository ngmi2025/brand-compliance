"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react"
import {
  getStoredDocuments,
  uploadDocumentFile,
  deleteDocument,
  getDocumentStats,
  type StoredDocument,
} from "@/lib/document-storage-service"

export function BrandGuidelinesManager() {
  const [selectedIssuer, setSelectedIssuer] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [documents, setDocuments] = useState<StoredDocument[]>([])
  const [documentStats, setDocumentStats] = useState(getDocumentStats())
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [uploadForm, setUploadForm] = useState({
    issuer: "",
    product: "",
    type: "",
    files: [] as File[],
  })
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const { toast } = useToast()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousDocsRef = useRef<StoredDocument[]>([])

  // Simple document loading without circular dependencies
  const loadDocuments = useCallback(() => {
    const storedDocs = getStoredDocuments()
    const newStats = getDocumentStats()

    // Check for status changes and show notifications
    const previousDocs = previousDocsRef.current
    if (previousDocs.length > 0) {
      storedDocs.forEach((doc) => {
        const prevDoc = previousDocs.find((p) => p.id === doc.id)
        if (prevDoc && prevDoc.textExtractionStatus !== doc.textExtractionStatus) {
          if (doc.textExtractionStatus === "completed") {
            toast({
              title: "Text Extraction Complete",
              description: `Successfully extracted text from ${doc.name}`,
            })
          } else if (doc.textExtractionStatus === "failed") {
            toast({
              title: "Text Extraction Failed",
              description: `Failed to extract text from ${doc.name}: ${doc.textExtractionError}`,
              variant: "destructive",
            })
          }
        }
      })
    }

    // Update refs and state
    previousDocsRef.current = storedDocs
    setDocuments(storedDocs)
    setDocumentStats(newStats)
  }, [toast])

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      loadDocuments()
      toast({
        title: "Refreshed",
        description: "Document status updated successfully",
      })
    } catch (error) {
      console.error("Refresh error:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh document status",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [loadDocuments, toast])

  // Initial load and polling setup
  useEffect(() => {
    // Initial load
    loadDocuments()

    // Set up polling for processing documents
    const startPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }

      pollIntervalRef.current = setInterval(() => {
        const currentDocs = getStoredDocuments()
        const hasProcessing = currentDocs.some(
          (doc) => doc.textExtractionStatus === "processing" || doc.textExtractionStatus === "pending",
        )

        // Only update if there are processing documents or if there are changes
        if (hasProcessing) {
          const currentDocsString = JSON.stringify(currentDocs)
          const existingDocsString = JSON.stringify(previousDocsRef.current)

          if (currentDocsString !== existingDocsString) {
            // Check for status changes and show notifications
            const previousDocs = previousDocsRef.current
            currentDocs.forEach((doc) => {
              const prevDoc = previousDocs.find((p) => p.id === doc.id)
              if (prevDoc && prevDoc.textExtractionStatus !== doc.textExtractionStatus) {
                if (doc.textExtractionStatus === "completed") {
                  toast({
                    title: "Text Extraction Complete",
                    description: `Successfully extracted text from ${doc.name}`,
                  })
                } else if (doc.textExtractionStatus === "failed") {
                  toast({
                    title: "Text Extraction Failed",
                    description: `Failed to extract text from ${doc.name}: ${doc.textExtractionError}`,
                    variant: "destructive",
                  })
                }
              }
            })

            // Update state
            previousDocsRef.current = currentDocs
            setDocuments(currentDocs)
            setDocumentStats(getDocumentStats())
          }
        }
      }, 2000) // Back to 2 second polling to be less aggressive
    }

    startPolling()

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [loadDocuments, toast])

  // Focus/visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab, refresh documents
        const currentDocs = getStoredDocuments()
        const currentDocsString = JSON.stringify(currentDocs)
        const existingDocsString = JSON.stringify(previousDocsRef.current)

        if (currentDocsString !== existingDocsString) {
          previousDocsRef.current = currentDocs
          setDocuments(currentDocs)
          setDocumentStats(getDocumentStats())
        }
      }
    }

    const handleFocus = () => {
      // Window gained focus, refresh documents
      const currentDocs = getStoredDocuments()
      const currentDocsString = JSON.stringify(currentDocs)
      const existingDocsString = JSON.stringify(previousDocsRef.current)

      if (currentDocsString !== existingDocsString) {
        previousDocsRef.current = currentDocs
        setDocuments(currentDocs)
        setDocumentStats(getDocumentStats())
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const issuers = [
    { value: "american-express", label: "American Express" },
    { value: "chase", label: "Chase" },
    { value: "capital-one", label: "Capital One" },
    { value: "citi", label: "Citi" },
    { value: "discover", label: "Discover" },
    { value: "wells-fargo", label: "Wells Fargo" },
    { value: "bank-of-america", label: "Bank of America" },
  ]

  const products = [
    { value: "all", label: "All Products" },
    { value: "amex-gold", label: "Gold Card" },
    { value: "amex-platinum", label: "Platinum Card" },
    { value: "amex-green", label: "Green Card" },
    { value: "amex-blue", label: "Blue Cash" },
    { value: "chase-sapphire", label: "Sapphire" },
    { value: "chase-freedom", label: "Freedom" },
  ]

  const documentTypes = [
    { value: "brand-guidelines", label: "Brand Guidelines" },
    { value: "compliance-rules", label: "Compliance Rules" },
    { value: "legal-requirements", label: "Legal Requirements" },
  ]

  const getTypeBadge = (type: StoredDocument["type"]) => {
    const variants = {
      "brand-guidelines": "bg-green-100 text-green-800 border-green-200",
      "compliance-rules": "bg-orange-100 text-orange-800 border-orange-200",
      "legal-requirements": "bg-purple-100 text-purple-800 border-purple-200",
    }

    const labels = {
      "brand-guidelines": "Brand Guidelines",
      "compliance-rules": "Compliance Rules",
      "legal-requirements": "Legal Requirements",
    }

    return <Badge className={`${variants[type]} border font-medium`}>{labels[type]}</Badge>
  }

  const getTextExtractionBadge = (status: StoredDocument["textExtractionStatus"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
            <CheckCircle className="h-3 w-3" />
            Text Extracted
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
            <Clock className="h-3 w-3 animate-spin" />
            Processing...
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
    }
  }

  const getIssuerLabel = (issuer: string) => {
    return issuers.find((i) => i.value === issuer)?.label || issuer
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadForm((prev) => ({ ...prev, files }))
    setShowUploadDialog(true)
  }

  const handleUpload = async () => {
    if (!uploadForm.issuer || !uploadForm.type || uploadForm.files.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select an issuer, document type, and upload at least one file.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const uploadPromises = uploadForm.files.map(async (file, index) => {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        const document = await uploadDocumentFile(file, {
          issuer: uploadForm.issuer,
          product: uploadForm.product || "all",
          type: uploadForm.type as StoredDocument["type"],
        })

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

        toast({
          title: "Upload Successful",
          description: `${file.name} uploaded successfully. Text extraction in progress.`,
        })

        return document
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        })
        throw error
      }
    })

    try {
      await Promise.all(uploadPromises)
      loadDocuments()
      setShowUploadDialog(false)
      setUploadForm({ issuer: "", product: "", type: "", files: [] })
      setUploadProgress({})
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownload = async (doc: StoredDocument) => {
    try {
      const response = await fetch(doc.blobUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: `Downloading ${doc.name}...`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download the document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (docId: string) => {
    setDocumentToDelete(docId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      try {
        await deleteDocument(documentToDelete)
        loadDocuments()
        toast({
          title: "Document Deleted",
          description: "The document has been successfully deleted.",
        })
      } catch (error) {
        console.error("Delete error:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete the document. Please try again.",
          variant: "destructive",
        })
      } finally {
        setDocumentToDelete(null)
        setShowDeleteDialog(false)
      }
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesIssuer = selectedIssuer === "all" || doc.issuer === selectedIssuer
    const matchesType = selectedType === "all" || doc.type === selectedType
    return matchesIssuer && matchesType
  })

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    setUploadForm((prev) => ({ ...prev, files }))
    setShowUploadDialog(true)
  }

  // Count processing documents for status display
  const processingCount = documents.filter(
    (doc) => doc.textExtractionStatus === "processing" || doc.textExtractionStatus === "pending",
  ).length

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Brand Guidelines Management</CardTitle>
            <CardDescription className="text-green-100">
              Upload and manage brand compliance documents for each issuer and product
            </CardDescription>
            <div className="flex gap-4 text-sm text-green-100 mt-2">
              <span>Total Documents: {documentStats.total}</span>
              <span>With Text: {documentStats.withExtractedText}</span>
              {processingCount > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 animate-spin" />
                  Processing: {processingCount}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Document Storage Active</p>
                <p className="text-sm">
                  Documents are uploaded to cloud storage and processed for text extraction.
                  {processingCount > 0 && ` ${processingCount} document(s) currently processing.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Upload Section */}
        <Card
          className={`border-dashed border-2 transition-all duration-200 ${
            isDragActive
              ? "border-green-500 bg-green-50 shadow-lg"
              : "border-green-300 hover:border-green-400 bg-gradient-to-br from-white to-green-50/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload New Document</h3>
              <p className="text-gray-600 mb-4">Upload PDF, TXT, or other document files</p>
              <Button
                onClick={handleFileSelect}
                className="gap-2 bg-green-600 hover:bg-green-700 shadow-md"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Publishers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Publishers</SelectItem>
              {issuers.map((issuer) => (
                <SelectItem key={issuer.value} value={issuer.value}>
                  {issuer.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-md transition-shadow border-l-4 border-l-green-500 bg-gradient-to-r from-white to-green-50/20"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeBadge(doc.type)}
                        <Badge variant="outline">{getIssuerLabel(doc.issuer)}</Badge>
                        {getTextExtractionBadge(doc.textExtractionStatus)}
                        <span className="text-sm text-gray-500">{doc.fileSize}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Uploaded {doc.uploadedAt}</p>
                      {doc.textExtractionError && (
                        <p className="text-xs text-red-500 mt-1">Error: {doc.textExtractionError}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleDownload(doc)}>
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found matching the current filters.</p>
                <p className="text-sm mt-1">Upload some documents to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upload Documents</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowUploadDialog(false)} disabled={isLoading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Files Selected</Label>
                  <div className="text-sm text-gray-600 space-y-1">
                    {uploadForm.files.map((file) => (
                      <div key={file.name} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        {uploadProgress[file.name] !== undefined && (
                          <div className="w-20">
                            <Progress value={uploadProgress[file.name]} className="h-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Publisher *</Label>
                  <Select
                    value={uploadForm.issuer}
                    onValueChange={(value) => setUploadForm((prev) => ({ ...prev, issuer: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select publisher" />
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

                <div>
                  <Label>Product</Label>
                  <Select
                    value={uploadForm.product}
                    onValueChange={(value) => setUploadForm((prev) => ({ ...prev, product: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.value} value={product.value}>
                          {product.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Document Type *</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(value) => setUploadForm((prev) => ({ ...prev, type: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadForm.issuer || !uploadForm.type || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Uploading..." : "Upload Documents"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirm Deletion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this document? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1">
                    Delete Document
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
