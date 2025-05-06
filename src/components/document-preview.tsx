"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UploadedDocument } from "@/components/document-uploader";

interface DocumentPreviewProps {
  document: UploadedDocument;
  token: string;
}

export default function DocumentPreview({
  document,
  token,
}: DocumentPreviewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);

  const fetchDocumentContent = async () => {
    if (content) return; // Already loaded

    try {
      setLoading(true);

      // In a real implementation, this would call an API to get the document content
      // For this demo, we'll simulate a delay and return mock content
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock content based on document name
      const mockContent = `这是文档 "${document.name}" 的预览内容。

在实际应用中，这里会显示从知识库 API 获取的真实文档内容。

文档 ID: ${document.id}
文档大小: ${formatFileSize(document.size)}
上传时间: ${new Date(document.timestamp).toLocaleString()}

这是一个示例段落，展示文档的格式和内容。文档可能包含标题、段落、列表和其他格式化内容。

## 示例标题

1. 第一点
2. 第二点
3. 第三点

> 这是一个引用块，用于展示文档中的重要内容。

最后，这是文档的结尾部分。在实际应用中，这里会显示完整的文档内容。`;

      setContent(mockContent);
    } catch (error) {
      console.error("获取文档内容失败:", error);
      toast.error("Preview Failed", {
        description:
          error instanceof Error ? error.message : "无法获取文档内容",
      });
    } finally {
      setLoading(false);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
          fetchDocumentContent();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {document.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                加载文档内容...
              </p>
            </div>
          ) : content ? (
            <div className="whitespace-pre-wrap text-sm">{content}</div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              无法加载文档内容
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
