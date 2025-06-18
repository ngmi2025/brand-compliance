import { put, del } from "@vercel/blob"

export interface StoredDocument {
  id: string
  name: string
  issuer: string
  product: string
  type: "brand-guidelines" | "compliance-rules" | "legal-requirements"
  fileSize: string
  uploadedAt: string
  blobUrl: string
  extractedText?: string
  textExtractionStatus: "pending" | "processing" | "completed" | "failed"
  textExtractionError?: string
}

// Storage key for localStorage (will migrate to DB later)
const STORAGE_KEY = "brand_documents"

// Get all stored documents from localStorage
export function getStoredDocuments(): StoredDocument[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading stored documents:", error)
    return []
  }
}

// Save documents to localStorage
function saveDocuments(documents: StoredDocument[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
  } catch (error) {
    console.error("Error saving documents:", error)
  }
}

// Upload document file to Vercel Blob and extract text
export async function uploadDocumentFile(
  file: File,
  metadata: {
    issuer: string
    product: string
    type: "brand-guidelines" | "compliance-rules" | "legal-requirements"
  },
): Promise<StoredDocument> {
  try {
    let blobUrl = ""

    try {
      // Upload to Vercel Blob (token is available server-side)
      const blob = await put(file.name, file, {
        access: "public",
      })
      blobUrl = blob.url
    } catch (blobError) {
      console.warn("Vercel Blob upload failed, using fallback:", blobError)
      // Create a temporary blob URL as fallback
      blobUrl = URL.createObjectURL(file)
    }

    // Create document record
    const document: StoredDocument = {
      id: Date.now().toString(),
      name: file.name,
      issuer: metadata.issuer,
      product: metadata.product,
      type: metadata.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      blobUrl: blobUrl,
      textExtractionStatus: "pending",
    }

    // Save to localStorage
    const documents = getStoredDocuments()
    documents.push(document)
    saveDocuments(documents)

    // Start text extraction in background
    extractTextFromDocument(document.id, file)

    return document
  } catch (error) {
    console.error("Error uploading document:", error)
    throw new Error("Failed to upload document")
  }
}

// Extract text from uploaded document
async function extractTextFromDocument(documentId: string, file: File): Promise<void> {
  try {
    // Update status to processing
    updateDocumentTextStatus(documentId, "processing")

    // Create FormData for file upload
    const formData = new FormData()
    formData.append("file", file)

    // Call text extraction API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch("/api/extract-text", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Text extraction failed: ${response.status} - ${errorText}`)
    }

    const { extractedText } = await response.json()

    // Update document with extracted text
    const documents = getStoredDocuments()
    const docIndex = documents.findIndex((doc) => doc.id === documentId)

    if (docIndex !== -1) {
      documents[docIndex].extractedText = extractedText
      documents[docIndex].textExtractionStatus = "completed"
      delete documents[docIndex].textExtractionError // Clear any previous errors
      saveDocuments(documents)
    }
  } catch (error) {
    console.error("Error extracting text:", error)
    let errorMessage = "Unknown error"

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Text extraction timed out"
      } else {
        errorMessage = error.message
      }
    }

    updateDocumentTextStatus(documentId, "failed", errorMessage)
  }
}

// Update document text extraction status
function updateDocumentTextStatus(
  documentId: string,
  status: StoredDocument["textExtractionStatus"],
  error?: string,
): void {
  const documents = getStoredDocuments()
  const docIndex = documents.findIndex((doc) => doc.id === documentId)

  if (docIndex !== -1) {
    documents[docIndex].textExtractionStatus = status
    if (error) {
      documents[docIndex].textExtractionError = error
    }
    saveDocuments(documents)
  }
}

// Get documents for specific issuer (for compliance analysis)
export function getDocumentsForCompliance(issuer: string): StoredDocument[] {
  const documents = getStoredDocuments()
  return documents.filter(
    (doc) => doc.issuer === issuer && doc.textExtractionStatus === "completed" && doc.extractedText,
  )
}

// Delete document
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const documents = getStoredDocuments()
    const document = documents.find((doc) => doc.id === documentId)

    if (document) {
      // Delete from Vercel Blob
      try {
        await del(document.blobUrl)
      } catch (error) {
        console.warn("Failed to delete blob:", error)
        // Continue with local deletion even if blob deletion fails
      }

      // Remove from localStorage
      const updatedDocuments = documents.filter((doc) => doc.id !== documentId)
      saveDocuments(updatedDocuments)
    }
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

// Get document statistics
export function getDocumentStats(): {
  total: number
  byIssuer: Record<string, number>
  byType: Record<string, number>
  withExtractedText: number
} {
  const documents = getStoredDocuments()

  const stats = {
    total: documents.length,
    byIssuer: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    withExtractedText: documents.filter((doc) => doc.textExtractionStatus === "completed").length,
  }

  documents.forEach((doc) => {
    stats.byIssuer[doc.issuer] = (stats.byIssuer[doc.issuer] || 0) + 1
    stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1
  })

  return stats
}

// Enhanced function to get brand document content for AI prompts
export function getBrandDocumentContent(issuer: string): string {
  const documents = getDocumentsForCompliance(issuer)

  if (documents.length === 0) {
    return ""
  }

  const content = documents
    .map((doc) => {
      return `
=== ${doc.name} (${doc.type}) ===
${doc.extractedText}
`
    })
    .join("\n\n")

  return content
}
