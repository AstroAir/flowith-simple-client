"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

interface DocumentUploaderProps {
  token: string;
  onDocumentUploaded: (document: UploadedDocument) => void;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "ready" | "error";
  error?: string;
  timestamp: number;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  token,
  onDocumentUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!token) {
      toast.error("API Token Required", {
        description: "Please enter your API token to upload documents.",
      });
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/markdown",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Unsupported File Type", {
          description: `${file.name} is not a supported document type. Please upload PDF, TXT, DOC, DOCX, or MD files.`,
        });
        continue;
      }

      // Create a temporary document object with uploading status
      const tempDoc: UploadedDocument = {
        id: `temp-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        status: "uploading",
        timestamp: Date.now(),
      };

      onDocumentUploaded(tempDoc);

      try {
        setUploading(true);
        setUploadProgress(0);

        // Create FormData
        const formData = new FormData();
        formData.append("file", file);

        // 使用 axios 替代 fetch 来跟踪上传进度
        const response = await axios.post("/api/documents/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        });

        const data = response.data;

        // Update with the real document data
        const uploadedDoc: UploadedDocument = {
          id: data.documentId,
          name: file.name,
          size: file.size,
          status: "processing", // Initially processing after upload
          timestamp: Date.now(),
        };

        onDocumentUploaded(uploadedDoc);

        // Start polling for document processing status
        pollDocumentStatus(uploadedDoc.id, token, (updatedDoc) => {
          onDocumentUploaded(updatedDoc);
        });

        toast.success("Document Uploaded", {
          description: `${file.name} has been uploaded and is being processed.`,
        });
      } catch (error) {
        console.error("Error uploading document:", error);

        // Update with error status
        const errorDoc: UploadedDocument = {
          id: tempDoc.id,
          name: file.name,
          size: file.size,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to upload document",
          timestamp: Date.now(),
        };

        onDocumentUploaded(errorDoc);

        toast.error("Upload Failed", {
          description:
            error instanceof Error
              ? error.message
              : "Failed to upload document",
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // Function to poll document processing status
  const pollDocumentStatus = (
    documentId: string,
    token: string,
    callback: (doc: UploadedDocument) => void
  ) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/documents/status?id=${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check document status");
        }

        const data = await response.json();

        // Update document with current status
        const updatedDoc: UploadedDocument = {
          id: documentId,
          name: data.name,
          size: data.size,
          status: data.status,
          error: data.error,
          timestamp: Date.now(),
        };

        callback(updatedDoc);

        // If still processing, continue polling
        if (data.status === "processing") {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        }
      } catch (error) {
        console.error("Error checking document status:", error);

        // Update with error status
        const errorDoc: UploadedDocument = {
          id: documentId,
          name: "Unknown",
          size: 0,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to check document status",
          timestamp: Date.now(),
        };

        callback(errorDoc);
      }
    };

    // Start polling
    setTimeout(checkStatus, 3000); // Initial check after 3 seconds
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept=".pdf,.txt,.doc,.docx,.md"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isDragging ? "Drop files here" : "Upload Documents"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag and drop or click to upload PDF, TXT, DOC, DOCX, or MD files
          </p>
        </div>
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
