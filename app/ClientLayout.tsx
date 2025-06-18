"use client"
import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-50 border-t py-4 px-6">
        <div className="text-center text-sm text-gray-600">
          Powered by UpgradedPoints.com • Simplifying brand compliance and credit card marketing.{" "}
          {isAdminPage ? (
            <Link href="/" className="font-bold underline hover:text-blue-600 transition-colors">
              Back to Tool
            </Link>
          ) : (
            <Link
              href="/admin"
              className="font-bold underline hover:text-blue-600 transition-colors"
              onClick={() => {
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100)
              }}
            >
              Access Admin section
            </Link>
          )}
          .
        </div>
      </footer>
    </div>
  )
}
