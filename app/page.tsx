"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import HomeDashboardPage from "@/components/pages/home-dashboard-page"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, router])

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null
  }

  return <HomeDashboardPage />
}
