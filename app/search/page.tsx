import type { Metadata } from "next"
import SearchPage from "@/components/pages/search-page"

export const metadata: Metadata = {
  title: "Search Documents - SAP FICO Vector Uploader",
  description: "Search through your SAP FICO documents using vector similarity",
}

export default function Search() {
  return <SearchPage />
}
