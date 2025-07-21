import { Loader2, FileText } from "lucide-react"

export default function FilesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <FileText className="h-8 w-8 text-gray-300" />
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 absolute -top-1 -right-1" />
        </div>
        <p className="text-sm text-gray-600">Loading files...</p>
      </div>
    </div>
  )
}
