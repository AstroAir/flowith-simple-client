"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedDocument } from "@/components/document-uploader";

interface DocumentSearchProps {
  documents: UploadedDocument[];
  onFilteredDocuments: (documents: UploadedDocument[]) => void;
}

export default function DocumentSearch({
  documents,
  onFilteredDocuments,
}: DocumentSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm.trim()) {
      onFilteredDocuments(documents);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = documents.filter((doc) =>
      doc.name.toLowerCase().includes(lowerSearchTerm)
    );

    onFilteredDocuments(filtered);
  }, [searchTerm, documents, onFilteredDocuments]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="relative mb-3">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        <Input
          placeholder="搜索文档..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-500"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
