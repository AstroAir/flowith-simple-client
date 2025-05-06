"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilePlus, Upload, X, Check, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import type { UploadedDocument } from "@/components/document-uploader";

interface BatchDocumentProcessorProps {
  token: string;
  onDocumentsUploaded: (documents: UploadedDocument[]) => void;
}

export default function BatchDocumentProcessor({
  token,
  onDocumentsUploaded,
}: BatchDocumentProcessorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFiles = async () => {
    if (!token) {
      toast.warning("API Token Required", {
        description: "Please enter your API token to upload documents.",
      });
      return;
    }

    if (files.length === 0) {
      toast.warning("No Files Selected", {
        description: "Please select at least one file to upload.",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setProcessedCount(0);

    const uploadedDocs: UploadedDocument[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Create FormData
        const formData = new FormData();
        formData.append("file", file);

        // Upload the file
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload document");
        }

        const data = await response.json();

        // Create uploaded document object
        const uploadedDoc: UploadedDocument = {
          id: data.documentId,
          name: file.name,
          size: file.size,
          status: "processing", // Initially processing after upload
          timestamp: Date.now(),
        };

        uploadedDocs.push(uploadedDoc);
      } catch (error) {
        console.error("Error uploading document:", error);

        // Add error document to the list
        const errorDoc: UploadedDocument = {
          id: `error-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to upload document",
          timestamp: Date.now(),
        };

        uploadedDocs.push(errorDoc);
      }

      // Update progress
      setProcessedCount(i + 1);
      setProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    // Notify parent component of all uploaded documents
    onDocumentsUploaded(uploadedDocs);

    toast.info("Batch Upload Complete", {
      description: `Successfully processed ${
        uploadedDocs.filter((d) => d.status !== "error").length
      } of ${totalFiles} documents.`,
    });

    setUploading(false);
    setIsOpen(false);
    clearFiles();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FilePlus className="h-4 w-4 mr-2" />
          批量上传
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>批量文档处理</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-400 dark:hover:border-blue-600"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.txt,.doc,.docx,.md"
              disabled={uploading}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                点击或拖放文件到此处
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                支持 PDF, TXT, DOC, DOCX, MD 文件
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  已选择文件 ({files.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  disabled={uploading}
                >
                  清空
                </Button>
              </div>

              <ScrollArea className="flex-1 max-h-[200px]">
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="flex-shrink-0 mr-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-red-500"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>
                  上传进度 ({processedCount}/{files.length})
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
            >
              取消
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  开始上传
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
