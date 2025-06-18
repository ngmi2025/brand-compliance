import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const SITE_PASSWORD = process.env.SITE_PASSWORD || "admin123" // Set this in your environment variables

export async function POST(request: NextRequest) {
  try {
    const { password, rememberMe } = await request.json()

    if (password !== SITE_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Create session token (in production, use a proper JWT or session ID)
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Set cookie with appropriate expiration
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day

    const cookieStore = await cookies()
    cookieStore.set("auth-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
