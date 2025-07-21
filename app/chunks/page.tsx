import type { Metadata } from "next"
import ChunksListPage from "@/components/pages/chunks-list-page"

export const metadata: Metadata = {
  title: "All Chunks - SAP FICO Vector Uploader",
  description: "Admin view of all text chunks",
}

export default function ChunksPage() {
  return <ChunksListPage />
}
