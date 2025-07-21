"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"

type UploadStatus = "idle" | "uploading" | "success" | "error"

export default function SapFicoUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = [".pdf", ".txt"]
  const acceptedMimeTypes = ["application/pdf", "text/plain"]

  const validateFile = (file: File): boolean => {
    return acceptedMimeTypes.includes(file.type) || acceptedTypes.some((type) => file.name.toLowerCase().endsWith(type))
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setUploadStatus("idle")
      } else {
        setUploadStatus("error")
        setSelectedFile(null)
      }
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setUploadStatus("idle")
      } else {
        setUploadStatus("error")
        setSelectedFile(null)
      }
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus("uploading")

    // Simulate upload process
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // Randomly simulate success or error for demo
      if (Math.random() > 0.2) {
        setUploadStatus("success")
      } else {
        setUploadStatus("error")
      }
    } catch (error) {
      setUploadStatus("error")
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case "uploading":
        return "Uploading..."
      case "success":
        return "Success"
      case "error":
        return "Error"
      default:
        return ""
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SAP FICO Vector Uploader</h1>
          <p className="text-gray-600">Upload your SAP FICO documents for processing</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-lg">Document Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : selectedFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleFileSelect} className="hidden" />

              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button variant="outline" size="sm" onClick={resetUpload} disabled={uploadStatus === "uploading"}>
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Drag and drop your file here, or</p>
                    <Button variant="outline" onClick={handleBrowseClick} disabled={uploadStatus === "uploading"}>
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Supports PDF and TXT files only</p>
                </div>
              )}
            </div>

            {uploadStatus !== "idle" && (
              <div className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-50">
                {getStatusIcon()}
                <span
                  className={`text-sm font-medium ${
                    uploadStatus === "success"
                      ? "text-green-700"
                      : uploadStatus === "error"
                        ? "text-red-700"
                        : "text-blue-700"
                  }`}
                >
                  {getStatusText()}
                </span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === "uploading" || uploadStatus === "success"}
              className="w-full"
            >
              {uploadStatus === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>

            {uploadStatus === "success" && (
              <Button variant="outline" onClick={resetUpload} className="w-full bg-transparent">
                Upload Another File
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
