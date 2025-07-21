import type { Metadata } from "next"
import FilesListPage from "@/components/pages/files-list-page"

export const metadata: Metadata = {
  title: "Uploaded Files - SAP FICO Vector Uploader",
  description: "View and manage uploaded SAP FICO documents",
}

export default function FilesPage() {
  return <FilesListPage />
}
