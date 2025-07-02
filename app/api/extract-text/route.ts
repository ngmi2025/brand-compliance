import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    let extractedText = ""

    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      // Handle TXT files
      const text = await file.text()
      extractedText = text
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // Handle PDF files - placeholder for now
      // TODO: Add pdf-parse library for full PDF text extraction
      extractedText = `[PDF Document: ${file.name}]
      
This is a placeholder for PDF text extraction. The document "${file.name}" has been uploaded successfully.

To enable full PDF text extraction, install the pdf-parse library:
npm install pdf-parse

Key information that would be extracted:
- Document title and headers
- Brand guidelines and requirements
- Compliance rules and regulations
- Legal disclaimers and requirements

File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Upload date: ${new Date().toISOString()}

This document will be used to enhance AI compliance analysis for better accuracy and more specific recommendations.`
    } else {
      // Handle other document types
      extractedText = `[Document: ${file.name}]
      
Document type: ${fileType}
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Upload date: ${new Date().toISOString()}

This document has been uploaded and will be used for compliance analysis. For full text extraction, please upload PDF or TXT files.`
    }

    return NextResponse.json({
      extractedText,
      fileType,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Text extraction error:", error)
    return NextResponse.json({ error: "Failed to extract text from document" }, { status: 500 })
  }
}
