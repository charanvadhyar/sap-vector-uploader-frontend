"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Database, Hash, CheckCircle, Loader2, XCircle, LayoutDashboard, AlertCircle } from "lucide-react"
import { filesApi, FileResponse, ChunkResponse } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

type FileStatus = "Stored" | "Embedded" | "Pending" | "Processing" | "Error"

interface FileData {
  id: string
  status: FileStatus
}

interface ChunkData {
  id: string
  tokenCount: number
}

export default function HomeDashboardPage() {
  const [files, setFiles] = useState<FileData[]>([])
  const [chunks, setChunks] = useState<ChunkData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch files data
        const filesData = await filesApi.getFiles()
        const filesList: FileData[] = filesData.map((file: FileResponse) => ({
          id: file.id,
          status: file.status as FileStatus
        }))
        
        setFiles(filesList)
        
        // Fetch chunks data by getting details for each file
        const allChunks: ChunkData[] = []
        
        for (const file of filesData) {
          try {
            const fileDetails = await filesApi.getFileDetails(file.id)
            
            // Add chunks from this file to our collection
            const fileChunks = fileDetails.chunks.map((chunk: ChunkResponse) => ({
              id: chunk.id,
              tokenCount: chunk.token_count
            }))
            
            allChunks.push(...fileChunks)
          } catch (err) {
            console.error(`Error fetching chunks for file ${file.id}:`, err)
          }
        }
        
        setChunks(allChunks)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
        toast({
          title: "Error",
          description: "Could not load dashboard data from server",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  const totalFiles = files.length
  const totalChunks = chunks.length
  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0)

  const filesByStatus = {
    Stored: files.filter((f) => f.status === "Stored").length,
    Embedded: files.filter((f) => f.status === "Embedded").length,
    Pending: files.filter((f) => f.status === "Pending" || f.status === "Processing").length,
    Error: files.filter((f) => f.status === "Error").length,
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              <span>Dashboard Overview</span>
            </h1>
            <p className="text-gray-600 mt-1">Key metrics and insights for your SAP FICO documents</p>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files Uploaded</p>
                {isLoading ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center mt-2 text-red-500">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    <span>Error</span>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalFiles}</p>
                )}
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-70" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Chunks Stored</p>
                {isLoading ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-5 w-5 text-green-500 animate-spin mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center mt-2 text-red-500">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    <span>Error</span>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalChunks}</p>
                )}
              </div>
              <Database className="h-10 w-10 text-green-500 opacity-70" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens Processed</p>
                {isLoading ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-5 w-5 text-purple-500 animate-spin mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center mt-2 text-red-500">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    <span>Error</span>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalTokens.toLocaleString()}</p>
                )}
              </div>
              <Hash className="h-10 w-10 text-purple-500 opacity-70" />
            </CardContent>
          </Card>
        </div>

        {/* Files by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Files by Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Stored</p>
                    <p className="text-2xl font-bold text-green-900">{filesByStatus.Stored}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Embedded</p>
                    <p className="text-2xl font-bold text-blue-900">{filesByStatus.Embedded}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{filesByStatus.Pending}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-2xl font-bold text-red-900">{filesByStatus.Error}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
