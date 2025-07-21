"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, RefreshCw, FileText, Calendar, Hash, Activity, Eye } from "lucide-react"
import { ChunkModal } from "@/components/chunk-modal"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { filesApi, FileDetailResponse, ChunkResponse } from "@/lib/api"

type FileStatus = "Pending" | "Embedded" | "Stored" | "Error"

interface FileChunk {
  id: string
  chunkNumber: number
  tokenCount: number
  text: string
}

interface FileDetails {
  id: string
  fileName: string
  uploadDate: string
  status: FileStatus
  totalChunks: number
  chunks: FileChunk[]
}

function mapApiResponseToFileDetails(response: FileDetailResponse): FileDetails {
  return {
    id: response.id,
    fileName: response.filename,
    uploadDate: response.upload_date,
    status: mapApiStatus(response.status),
    totalChunks: response.total_chunks,
    chunks: response.chunks.map(mapApiChunkToFileChunk),
  }
}

function mapApiChunkToFileChunk(chunk: ChunkResponse): FileChunk {
  return {
    id: chunk.id,
    chunkNumber: chunk.chunk_number,
    tokenCount: chunk.token_count,
    text: chunk.text,
  }
}

function mapApiStatus(status: string): FileStatus {
  switch (status.toLowerCase()) {
    case "embedded":
      return "Embedded"
    case "stored":
      return "Stored"
    case "pending":
    case "processing":
      return "Pending"
    case "error":
    case "failed":
      return "Error"
    default:
      return "Pending"
  }
}

interface FileDetailsPageProps {
  fileId: string
}

export default function FileDetailsPage({ fileId }: FileDetailsPageProps) {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null)
  const [isReEmbedding, setIsReEmbedding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChunk, setSelectedChunk] = useState<FileChunk | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const getStatusBadgeVariant = (status: FileStatus) => {
    switch (status) {
      case "Stored":
        return "default"
      case "Embedded":
        return "secondary"
      case "Pending":
        return "outline"
      case "Error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case "Stored":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Embedded":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Error":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view file details",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    fetchFileDetails()
  }, [fileId, isAuthenticated, router])

  const fetchFileDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await filesApi.getFileDetails(fileId)
      const mappedData = mapApiResponseToFileDetails(response)
      setFileDetails(mappedData)
    } catch (err) {
      console.error("Error fetching file details:", err)
      setError(err instanceof Error ? err.message : "Failed to load file details")
      toast({
        title: "Error",
        description: `Could not load file details: ${err instanceof Error ? err.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReEmbed = async () => {
    try {
      setIsReEmbedding(true)
      await filesApi.processFile(fileId)
      toast({
        title: "Processing Started",
        description: "File re-processing has been initiated",
      })
      await fetchFileDetails()
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to re-process file: ${err instanceof Error ? err.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsReEmbedding(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const totalTokens = fileDetails?.chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) ?? 0

  const handleViewChunk = (chunk: FileChunk) => {
    setSelectedChunk(chunk)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChunk(null)
  }

  if (isLoading || !fileDetails) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-gray-500">Loading file details...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/files">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{fileDetails.fileName}</h1>
          </div>
          <Button
            onClick={handleReEmbed}
            className="flex items-center space-x-2"
            disabled={isReEmbedding}
          >
            <RefreshCw className={`h-4 w-4 ${isReEmbedding ? "animate-spin" : ""}`} />
            <span>Re-Process</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>File Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Upload Date</span>
                  </div>
                  <div className="font-medium">{formatDate(fileDetails.uploadDate)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>ID</span>
                  </div>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">{fileDetails.id}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Activity className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(fileDetails.status)}
                    className={getStatusColor(fileDetails.status)}
                  >
                    {fileDetails.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>File Name</span>
                  </div>
                  <p className="font-medium text-gray-900 break-all">{fileDetails.fileName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>Number of Chunks</span>
                  </div>
                  <p className="font-medium text-gray-900">{fileDetails.totalChunks}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Total Tokens:{" "}
                    <span className="font-medium text-gray-900">{totalTokens.toLocaleString()}</span>
                  </span>
                  <span>
                    Average Tokens per Chunk:{" "}
                    <span className="font-medium text-gray-900">
                      {fileDetails.totalChunks > 0 ? Math.round(totalTokens / fileDetails.totalChunks) : 0}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chunk Viewer */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Text Chunks ({fileDetails.chunks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fileDetails.chunks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No text chunks available for this file yet.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                  {fileDetails.chunks.map((chunk) => (
                    <AccordionItem key={chunk.id} value={chunk.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">Chunk #{chunk.chunkNumber}</span>
                            <Badge variant="outline" className="text-xs">
                              {chunk.tokenCount} tokens
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 hidden md:block">
                            {chunk.text.substring(0, 80)}...
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Chunk #{chunk.chunkNumber}</span>
                              <span>•</span>
                              <span>{chunk.tokenCount} tokens</span>
                              <span>•</span>
                              <span>{chunk.text.length} characters</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewChunk(chunk)}
                              className="flex items-center space-x-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Full</span>
                            </Button>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg border">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{chunk.text}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedChunk && (
        <ChunkModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          chunk={selectedChunk}
          fileName={fileDetails.fileName}
          createdTimestamp={fileDetails.uploadDate + "T10:30:00Z"}
        />
      )}
    </div>
  )
}
