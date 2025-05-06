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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, ExternalLink, Quote, Check } from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeSeed } from "@/lib/types";

interface CitationViewProps {
  seeds: KnowledgeSeed[];
}

export default function CitationView({ seeds }: CitationViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    toast.info("已复制到剪贴板",{
      description: "引用内容已复制到剪贴板",
    });

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  if (!seeds || seeds.length === 0) {
    return null;
  }

  const formatCitation = (seed: KnowledgeSeed, index: number) => {
    return `[${index + 1}] ${
      seed.source_title || "未知来源"
    }. "${seed.content.substring(0, 100)}${
      seed.content.length > 100 ? "..." : ""
    }"`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Quote className="h-4 w-4 mr-2" />
          查看引用 ({seeds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>知识来源引用</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4 max-h-[500px]">
          <div className="space-y-4">
            {seeds.map((seed, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </span>
                    {seed.source_title || "未知来源"}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        handleCopy(formatCitation(seed, index), index)
                      }
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {seed.source_id && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {seed.content}
                </p>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-500 flex items-center justify-between">
                  <span>相关度: {Math.round((1 - seed.nip) * 100)}%</span>
                  <span>令牌数: {seed.tokens}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
