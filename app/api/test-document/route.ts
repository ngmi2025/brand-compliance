import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("Test API route called")

  try {
    return NextResponse.json({
      success: true,
      message: "Test API is working",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error?.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "GET test working",
  })
}
