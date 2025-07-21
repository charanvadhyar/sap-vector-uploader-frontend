"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Search, Eye, Play, Trash2, FileText, AlertTriangle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { filesApi, FileResponse } from "@/lib/api"

// Define file status type
type FileStatus = "Pending" | "Processing" | "Embedded" | "Stored" | "Error"

// Map API response to our frontend model
export interface UploadedFile {
  id: string
  fileName: string
  status: FileStatus
  uploadDate: string
  fileType: string
  fileSize: number
  totalChunks: number
}

export default function FilesListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch files from API on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true)
        const data = await filesApi.getFiles()
        
        // Map API response to our frontend model
        const mappedFiles: UploadedFile[] = data.map((file: FileResponse) => ({
          id: file.id,
          fileName: file.filename,
          status: file.status as FileStatus,
          uploadDate: file.upload_date,
          fileType: file.file_type,
          fileSize: file.file_size,
          totalChunks: file.total_chunks
        }))
        
        setFiles(mappedFiles)
        setError(null)
      } catch (err) {
        console.error('Error fetching files:', err)
        setError('Failed to load files. Please try again.')
        toast({
          title: "Error",
          description: "Could not load files from server",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFiles()
  }, [])

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

    const [processingFiles, setProcessingFiles] = useState<Record<string, boolean>>({}) 
  const [deletingFiles, setDeletingFiles] = useState<Record<string, boolean>>({})
  
  const handleProcess = async (file: UploadedFile) => {
    try {
      setProcessingFiles(prev => ({ ...prev, [file.id]: true }))
      
      // Update UI immediately to show processing state
      setFiles(prevFiles => prevFiles.map(f => 
        f.id === file.id ? { ...f, status: "Processing" } : f
      ))
      
      // Call API to process file
      const result = await filesApi.processFile(file.id)
      
      // Update file status based on API response
      setFiles(prevFiles => prevFiles.map(f => 
        f.id === file.id ? { ...f, status: result.status as FileStatus } : f
      ))
      
      toast({
        title: "File processing started",
        description: result.message || "File is being processed",
      })
    } catch (err) {
      console.error("Error processing file:", err)
      
      // Revert status on error
      setFiles(prevFiles => prevFiles.map(f => 
        f.id === file.id ? { ...f, status: "Error" } : f
      ))
      
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "Could not process file",
        variant: "destructive"
      })
    } finally {
      setProcessingFiles(prev => ({ ...prev, [file.id]: false }))
    }
  }

  const handleDelete = async (file: UploadedFile) => {
    try {
      setDeletingFiles(prev => ({ ...prev, [file.id]: true }))
      
      // Call API to delete file
      await filesApi.deleteFile(file.id)
      
      // Remove file from UI
      setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id))
      
      toast({
        title: "File deleted",
        description: `${file.fileName} was deleted successfully`,
      })
    } catch (err) {
      console.error("Error deleting file:", err)
      
      toast({
        title: "Deletion failed",
        description: err instanceof Error ? err.message : "Could not delete file",
        variant: "destructive"
      })
    } finally {
      setDeletingFiles(prev => ({ ...prev, [file.id]: false }))
    }
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-green-100 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Files</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">{files.length}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-blue-100 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-blue-700" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Chunks</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {files.reduce((acc, file) => acc + (file.totalChunks || 0), 0)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-yellow-100 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-700" />
                </div>
                <span className="text-sm font-medium text-gray-600">Pending/Processing</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {files.filter((f) => f.status === "Pending" || f.status === "Processing").length}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-red-100 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                </div>
                <span className="text-sm font-medium text-gray-600">Errors</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {files.filter((f) => f.status === "Error").length}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

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
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredFiles.length === 0 ? (
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
                            {file.status === "Processing" && (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            )}
                            {file.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(file.uploadDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/files/${file.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View file</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcess(file)}
                              disabled={file.status === "Processing" || file.status === "Embedded" || processingFiles[file.id]}
                              className="h-8 w-8 p-0"
                            >
                              {processingFiles[file.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="sr-only">Process file</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(file)}
                              disabled={deletingFiles[file.id]}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingFiles[file.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
