import type { Metadata } from "next"
import FileUploadPage from "@/components/pages/file-upload-page"

export const metadata: Metadata = {
  title: "Upload Files - SAP FICO Vector Uploader",
  description: "Upload SAP FICO documents for processing",
}

export default function UploadPage() {
  return <FileUploadPage />
}
