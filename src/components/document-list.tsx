"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileText, Loader2, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { UploadedDocument } from "@/components/document-uploader";

interface DocumentListProps {
  documents: UploadedDocument[];
  selectedDocuments: string[];
  onSelectDocument: (id: string, selected: boolean) => void;
  onDeleteDocument: (id: string) => void;
  token: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments,
  onSelectDocument,
  onDeleteDocument,
  token,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.warning("API Token Required", {
        description: "Please enter your API token to delete documents.",
      });
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(`/api/documents/delete?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      onDeleteDocument(id);

      toast.info("Document Deleted", {
        description: "The document has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);

      toast.error("Delete Failed", {
        description:
          error instanceof Error ? error.message : "Failed to delete document",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case "ready":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "uploading":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
          >
            Uploading
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
          >
            Processing
          </Badge>
        );
      case "ready":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
          >
            Ready
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          >
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm italic">
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            doc.status === "error"
              ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          )}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {doc.status === "ready" && (
              <Checkbox
                id={`doc-${doc.id}`}
                checked={selectedDocuments.includes(doc.id)}
                onCheckedChange={(checked) =>
                  onSelectDocument(doc.id, checked === true)
                }
                disabled={doc.status !== "ready"}
              />
            )}

            <div className="flex-shrink-0">{getStatusIcon(doc.status)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {doc.name}
                </p>
                {getStatusBadge(doc.status)}
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{formatFileSize(doc.size)}</span>
                {doc.error && (
                  <span className="text-red-500 truncate">{doc.error}</span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-red-500"
            onClick={() => handleDelete(doc.id)}
            disabled={deletingId === doc.id}
          >
            {deletingId === doc.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
