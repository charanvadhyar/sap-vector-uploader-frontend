import type { Metadata } from "next"
import HomeDashboardPage from "@/components/pages/home-dashboard-page"

export const metadata: Metadata = {
  title: "Dashboard - SAP FICO Vector Uploader",
  description: "Overview dashboard for SAP FICO document processing",
}

export default function HomePage() {
  return <HomeDashboardPage />
}
