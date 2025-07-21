import type { Metadata } from "next"
import FileDetailsPage from "@/components/pages/file-details-page"

export const metadata: Metadata = {
  title: "File Details - SAP FICO Vector Uploader",
  description: "View file details and chunks",
}

// Use generateStaticParams to define the static paths
export async function generateStaticParams() {
  // If you want to pre-render specific file IDs, you can return them here
  // For dynamic paths, return an empty array
  return []
}

interface FileDetailsPageProps {
  params: {
    id: string
  }
}

export default function FileDetails({ params }: FileDetailsPageProps) {
  // Use the id directly from params - no need to await in this pattern
  return <FileDetailsPage fileId={params.id} />
}
