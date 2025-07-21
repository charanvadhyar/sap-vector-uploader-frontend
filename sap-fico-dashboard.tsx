"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Play, Trash2, FileText } from "lucide-react"

type FileStatus = "Pending" | "Embedded" | "Stored" | "Error"

interface UploadedFile {
  id: string
  fileName: string
  status: FileStatus
  uploadDate: string
  fileType: string
}

// Mock data for demonstration
const mockFiles: UploadedFile[] = [
  {
    id: "1",
    fileName: "GL_Account_Master_Data.pdf",
    status: "Stored",
    uploadDate: "2024-01-15",
    fileType: "pdf",
  },
  {
    id: "2",
    fileName: "Vendor_Invoice_Processing.txt",
    status: "Embedded",
    uploadDate: "2024-01-14",
    fileType: "txt",
  },
  {
    id: "3",
    fileName: "Asset_Accounting_Guide.pdf",
    status: "Pending",
    uploadDate: "2024-01-13",
    fileType: "pdf",
  },
  {
    id: "4",
    fileName: "Cost_Center_Hierarchy.txt",
    status: "Error",
    uploadDate: "2024-01-12",
    fileType: "txt",
  },
  {
    id: "5",
    fileName: "Financial_Reporting_Manual.pdf",
    status: "Stored",
    uploadDate: "2024-01-11",
    fileType: "pdf",
  },
  {
    id: "6",
    fileName: "Budget_Planning_Process.txt",
    status: "Embedded",
    uploadDate: "2024-01-10",
    fileType: "txt",
  },
  {
    id: "7",
    fileName: "Accounts_Payable_Workflow.pdf",
    status: "Pending",
    uploadDate: "2024-01-09",
    fileType: "pdf",
  },
  {
    id: "8",
    fileName: "Tax_Configuration_Settings.txt",
    status: "Error",
    uploadDate: "2024-01-08",
    fileType: "txt",
  },
]

export default function SapFicoDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>(mockFiles)

  const filteredFiles = files.filter((file) => file.fileName.toLowerCase().includes(searchTerm.toLowerCase()))

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

  const handleView = (file: UploadedFile) => {
    console.log("Viewing file:", file.fileName)
    // Implement view functionality
  }

  const handleProcess = (file: UploadedFile) => {
    console.log("Processing file:", file.fileName)
    // Implement process functionality
    // Update file status to "Pending" when processing starts
    setFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? { ...f, status: "Pending" } : f)))
  }

  const handleDelete = (file: UploadedFile) => {
    console.log("Deleting file:", file.fileName)
    // Implement delete functionality
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uploaded SAP FICO Files</h1>
            <p className="text-gray-600 mt-1">Manage and process your SAP FICO documents</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Stored</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {files.filter((f) => f.status === "Stored").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Embedded</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {files.filter((f) => f.status === "Embedded").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {files.filter((f) => f.status === "Pending").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Error</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {files.filter((f) => f.status === "Error").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Files Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Files ({filteredFiles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {searchTerm ? "No files found matching your search." : "No files uploaded yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{file.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(file.status)} className={getStatusColor(file.status)}>
                            {file.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(file.uploadDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(file)} className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View file</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcess(file)}
                              disabled={file.status === "Pending"}
                              className="h-8 w-8 p-0"
                            >
                              <Play className="h-4 w-4" />
                              <span className="sr-only">Process file</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(file)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete file</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
