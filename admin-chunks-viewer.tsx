"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Database, FileText, Hash } from "lucide-react"
import { ChunkModal } from "./components/chunk-modal"

interface AdminChunk {
  id: string
  chunkNumber: number
  tokenCount: number
  text: string
  fileName: string
  createdAt: string
  fileId: string
}

// Mock data for demonstration - chunks from multiple files
const mockAllChunks: AdminChunk[] = [
  {
    id: "chunk-1-1",
    chunkNumber: 1,
    tokenCount: 245,
    text: "General Ledger Account Master Data Configuration in SAP FICO involves setting up the chart of accounts, defining account groups, and establishing field status variants. The chart of accounts serves as the foundation for all financial transactions and must be carefully structured to meet both local and international reporting requirements.",
    fileName: "GL_Account_Master_Data.pdf",
    createdAt: "2024-01-15T10:30:00Z",
    fileId: "file-1",
  },
  {
    id: "chunk-1-2",
    chunkNumber: 2,
    tokenCount: 312,
    text: "Account groups in SAP determine the number range and field status for GL accounts. Each account group controls which fields are mandatory, optional, or display-only during account creation. Common account groups include balance sheet accounts (assets, liabilities, equity) and profit & loss accounts (revenue, expenses).",
    fileName: "GL_Account_Master_Data.pdf",
    createdAt: "2024-01-15T10:31:00Z",
    fileId: "file-1",
  },
  {
    id: "chunk-2-1",
    chunkNumber: 1,
    tokenCount: 189,
    text: "Vendor Invoice Processing in SAP FICO automates the three-way matching process between purchase orders, goods receipts, and vendor invoices. This process ensures accuracy and compliance while reducing manual intervention in accounts payable workflows.",
    fileName: "Vendor_Invoice_Processing.txt",
    createdAt: "2024-01-14T14:20:00Z",
    fileId: "file-2",
  },
  {
    id: "chunk-2-2",
    chunkNumber: 2,
    tokenCount: 278,
    text: "Invoice verification in SAP includes tolerance checks, tax calculations, and automatic posting to relevant GL accounts. The system can handle various invoice types including standard invoices, credit memos, and subsequent debits or credits.",
    fileName: "Vendor_Invoice_Processing.txt",
    createdAt: "2024-01-14T14:21:00Z",
    fileId: "file-2",
  },
  {
    id: "chunk-3-1",
    chunkNumber: 1,
    tokenCount: 156,
    text: "Asset Accounting in SAP FICO manages the complete lifecycle of fixed assets from acquisition to retirement. The module integrates with General Ledger and provides detailed depreciation calculations and reporting capabilities.",
    fileName: "Asset_Accounting_Guide.pdf",
    createdAt: "2024-01-13T09:15:00Z",
    fileId: "file-3",
  },
  {
    id: "chunk-3-2",
    chunkNumber: 2,
    tokenCount: 203,
    text: "Depreciation areas in Asset Accounting allow for parallel valuation of assets according to different accounting principles such as local GAAP, IFRS, and tax requirements. Each area can have its own depreciation methods and useful life settings.",
    fileName: "Asset_Accounting_Guide.pdf",
    createdAt: "2024-01-13T09:16:00Z",
    fileId: "file-3",
  },
  {
    id: "chunk-4-1",
    chunkNumber: 1,
    tokenCount: 167,
    text: "Cost Center Accounting provides detailed cost tracking and allocation capabilities within SAP Controlling. Cost centers represent organizational units where costs are incurred and can be used for internal reporting and analysis.",
    fileName: "Cost_Center_Hierarchy.txt",
    createdAt: "2024-01-12T16:45:00Z",
    fileId: "file-4",
  },
  {
    id: "chunk-4-2",
    chunkNumber: 2,
    tokenCount: 134,
    text: "Cost center planning involves setting budgets and forecasts for each cost center. The system supports various planning methods including top-down, bottom-up, and iterative planning approaches with approval workflows.",
    fileName: "Cost_Center_Hierarchy.txt",
    createdAt: "2024-01-12T16:46:00Z",
    fileId: "file-4",
  },
  {
    id: "chunk-5-1",
    chunkNumber: 1,
    tokenCount: 298,
    text: "Financial Reporting in SAP FICO encompasses standard reports, custom reports, and regulatory reporting requirements. The system provides real-time financial data through various reporting tools including Financial Statement Version, Report Painter, and SAP Analytics Cloud integration.",
    fileName: "Financial_Reporting_Manual.pdf",
    createdAt: "2024-01-11T11:30:00Z",
    fileId: "file-5",
  },
  {
    id: "chunk-5-2",
    chunkNumber: 2,
    tokenCount: 221,
    text: "Consolidation functionality in SAP allows for group reporting and elimination of intercompany transactions. The system supports various consolidation methods and can handle complex organizational structures with multiple legal entities.",
    fileName: "Financial_Reporting_Manual.pdf",
    createdAt: "2024-01-11T11:31:00Z",
    fileId: "file-5",
  },
  {
    id: "chunk-6-1",
    chunkNumber: 1,
    tokenCount: 185,
    text: "Budget Planning and Control in SAP FICO enables organizations to create, monitor, and control budgets across different organizational levels. The system supports commitment management and funds management for public sector requirements.",
    fileName: "Budget_Planning_Process.txt",
    createdAt: "2024-01-10T13:20:00Z",
    fileId: "file-6",
  },
  {
    id: "chunk-6-2",
    chunkNumber: 2,
    tokenCount: 159,
    text: "Budget monitoring includes availability checks, commitment tracking, and variance analysis. The system can automatically block transactions that exceed budget limits and provide real-time budget consumption reports.",
    fileName: "Budget_Planning_Process.txt",
    createdAt: "2024-01-10T13:21:00Z",
    fileId: "file-6",
  },
]

