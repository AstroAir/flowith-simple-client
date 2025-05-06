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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import type { Message, ConversationSession } from "@/lib/types";
import type { UploadedDocument } from "@/components/document-uploader";

interface DataExportProps {
  sessions: ConversationSession[];
  documents: UploadedDocument[];
  documentTags: Record<string, string[]>;
}

export default function DataExport({
  sessions,
  documents,
  documentTags,
}: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("quick");
  const [exportFormat, setExportFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeSystemInfo, setIncludeSystemInfo] = useState(false);
  const [exportName, setExportName] = useState("");
  const [scheduleType, setScheduleType] = useState("none");
  const [scheduleTime, setScheduleTime] = useState("00:00");
  const [scheduleDay, setScheduleDay] = useState("1");

  const { accentColor, animationsEnabled } = useTheme();

  const handleSelectAllSessions = (checked: boolean) => {
    if (checked) {
      setSelectedSessions(sessions.map((session) => session.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectAllDocuments = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.map((doc) => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Prepare export data
      const exportData: any = {};

      // Add selected sessions
      if (selectedSessions.length > 0) {
        exportData.sessions = sessions.filter((session) =>
          selectedSessions.includes(session.id)
        );
      }

      // Add selected documents
      if (selectedDocuments.length > 0) {
        exportData.documents = documents.filter((doc) =>
          selectedDocuments.includes(doc.id)
        );

        // Add document tags if available
        if (includeMetadata) {
          exportData.documentTags = {};
          selectedDocuments.forEach((docId) => {
            if (documentTags[docId]) {
              exportData.documentTags[docId] = documentTags[docId];
            }
          });
        }
      }

      // Add system info if requested
      if (includeSystemInfo) {
        exportData.systemInfo = {
          exportDate: new Date().toISOString(),
          appVersion: "1.0.0",
          platform: navigator.platform,
          userAgent: navigator.userAgent,
        };
      }

      // Generate filename
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .substring(0, 19);
      const filename = exportName
        ? `${exportName}.${exportFormat}`
        : `knowledge-export-${timestamp}.${exportFormat}`;

      // Convert data based on format
      let content: string;
      let type: string;

      switch (exportFormat) {
        case "json":
          content = JSON.stringify(exportData, null, 2);
          type = "application/json";
          break;
        case "csv":
          // Simple CSV conversion for demonstration
          content = convertToCSV(exportData);
          type = "text/csv";
          break;
        case "txt":
          content = convertToText(exportData);
          type = "text/plain";
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          type = "application/json";
      }

      // Create and download file
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);

      toast.success("导出成功", {
        description: `数据已成功导出为 ${filename}`,
      });

      // Reset export success after a delay
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("导出失败:", error);
      toast.error("导出失败", {
        description: "导出数据时发生错误",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to convert data to CSV format
  const convertToCSV = (data: any): string => {
    let csv = "";

    // Handle sessions
    if (data.sessions && data.sessions.length > 0) {
      csv += "SESSION ID,NAME,CREATED AT,UPDATED AT,MESSAGES COUNT\n";
      data.sessions.forEach((session: ConversationSession) => {
        csv += `${session.id},${session.name},${new Date(
          session.createdAt
        ).toISOString()},${new Date(session.updatedAt).toISOString()},${
          session.messages.length
        }\n`;
      });
      csv += "\n";
    }

    // Handle documents
    if (data.documents && data.documents.length > 0) {
      csv += "DOCUMENT ID,NAME,SIZE,STATUS,TIMESTAMP\n";
      data.documents.forEach((doc: UploadedDocument) => {
        csv += `${doc.id},${doc.name},${doc.size},${doc.status},${new Date(
          doc.timestamp
        ).toISOString()}\n`;
      });
    }

    return csv;
  };

  // Helper function to convert data to text format
  const convertToText = (data: any): string => {
    let text = "KNOWLEDGE RETRIEVAL EXPORT\n";
    text += `Export Date: ${new Date().toISOString()}\n\n`;

    // Handle sessions
    if (data.sessions && data.sessions.length > 0) {
      text += `SESSIONS (${data.sessions.length}):\n`;
      text += "===================\n\n";

      data.sessions.forEach((session: ConversationSession, index: number) => {
        text += `Session ${index + 1}: ${session.name}\n`;
        text += `ID: ${session.id}\n`;
        text += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
        text += `Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
        text += `Messages: ${session.messages.length}\n\n`;

        if (session.messages.length > 0) {
          text += "Conversation:\n";
          session.messages.forEach((msg: Message) => {
            text += `[${msg.role.toUpperCase()}]: ${msg.content}\n\n`;
          });

          if (session.response) {
            text += `[RESPONSE]: ${session.response}\n\n`;
          }
        }

        text += "-------------------\n\n";
      });
    }

    // Handle documents
    if (data.documents && data.documents.length > 0) {
      text += `DOCUMENTS (${data.documents.length}):\n`;
      text += "===================\n\n";

      data.documents.forEach((doc: UploadedDocument, index: number) => {
        text += `Document ${index + 1}: ${doc.name}\n`;
        text += `ID: ${doc.id}\n`;
        text += `Size: ${doc.size} bytes\n`;
        text += `Status: ${doc.status}\n`;
        text += `Uploaded: ${new Date(doc.timestamp).toLocaleString()}\n`;

        if (data.documentTags && data.documentTags[doc.id]) {
          text += `Tags: ${data.documentTags[doc.id].join(", ")}\n`;
        }

        text += "-------------------\n\n";
      });
    }

    return text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>导出数据</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Download className="h-5 w-5" />
            数据导出
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="quick"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="border-b px-6">
            <TabsList className="justify-start -mb-px">
              <TabsTrigger
                value="quick"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                快速导出
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                自定义导出
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                定时导出
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Quick Export Tab */}
            <TabsContent value="quick" className="h-full flex flex-col p-6">
              <AnimatedContainer type="fade" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">快速导出</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    导出所有会话和文档数据，或选择特定类型的数据进行导出。
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-all"
                        checked={
                          selectedSessions.length === sessions.length &&
                          selectedDocuments.length === documents.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectAllSessions(true);
                            handleSelectAllDocuments(true);
                          } else {
                            handleSelectAllSessions(false);
                            handleSelectAllDocuments(false);
                          }
                        }}
                      />
                      <Label htmlFor="export-all">导出所有数据</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-sessions"
                        checked={selectedSessions.length === sessions.length}
                        onCheckedChange={handleSelectAllSessions}
                      />
                      <Label htmlFor="export-sessions">
                        导出所有会话 ({sessions.length})
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="export-documents"
                        checked={selectedDocuments.length === documents.length}
                        onCheckedChange={handleSelectAllDocuments}
                      />
                      <Label htmlFor="export-documents">
                        导出所有文档 ({documents.length})
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-metadata"
                        checked={includeMetadata}
                        onCheckedChange={(checked) =>
                          setIncludeMetadata(checked === true)
                        }
                      />
                      <Label htmlFor="include-metadata">
                        包含元数据（标签、属性等）
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">导出格式</h3>
                  <div className="flex space-x-4">
                    <div
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === "json"
                          ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/10`
                          : ""
                      }`}
                      onClick={() => setExportFormat("json")}
                    >
                      <FileJson
                        className={`h-8 w-8 mb-2 ${
                          exportFormat === "json"
                            ? `text-${accentColor}-500`
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          exportFormat === "json"
                            ? `text-${accentColor}-700 dark:text-${accentColor}-300`
                            : ""
                        }
                      >
                        JSON
                      </span>
                    </div>

                    <div
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === "csv"
                          ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/10`
                          : ""
                      }`}
                      onClick={() => setExportFormat("csv")}
                    >
                      <FileSpreadsheet
                        className={`h-8 w-8 mb-2 ${
                          exportFormat === "csv"
                            ? `text-${accentColor}-500`
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          exportFormat === "csv"
                            ? `text-${accentColor}-700 dark:text-${accentColor}-300`
                            : ""
                        }
                      >
                        CSV
                      </span>
                    </div>

                    <div
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === "txt"
                          ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/10`
                          : ""
                      }`}
                      onClick={() => setExportFormat("txt")}
                    >
                      <FileText
                        className={`h-8 w-8 mb-2 ${
                          exportFormat === "txt"
                            ? `text-${accentColor}-500`
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={
                          exportFormat === "txt"
                            ? `text-${accentColor}-700 dark:text-${accentColor}-300`
                            : ""
                        }
                      >
                        TXT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleExport}
                    disabled={
                      isExporting ||
                      (selectedSessions.length === 0 &&
                        selectedDocuments.length === 0)
                    }
                    className="min-w-[120px]"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        导出中...
                      </>
                    ) : exportSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        已导出
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        导出
                      </>
                    )}
                  </Button>
                </div>
              </AnimatedContainer>
            </TabsContent>

            {/* Custom Export Tab */}
            <TabsContent value="custom" className="h-full flex flex-col">
              <div className="p-6 pb-3">
                <h3 className="text-lg font-medium mb-4">自定义导出</h3>
                <p className="text-sm text-muted-foreground">
                  选择特定的会话和文档进行导出。
                </p>
              </div>

              <ScrollArea className="flex-1 px-6">
                <AnimatedContainer type="fade" className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center justify-between">
                      <span>会话 ({sessions.length})</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllSessions(false)}
                          className="h-7 px-2 text-xs"
                          disabled={selectedSessions.length === 0}
                        >
                          取消全选
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllSessions(true)}
                          className="h-7 px-2 text-xs"
                          disabled={selectedSessions.length === sessions.length}
                        >
                          全选
                        </Button>
                      </div>
                    </h4>

                    <div className="space-y-2 mt-2">
                      {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          无会话数据
                        </p>
                      ) : (
                        sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`session-${session.id}`}
                              checked={selectedSessions.includes(session.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSessions([
                                    ...selectedSessions,
                                    session.id,
                                  ]);
                                } else {
                                  setSelectedSessions(
                                    selectedSessions.filter(
                                      (id) => id !== session.id
                                    )
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`session-${session.id}`}
                              className="flex-1"
                            >
                              <div className="flex items-center justify-between">
                                <span>{session.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    session.updatedAt
                                  ).toLocaleDateString()}{" "}
                                  ({session.messages.length} 条消息)
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center justify-between">
                      <span>文档 ({documents.length})</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllDocuments(false)}
                          className="h-7 px-2 text-xs"
                          disabled={selectedDocuments.length === 0}
                        >
                          取消全选
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllDocuments(true)}
                          className="h-7 px-2 text-xs"
                          disabled={
                            selectedDocuments.length === documents.length
                          }
                        >
                          全选
                        </Button>
                      </div>
                    </h4>

                    <div className="space-y-2 mt-2">
                      {documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          无文档数据
                        </p>
                      ) : (
                        documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`doc-${doc.id}`}
                              checked={selectedDocuments.includes(doc.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDocuments([
                                    ...selectedDocuments,
                                    doc.id,
                                  ]);
                                } else {
                                  setSelectedDocuments(
                                    selectedDocuments.filter(
                                      (id) => id !== doc.id
                                    )
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`doc-${doc.id}`} className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{doc.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(doc.timestamp).toLocaleDateString()}{" "}
                                  ({doc.status})
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">导出选项</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-metadata-custom"
                          checked={includeMetadata}
                          onCheckedChange={(checked) =>
                            setIncludeMetadata(checked === true)
                          }
                        />
                        <Label htmlFor="include-metadata-custom">
                          包含元数据（标签、属性等）
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-system-info"
                          checked={includeSystemInfo}
                          onCheckedChange={(checked) =>
                            setIncludeSystemInfo(checked === true)
                          }
                        />
                        <Label htmlFor="include-system-info">
                          包含系统信息
                        </Label>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="export-name" className="text-sm">
                          导出文件名
                        </Label>
                        <Input
                          id="export-name"
                          placeholder="自定义文件名（可选）"
                          value={exportName}
                          onChange={(e) => setExportName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>

                      <div>
                        <Label className="text-sm mb-2 block">导出格式</Label>
                        <div className="flex space-x-4">
                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              exportFormat === "json"
                                ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/10`
                                : ""
                            }`}
                            onClick={() => setExportFormat("json")}
                          >
                            <FileJson
                              className={`h-6 w-6 mb-1 ${
                                exportFormat === "json"
                                  ? `text-${accentColor}-500`
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                exportFormat === "json"
                                  ? `text-${accentColor}-700 dark:text-${accentColor}-300`
                                  : ""
                              }`}
                            >
                              JSON
                            </span>
                          </div>

                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              exportFormat === "csv"
                                ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/10`
                                : ""
                            }`}
                            onClick={() => setExportFormat("csv")}
                          >
                            <FileSpreadsheet
                              className={`h-6 w-6 mb-1 ${
                                exportFormat === "csv"
                                  ? `text-${accentColor}-500`
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                exportFormat === "csv"
                                  ? `text-${accentColor}-700 dark:text-${accentColor}-300`
                                  : ""
                              }`}
                            >
                              CSV
                            </span>
                          </div>

                          <div
                            className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              exportFormat === "txt"
                                ? `border-${accentColor}-500 bg-${accentColor}-50 dark:bg-${accentColor}-900/10`
                                : ""
                            }`}
                            onClick={() => setExportFormat("txt")}
                          >
                            <FileText
                              className={`h-6 w-6 mb-1 ${
                                exportFormat === "txt"
                                  ? `text-${accentColor}-500`
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                exportFormat === "txt"
                                  ? `text-${accentColor}-700 dark:text-${accentColor}-300`
                                  : ""
                              }`}
                            >
                              TXT
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedContainer>
              </ScrollArea>

              <div className="p-6 pt-3 border-t mt-auto">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    已选择: {selectedSessions.length} 个会话,{" "}
                    {selectedDocuments.length} 个文档
                  </div>
                  <Button
                    onClick={handleExport}
                    disabled={
                      isExporting ||
                      (selectedSessions.length === 0 &&
                        selectedDocuments.length === 0)
                    }
                    className="min-w-[120px]"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        导出中...
                      </>
                    ) : exportSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        已导出
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        导出
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Scheduled Export Tab */}
            <TabsContent value="scheduled" className="p-6">
              <AnimatedContainer type="fade" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">定时导出</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    设置定期自动导出数据的计划。
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule-type" className="text-sm">
                        导出频率
                      </Label>
                      <Select
                        value={scheduleType}
                        onValueChange={setScheduleType}
                      >
                        <SelectTrigger
                          id="schedule-type"
                          className="col-span-3"
                        >
                          <SelectValue placeholder="选择导出频率" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">不定期导出</SelectItem>
                          <SelectItem value="daily">每日</SelectItem>
                          <SelectItem value="weekly">每周</SelectItem>
                          <SelectItem value="monthly">每月</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {scheduleType !== "none" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="schedule-time" className="text-sm">
                          导出时间
                        </Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    )}

                    {scheduleType === "weekly" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="schedule-day-week" className="text-sm">
                          每周几
                        </Label>
                        <Select
                          value={scheduleDay}
                          onValueChange={setScheduleDay}
                        >
                          <SelectTrigger
                            id="schedule-day-week"
                            className="col-span-3"
                          >
                            <SelectValue placeholder="选择星期几" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">星期一</SelectItem>
                            <SelectItem value="2">星期二</SelectItem>
                            <SelectItem value="3">星期三</SelectItem>
                            <SelectItem value="4">星期四</SelectItem>
                            <SelectItem value="5">星期五</SelectItem>
                            <SelectItem value="6">星期六</SelectItem>
                            <SelectItem value="0">星期日</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {scheduleType === "monthly" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="schedule-day-month" className="text-sm">
                          每月几号
                        </Label>
                        <Select
                          value={scheduleDay}
                          onValueChange={setScheduleDay}
                        >
                          <SelectTrigger
                            id="schedule-day-month"
                            className="col-span-3"
                          >
                            <SelectValue placeholder="选择日期" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}
                              >
                                {i + 1}日
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="export-format-scheduled"
                        className="text-sm"
                      >
                        导出格式
                      </Label>
                      <Select
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger
                          id="export-format-scheduled"
                          className="col-span-3"
                        >
                          <SelectValue placeholder="选择导出格式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="txt">TXT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4 pt-4">
                      <Label className="text-sm pt-2">导出内容</Label>
                      <div className="col-span-3 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="export-sessions-scheduled"
                            checked={true}
                            disabled
                          />
                          <Label htmlFor="export-sessions-scheduled">
                            所有会话
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="export-documents-scheduled"
                            checked={true}
                            disabled
                          />
                          <Label htmlFor="export-documents-scheduled">
                            所有文档
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-metadata-scheduled"
                            checked={includeMetadata}
                            onCheckedChange={(checked) =>
                              setIncludeMetadata(checked === true)
                            }
                          />
                          <Label htmlFor="include-metadata-scheduled">
                            包含元数据
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4 pt-4">
                      <Label className="text-sm pt-2">导出目标</Label>
                      <div className="col-span-3 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="export-local" checked={true} disabled />
                          <Label htmlFor="export-local">本地下载</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="export-cloud"
                            checked={false}
                            disabled
                          />
                          <Label htmlFor="export-cloud">
                            云存储 (即将推出)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="export-email"
                            checked={false}
                            disabled
                          />
                          <Label htmlFor="export-email">
                            发送到邮箱 (即将推出)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      toast("定时导出已设置", {
                        description: `数据将按照设定的计划自动导出`,
                      });
                      setIsOpen(false);
                    }}
                    disabled={scheduleType === "none"}
                    className="min-w-[120px]"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    保存计划
                  </Button>
                </div>
              </AnimatedContainer>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
