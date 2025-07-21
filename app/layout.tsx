import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SAP FICO Vector Uploader",
  description: "Upload and manage SAP FICO documents for vector processing",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          {/* DashboardLayout will handle conditional rendering based on path */}
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
