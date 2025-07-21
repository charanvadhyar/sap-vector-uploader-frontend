"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X, FileText, Hash, Calendar, Copy, Check } from "lucide-react"
import { useState } from "react"

interface ChunkModalProps {
  isOpen: boolean
  onClose: () => void
  chunk: {
    id: string
    chunkNumber: number
    tokenCount: number
    text: string
  } | null
  fileName: string
  createdTimestamp: string
}

export function ChunkModal({ isOpen, onClose, chunk, fileName, createdTimestamp }: ChunkModalProps) {
  const [copied, setCopied] = useState(false)

  if (!chunk) return null

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(chunk.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Chunk #{chunk.chunkNumber} Details</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>File Name</span>
              </div>
              <p className="font-medium text-gray-900 text-sm break-all">{fileName}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span>Token Count</span>
              </div>
              <Badge variant="outline" className="w-fit">
                {chunk.tokenCount} tokens
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Created</span>
              </div>
              <p className="font-medium text-gray-900 text-sm">{formatTimestamp(createdTimestamp)}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Chunk Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="flex items-center space-x-2 bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto border rounded-lg p-4 bg-white">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">{chunk.text}</p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Characters: <span className="font-medium text-gray-900">{chunk.text.length.toLocaleString()}</span>
            </span>
            <span>
              Words:{" "}
              <span className="font-medium text-gray-900">{chunk.text.split(/\s+/).length.toLocaleString()}</span>
            </span>
            <span>
              Lines: <span className="font-medium text-gray-900">{chunk.text.split("\n").length.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
