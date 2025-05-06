"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentTagsProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
}

export default function DocumentTags({ tags, onTagsChange, className }: DocumentTagsProps) {
  const [newTag, setNewTag] = useState("")

  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) {
      return
    }

    onTagsChange([...tags, newTag.trim()])
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">无标签</span>
        ) : (
          tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="添加标签..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
        </div>
        <Button size="sm" variant="outline" onClick={addTag} disabled={!newTag.trim() || tags.includes(newTag.trim())}>
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
      </div>
    </div>
  )
}
