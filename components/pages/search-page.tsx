"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { queryApi, QueryResultChunk } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<QueryResultChunk[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      toast({
        title: "Empty search query",
        description: "Please enter a search term",
        variant: "destructive"
      })
      return
    }
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to search documents",
        variant: "destructive"
      })
      router.push('/login')
      return
    }
    
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const response = await queryApi.search({
        query: query.trim(),
        limit: 10
      })
      
      setResults(response.chunks)
      
      if (response.chunks.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search query",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      
      // Check if error is auth related
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: "Authentication expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        })
        router.push('/login')
      } else {
        toast({
          title: "Search failed",
          description: errorMessage || "Could not perform search. Please try again.",
          variant: "destructive"
        })
      }
      
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Format similarity score as a percentage
  const formatSimilarity = (similarity: number): string => {
    return `${(similarity * 100).toFixed(1)}%`
  }
  
  // Truncate text for preview
  const truncateText = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
  
  // Highlight query terms in the text
  const highlightQuery = (text: string): React.ReactElement => {
    if (!query.trim()) return <>{text}</>
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark> 
            : part
        )}
      </>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Documents</h1>
          <p className="text-gray-600">Search through your processed SAP FICO documents using vector similarity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vector Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-grow relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search for concepts, terms, or information..."
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isSearching ? (
                  "Searching..."
                ) : results.length > 0 ? (
                  `${results.length} Result${results.length > 1 ? 's' : ''} for "${query}"`
                ) : (
                  `No results found for "${query}"`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                // Loading skeletons
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </div>
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{result.filename}</span>
                        <Badge className="ml-auto">
                          Match: {formatSimilarity(result.similarity)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {highlightQuery(truncateText(result.text))}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Chunk {result.chunk_number} · {result.token_count} tokens
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results match your search criteria.</p>
                  <p className="text-sm text-gray-400 mt-1">Try using different keywords or broader terms.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
