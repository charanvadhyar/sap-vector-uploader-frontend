"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Database, FileText, Hash, Loader } from "lucide-react"
import { ChunkModal } from "@/components/chunk-modal"
import { toast } from "@/components/ui/use-toast"
import { filesApi, ChunkResponse } from "@/lib/api"

interface AdminChunk {
  id: string
  chunkNumber: number
  tokenCount: number
  text: string
  fileName: string
  createdAt: string
  fileId: string
}

export default function ChunksListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChunk, setSelectedChunk] = useState<AdminChunk | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allChunks, setAllChunks] = useState<AdminChunk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch all chunks from the backend
  useEffect(() => {
    const fetchAllChunks = async () => {
      try {
        setIsLoading(true)
        // Get all files first
        const files = await filesApi.getFiles()
        
        // For each file, get its chunks
        const allChunksPromises = files.map(async (file) => {
          try {
            const fileDetails = await filesApi.getFileDetails(file.id)
            // Map API response to our frontend model
            return fileDetails.chunks.map(chunk => ({
              id: chunk.id,
              chunkNumber: chunk.chunk_number,
              tokenCount: chunk.token_count,
              text: chunk.text,
              fileName: file.filename,
              createdAt: chunk.created_at,
              fileId: file.id
            }))
          } catch (err) {
            console.error(`Error fetching chunks for file ${file.id}:`, err)
            return []
          }
        })
        
        // Wait for all promises to resolve
        const chunksArrays = await Promise.all(allChunksPromises)
        // Flatten the array of arrays
        const chunks = chunksArrays.flat()
        
        setAllChunks(chunks)
        setError(null)
      } catch (err) {
        console.error('Error fetching chunks:', err)
        setError('Failed to load chunks. Please try again.')
        toast({
          title: "Error",
          description: "Could not load chunks from server",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllChunks()
  }, [])

  const filteredChunks = useMemo(() => {
    if (!searchTerm) return allChunks

    return allChunks.filter(
      (chunk) =>
        chunk.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chunk.fileName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, allChunks])

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

  const totalTokens = allChunks.reduce((sum: number, chunk: AdminChunk) => sum + chunk.tokenCount, 0)
  const uniqueFiles = new Set(allChunks.map((chunk: AdminChunk) => chunk.fileName)).size

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center text-gray-500 text-sm">
                <Hash className="mr-1 h-4 w-4" />
                <span>Total Chunks</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin mr-1 h-4 w-4" />
                    Loading...
                  </span>
                ) : (
                  filteredChunks.length
                )}
              </p>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                          <span className="text-gray-500">Loading chunks...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredChunks.length === 0 ? (
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