export default function AdminChunksViewer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChunk, setSelectedChunk] = useState<AdminChunk | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredChunks = useMemo(() => {
    if (!searchTerm) return mockAllChunks

    return mockAllChunks.filter(
      (chunk) =>
        chunk.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chunk.fileName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const handleViewChunk = (chunk: AdminChunk) => {
    setSelectedChunk(chunk)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChunk(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPreview = (text: string) => {
    return text.length > 100 ? text.substring(0, 100) + "..." : text
  }

  const totalTokens = mockAllChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)
  const uniqueFiles = new Set(mockAllChunks.map((chunk) => chunk.fileName)).size

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <span>All Chunks Viewer</span>
            </h1>
            <p className="text-gray-600 mt-1">Admin dashboard to view and manage all stored text chunks</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search chunks by content or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Chunks</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mockAllChunks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Unique Files</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueFiles}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Total Tokens</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalTokens.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Filtered Results</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredChunks.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chunks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>All Chunks ({filteredChunks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Preview</TableHead>
                    <TableHead className="w-[25%]">File Name</TableHead>
                    <TableHead className="w-[15%]">Token Count</TableHead>
                    <TableHead className="w-[15%]">Created At</TableHead>
                    <TableHead className="w-[5%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChunks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? "No chunks found matching your search." : "No chunks available."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChunks.map((chunk) => (
                      <TableRow key={chunk.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 leading-relaxed">{getPreview(chunk.text)}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Chunk #{chunk.chunkNumber}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-sm break-all">{chunk.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {chunk.tokenCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(chunk.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChunk(chunk)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View chunk details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Chunk Modal */}
        {selectedChunk && (
          <ChunkModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            chunk={{
              id: selectedChunk.id,
              chunkNumber: selectedChunk.chunkNumber,
              tokenCount: selectedChunk.tokenCount,
              text: selectedChunk.text,
            }}
            fileName={selectedChunk.fileName}
            createdTimestamp={selectedChunk.createdAt}
          />
        )}
      </div>
    </div>
  )
}
