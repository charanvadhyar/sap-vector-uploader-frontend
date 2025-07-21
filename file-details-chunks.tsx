"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, RefreshCw, FileText, Calendar, Hash, Activity, Eye } from "lucide-react"
import { ChunkModal } from "./components/chunk-modal"

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

// Mock data for demonstration
const mockFileDetails: FileDetails = {
  id: "1",
  fileName: "GL_Account_Master_Data.pdf",
  uploadDate: "2024-01-15",
  status: "Embedded",
  totalChunks: 8,
  chunks: [
    {
      id: "chunk-1",
      chunkNumber: 1,
      tokenCount: 245,
      text: "General Ledger Account Master Data Configuration in SAP FICO involves setting up the chart of accounts, defining account groups, and establishing field status variants. The chart of accounts serves as the foundation for all financial transactions and must be carefully structured to meet both local and international reporting requirements.",
    },
    {
      id: "chunk-2",
      chunkNumber: 2,
      tokenCount: 312,
      text: "Account groups in SAP determine the number range and field status for GL accounts. Each account group controls which fields are mandatory, optional, or display-only during account creation. Common account groups include balance sheet accounts (assets, liabilities, equity) and profit & loss accounts (revenue, expenses). The field status variant further refines field control at the company code level.",
    },
    {
      id: "chunk-3",
      chunkNumber: 3,
      tokenCount: 189,
      text: "GL account creation requires careful consideration of account type, reconciliation account settings, and tax relevance. Balance sheet accounts must specify whether they are assets or liabilities, while P&L accounts need proper assignment to functional areas for segment reporting.",
    },
    {
      id: "chunk-4",
      chunkNumber: 4,
      tokenCount: 278,
      text: "Document splitting functionality in SAP allows for real-time segmentation of financial data based on predefined characteristics such as profit center, segment, or business area. This feature ensures that balance sheet accounts are always balanced at the segment level, providing enhanced transparency for management reporting and compliance requirements.",
    },
    {
      id: "chunk-5",
      chunkNumber: 5,
      tokenCount: 156,
      text: "Validation and substitution rules can be configured to ensure data integrity and automate certain posting logic. These rules help maintain consistency across financial transactions and reduce manual errors during data entry.",
    },
    {
      id: "chunk-6",
      chunkNumber: 6,
      tokenCount: 203,
      text: "Integration with controlling (CO) module requires proper assignment of cost elements to GL accounts. Primary cost elements correspond directly to GL accounts, while secondary cost elements are used for internal allocations and assessments within the controlling framework.",
    },
    {
      id: "chunk-7",
      chunkNumber: 7,
      tokenCount: 167,
      text: "Currency handling in GL accounts supports both local and foreign currency postings. Accounts can be configured for currency translation, and exchange rate differences are automatically calculated and posted to designated accounts.",
    },
    {
      id: "chunk-8",
      chunkNumber: 8,
      tokenCount: 134,
      text: "Regular maintenance of GL account master data includes reviewing account descriptions, updating field status controls, and ensuring proper authorization controls are in place for account modifications.",
    },
  ],
}

export default function FileDetailsChunks() {
  const [fileDetails] = useState<FileDetails>(mockFileDetails)
  const [isReEmbedding, setIsReEmbedding] = useState(false)
  const [selectedChunk, setSelectedChunk] = useState<FileChunk | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleReEmbed = async () => {
    setIsReEmbedding(true)
    // Simulate re-embedding process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsReEmbedding(false)
    console.log("Re-embedding file:", fileDetails.fileName)
  }

  const handleGoBack = () => {
    console.log("Going back to dashboard")
    // Implement navigation back to dashboard
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const totalTokens = fileDetails.chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)

  const handleViewChunk = (chunk: FileChunk) => {
    setSelectedChunk(chunk)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChunk(null)
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">File Details & Chunks</h1>
              <p className="text-gray-600 mt-1">View and manage file content chunks</p>
            </div>
          </div>
          <Button onClick={handleReEmbed} disabled={isReEmbedding} className="flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${isReEmbedding ? "animate-spin" : ""}`} />
            <span>{isReEmbedding ? "Re-Embedding..." : "Re-Embed File"}</span>
          </Button>
        </div>

        {/* File Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>File Name</span>
                </div>
                <p className="font-medium text-gray-900 break-all">{fileDetails.fileName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Upload Date</span>
                </div>
                <p className="font-medium text-gray-900">{formatDate(fileDetails.uploadDate)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Hash className="h-4 w-4" />
                  <span>Number of Chunks</span>
                </div>
                <p className="font-medium text-gray-900">{fileDetails.totalChunks}</p>
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
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Total Tokens: <span className="font-medium text-gray-900">{totalTokens.toLocaleString()}</span>
                </span>
                <span>
                  Average Tokens per Chunk:{" "}
                  <span className="font-medium text-gray-900">{Math.round(totalTokens / fileDetails.totalChunks)}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chunks Accordion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Text Chunks ({fileDetails.chunks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <div className="text-sm text-gray-500 hidden md:block">{chunk.text.substring(0, 80)}...</div>
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
          </CardContent>
        </Card>
        <ChunkModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          chunk={selectedChunk}
          fileName={fileDetails.fileName}
          createdTimestamp={fileDetails.uploadDate + "T10:30:00Z"} // Mock timestamp
        />
      </div>
    </div>
  )
}
