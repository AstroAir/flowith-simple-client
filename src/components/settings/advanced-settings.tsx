"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Trash2, Download, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AdvancedSettingsProps {
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
}

export default function AdvancedSettings({
  autoSave,
  setAutoSave,
}: AdvancedSettingsProps) {
  const [dataRetention, setDataRetention] = useState("30");
  const [cacheSize, setCacheSize] = useState(50);
  const [debugMode, setDebugMode] = useState(false);

  const clearAllData = () => {
    toast("确认操作", {
      description:
        "此操作将清除所有本地数据，包括会话历史和设置。确定要继续吗？",
      action: (
        <Button
          variant="destructive"
          onClick={() => {
            // Clear localStorage
            localStorage.clear();
            toast("数据已清除", {
              description: "所有本地数据已被清除，页面将在3秒后刷新",
            });
            // Reload page after a delay
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }}
        >
          确认清除
        </Button>
      ),
    });
  };

  const exportData = () => {
    try {
      const data = JSON.stringify({
        settings: {
          theme: localStorage.getItem("ai-knowledge-theme"),
          accentColor: localStorage.getItem("ai-knowledge-accent-color"),
          fontSize: localStorage.getItem("ai-knowledge-font-size"),
          animationsEnabled: localStorage.getItem(
            "ai-knowledge-animations-enabled"
          ),
          autoSave: localStorage.getItem("ai-knowledge-auto-save"),
          keyboardShortcuts: localStorage.getItem(
            "ai-knowledge-keyboard-shortcuts"
          ),
          messageAlignment: localStorage.getItem(
            "ai-knowledge-message-alignment"
          ),
        },
        sessions: localStorage.getItem("ai-knowledge-sessions"),
        currentSession: localStorage.getItem("ai-knowledge-current-session"),
        documents: localStorage.getItem("ai-knowledge-documents"),
        selectedDocuments: localStorage.getItem(
          "ai-knowledge-selected-documents"
        ),
        documentTags: localStorage.getItem("ai-knowledge-document-tags"),
      });

      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-knowledge-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast("数据导出成功", {
        description: "您的数据已成功导出为JSON文件",
      });
    } catch (error) {
      toast.error("导出失败", {
        description: "导出数据时发生错误",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">数据管理</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save" className="text-base">
                自动保存会话
              </Label>
              <p className="text-sm text-muted-foreground">
                自动保存会话内容，防止意外关闭页面导致数据丢失
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-retention">数据保留期限</Label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger id="data-retention">
                <SelectValue placeholder="选择数据保留期限" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7天</SelectItem>
                <SelectItem value="30">30天</SelectItem>
                <SelectItem value="90">90天</SelectItem>
                <SelectItem value="365">1年</SelectItem>
                <SelectItem value="forever">永久</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              设置会话历史记录的保留时间
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cache-size">缓存大小限制</Label>
              <span>{cacheSize} MB</span>
            </div>
            <Slider
              id="cache-size"
              min={10}
              max={200}
              step={10}
              value={[cacheSize]}
              onValueChange={(value) => setCacheSize(value[0])}
            />
            <p className="text-sm text-muted-foreground">
              限制应用缓存的最大大小
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">备份与恢复</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={exportData}
              className="flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              导入数据
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            导出您的设置、会话历史和文档信息，或从备份文件中恢复
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">高级选项</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="debug-mode" className="text-base">
                调试模式
              </Label>
              <p className="text-sm text-muted-foreground">
                启用详细日志记录和调试信息
              </p>
            </div>
            <Switch
              id="debug-mode"
              checked={debugMode}
              onCheckedChange={setDebugMode}
            />
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重置应用状态
          </Button>

          <Button
            variant="destructive"
            className="w-full flex items-center justify-center"
            onClick={clearAllData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清除所有数据
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            警告：清除所有数据将永久删除您的设置、会话历史和文档信息
          </p>
        </div>
      </div>
    </div>
  );
}
