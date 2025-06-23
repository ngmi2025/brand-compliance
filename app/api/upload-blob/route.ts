import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { customAlphabet } from "nanoid"

// Generate a random string for the filename
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12)

export async function POST(request: Request): Promise<NextResponse> {
  const file = request.body

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Get filename from the 'x-vercel-filename' header, or default to 'file'
  // Browsers and clients can set this header to suggest a filename.
  const originalFilename = request.headers.get("x-vercel-filename") || "file.txt" // Added .txt as a fallback extension
  const fileExtension = originalFilename.split(".").pop() || "bin" // Fallback extension
  const filename = `${nanoid()}.${fileExtension}`

  try {
    const blob = await put(filename, file, {
      access: "public",
      // Add content type if available, otherwise Vercel Blob will try to infer it
      // contentType: request.headers.get("content-type") || undefined,
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to upload file.", details: errorMessage }, { status: 500 })
  }
}
