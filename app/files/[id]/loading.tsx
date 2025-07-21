import { Loader2, FileText, Hash } from "lucide-react"

export default function FileDetailsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-gray-300" />
          <Hash className="h-6 w-6 text-gray-300" />
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
        <p className="text-sm text-gray-600">Loading file details...</p>
      </div>
    </div>
  )
}
