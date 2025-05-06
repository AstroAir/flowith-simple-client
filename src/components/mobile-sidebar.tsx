"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokenInput from "@/components/token-input";
import ModelSelector from "@/components/model-selector";
import KnowledgeBaseInput from "@/components/knowledge-base-input";
import DocumentUploader, {
  type UploadedDocument,
} from "@/components/document-uploader";
import DocumentList from "@/components/document-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import AnimatedContainer from "@/components/ui/animated-container";
import BatchDocumentProcessor from "@/components/batch-document-processor";
import AdvancedOptions from "@/components/advanced-options";
import DocumentSearch from "@/components/document-search";
import type { Message } from "@/lib/types";

interface MobileSidebarProps {
  token: string;
  setToken: (token: string) => void;
  kbList: string[];
  setKbList: (kbList: string[]) => void;
  model: string;
  setModel: (model: string) => void;
  documents: UploadedDocument[];
  selectedDocuments: string[];
  handleDocumentUploaded: (document: UploadedDocument) => void;
  handleSelectDocument: (id: string, selected: boolean) => void;
  handleDeleteDocument: (id: string) => void;
  messages: Message[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export default function MobileSidebar({
  token,
  setToken,
  kbList,
  setKbList,
  model,
  setModel,
  documents,
  selectedDocuments,
  handleDocumentUploaded,
  handleSelectDocument,
  handleDeleteDocument,
  messages,
  open,
  onOpenChange,
  activeTab = "config",
  onTabChange,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDocuments, setFilteredDocuments] =
    useState<UploadedDocument[]>(documents);
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  }, [isMobile, onOpenChange]);

  // Sync open state with parent component
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Handle sidebar open change
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  // Handle batch document upload
  const handleBatchDocumentsUploaded = (newDocuments: UploadedDocument[]) => {
    for (const doc of newDocuments) {
      handleDocumentUploaded(doc);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
        <div className="h-full flex flex-col bg-white dark:bg-slate-800">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="flex flex-col h-full"
          >
            <TabsList className="mx-4 mt-4 mb-2">
              <TabsTrigger value="config">配置</TabsTrigger>
              <TabsTrigger value="documents">文档</TabsTrigger>
              <TabsTrigger value="history">历史</TabsTrigger>
            </TabsList>

            <TabsContent
              value="config"
              className="flex-1 overflow-auto p-4 pt-0"
            >
              <AnimatedContainer type="fade" className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">配置</h2>

                <TokenInput value={token} onChange={setToken} />

                <div className="mt-4">
                  <ModelSelector value={model} onChange={setModel} />
                </div>

                <KnowledgeBaseInput kbList={kbList} onChange={setKbList} />

                <div className="mt-4 border-t dark:border-slate-700 pt-4">
                  <AdvancedOptions
                    temperature={0.7}
                    setTemperature={() => {}}
                    maxTokens={2000}
                    setMaxTokens={() => {}}
                    useHistory={true}
                    setUseHistory={() => {}}
                    responseFormat="text"
                    setResponseFormat={() => {}}
                  />
                </div>
              </AnimatedContainer>
            </TabsContent>

            <TabsContent
              value="documents"
              className="flex-1 overflow-hidden flex flex-col p-4 pt-0"
            >
              <AnimatedContainer
                type="fade"
                className="flex-1 overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold mb-4">文档管理</h2>
                  <BatchDocumentProcessor
                    token={token}
                    onDocumentsUploaded={handleBatchDocumentsUploaded}
                  />
                </div>

                <DocumentUploader
                  token={token}
                  onDocumentUploaded={handleDocumentUploaded}
                />

                <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    已上传文档 {documents.length > 0 && `(${documents.length})`}
                  </h3>

                  <DocumentSearch
                    documents={documents}
                    onFilteredDocuments={setFilteredDocuments}
                  />

                  <ScrollArea className="flex-1">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="mb-4">
                        <DocumentList
                          documents={[doc]}
                          selectedDocuments={selectedDocuments}
                          onSelectDocument={handleSelectDocument}
                          onDeleteDocument={handleDeleteDocument}
                          token={token}
                        />
                      </div>
                    ))}
                  </ScrollArea>

                  {selectedDocuments.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                      <p className="text-blue-700 dark:text-blue-300">
                        已选择 {selectedDocuments.length} 个文档用于查询
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedContainer>
            </TabsContent>

            <TabsContent
              value="history"
              className="flex-1 overflow-auto p-4 pt-0"
            >
              <AnimatedContainer type="fade" className="space-y-3">
                <h2 className="text-lg font-semibold mb-4">消息历史</h2>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      暂无消息记录，开始对话吧。
                    </p>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg",
                          msg.role === "user"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-slate-800 dark:text-slate-200"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        )}
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium uppercase">
                            {msg.role === "user" ? "用户" : "助手"}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </AnimatedContainer>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
