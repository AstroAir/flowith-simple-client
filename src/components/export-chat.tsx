"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import type { Message } from "@/lib/types";
import { toast } from "sonner";

interface ExportChatProps {
  messages: Message[];
  response: string;
}

export default function ExportChat({ messages, response }: ExportChatProps) {
  const [exporting, setExporting] = useState(false);

  const exportChat = async (format: "text" | "json") => {
    try {
      setExporting(true);

      // Create a full conversation including the final response
      const fullConversation = [
        ...messages,
        { role: "assistant", content: response },
      ].filter((msg) => msg.content.trim() !== "");

      let content: string;
      let filename: string;
      let type: string;

      if (format === "text") {
        content = fullConversation
          .map((msg) => `${msg.role.toUpperCase()}:\n${msg.content}\n`)
          .join("\n");
        filename = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
        type = "text/plain";
      } else {
        content = JSON.stringify(fullConversation, null, 2);
        filename = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
        type = "application/json";
      }

      // Create a blob and download it
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("导出成功", {
        description: `对话已导出为 ${format.toUpperCase()} 格式`,
      });
    } catch (error) {
      console.error("导出失败:", error);
      toast.error("导出失败", {
        description: error instanceof Error ? error.message : "导出对话时出错",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={exporting || messages.length === 0}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          导出对话
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportChat("text")}>
          <FileText className="h-4 w-4 mr-2" />
          <span>导出为文本</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportChat("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          <span>导出为 JSON</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
