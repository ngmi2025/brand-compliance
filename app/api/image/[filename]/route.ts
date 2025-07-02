import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename

    // Security check - only allow specific image files
    const allowedImages = [
      "amex-creative-1.png",
      "amex-creative-2.png",
      "amex-creative-3.png",
      "amex-dunkin-1.png",
      "amex-dunkin-2.png",
      "amex-dunkin-3.png",
    ]

    if (!allowedImages.includes(filename)) {
      return new NextResponse("Image not found", { status: 404 })
    }

    // Read the file from the public directory
    const imagePath = join(process.cwd(), "public", filename)
    const imageBuffer = await readFile(imagePath)

    // Determine content type based on file extension
    const contentType = filename.endsWith(".png") ? "image/png" : "image/jpeg"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return new NextResponse("Image not found", { status: 404 })
  }
}
