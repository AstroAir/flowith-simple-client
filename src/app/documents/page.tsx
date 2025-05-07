"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Grid,
  List,
  Tag,
  Clock,
  Trash2,
  Download,
  Plus,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import DocumentUploader, {
  type UploadedDocument,
} from "@/components/document-uploader";
import BatchDocumentProcessor from "@/components/batch-document-processor";
import DocumentTags from "@/components/document-tags";
import DocumentPreview from "@/components/document-preview";
import AdvancedSearch from "@/components/search/advanced-search";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  PageContainer,
  PageTitle,
  PageSection,
  PageGrid,
} from "@/components/layout/page-container";

export default function DocumentsPage() {
  const [documents, setDocuments] = useLocalStorage<UploadedDocument[]>(
    "ai-knowledge-documents",
    []
  );
  const [documentTags, setDocumentTags] = useLocalStorage<
    Record<string, string[]>
  >("ai-knowledge-document-tags", {});
  const [token, setToken] = useLocalStorage<string>("ai-knowledge-token", "");
  const [filteredDocuments, setFilteredDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const { accentColor, animationsEnabled } = useTheme();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize filtered documents
  useEffect(() => {
    setFilteredDocuments(documents);
  }, [documents]);

  // Filter documents based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter((doc) => doc.status === activeTab));
    }
  }, [activeTab, documents]);

  const handleDocumentUploaded = (document: UploadedDocument) => {
    setDocuments((prev) => {
      // Replace if exists, otherwise add
      const exists = prev.findIndex((doc) => doc.id === document.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = document;
        return updated;
      } else {
        // Initialize tags for new document
        if (!(document.id in documentTags)) {
          setDocumentTags((prev) => ({
            ...prev,
            [document.id]: [],
          }));
        }
        return [...prev, document];
      }
    });
  };

  const handleBatchDocumentsUploaded = (newDocuments: UploadedDocument[]) => {
    setDocuments((prev) => {
      const updatedDocs = [...prev];

      for (const doc of newDocuments) {
        const existingIndex = updatedDocs.findIndex((d) => d.id === doc.id);

        if (existingIndex >= 0) {
          updatedDocs[existingIndex] = doc;
        } else {
          updatedDocs.push(doc);

          // Initialize tags for new document
          if (!(doc.id in documentTags)) {
            setDocumentTags((prevTags) => ({
              ...prevTags,
              [doc.id]: [],
            }));
          }
        }
      }

      return updatedDocs;
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setSelectedDocuments((prev) => prev.filter((docId) => docId !== id));

    // Remove tags for deleted document
    setDocumentTags((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleDocumentTags = (docId: string, tags: string[]) => {
    setDocumentTags((prev) => ({
      ...prev,
      [docId]: tags,
    }));
  };

  const toggleSelectDocument = (id: string) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(id)) {
        return prev.filter((docId) => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id));
    }
  };

  const deleteSelectedDocuments = () => {
    setDocuments((prev) =>
      prev.filter((doc) => !selectedDocuments.includes(doc.id))
    );

    // Remove tags for deleted documents
    setDocumentTags((prev) => {
      const updated = { ...prev };
      selectedDocuments.forEach((id) => {
        delete updated[id];
      });
      return updated;
    });

    setSelectedDocuments([]);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const uploadActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
      >
        {viewMode === "grid" ? (
          <List className="h-4 w-4" />
        ) : (
          <Grid className="h-4 w-4" />
        )}
      </Button>
      <BatchDocumentProcessor
        token={token}
        onDocumentsUploaded={handleBatchDocumentsUploaded}
      />
      <DocumentUploader
        token={token}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </>
  );

  return (
    <PageContainer>
      <PageTitle
        title="文档库"
        description="管理和组织您的知识文档"
        actions={uploadActions}
      />

      <PageSection noPadding>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">全部文档</TabsTrigger>
              <TabsTrigger value="ready">就绪</TabsTrigger>
              <TabsTrigger value="processing">处理中</TabsTrigger>
              <TabsTrigger value="uploading">上传中</TabsTrigger>
              <TabsTrigger value="error">错误</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {selectedDocuments.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelectedDocuments}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除选中项
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={selectAllDocuments}>
                {selectedDocuments.length === filteredDocuments.length
                  ? "取消全选"
                  : "全选"}
              </Button>
            </div>
          </div>

          <PageSection className="mb-6">
            <AdvancedSearch
              documents={documents}
              documentTags={documentTags}
              onFilteredDocuments={setFilteredDocuments}
            />
          </PageSection>

          <TabsContent value="all" className="mt-0">
            <DocumentsContent
              documents={filteredDocuments}
              documentTags={documentTags}
              viewMode={viewMode}
              selectedDocuments={selectedDocuments}
              toggleSelectDocument={toggleSelectDocument}
              handleDeleteDocument={handleDeleteDocument}
              handleDocumentTags={handleDocumentTags}
              token={token}
              isLoading={isLoading}
              formatFileSize={formatFileSize}
              animationsEnabled={animationsEnabled}
            />
          </TabsContent>

          <TabsContent value="ready" className="mt-0">
            <DocumentsContent
              documents={filteredDocuments}
              documentTags={documentTags}
              viewMode={viewMode}
              selectedDocuments={selectedDocuments}
              toggleSelectDocument={toggleSelectDocument}
              handleDeleteDocument={handleDeleteDocument}
              handleDocumentTags={handleDocumentTags}
              token={token}
              isLoading={isLoading}
              formatFileSize={formatFileSize}
              animationsEnabled={animationsEnabled}
            />
          </TabsContent>

          <TabsContent value="processing" className="mt-0">
            <DocumentsContent
              documents={filteredDocuments}
              documentTags={documentTags}
              viewMode={viewMode}
              selectedDocuments={selectedDocuments}
              toggleSelectDocument={toggleSelectDocument}
              handleDeleteDocument={handleDeleteDocument}
              handleDocumentTags={handleDocumentTags}
              token={token}
              isLoading={isLoading}
              formatFileSize={formatFileSize}
              animationsEnabled={animationsEnabled}
            />
          </TabsContent>

          <TabsContent value="uploading" className="mt-0">
            <DocumentsContent
              documents={filteredDocuments}
              documentTags={documentTags}
              viewMode={viewMode}
              selectedDocuments={selectedDocuments}
              toggleSelectDocument={toggleSelectDocument}
              handleDeleteDocument={handleDeleteDocument}
              handleDocumentTags={handleDocumentTags}
              token={token}
              isLoading={isLoading}
              formatFileSize={formatFileSize}
              animationsEnabled={animationsEnabled}
            />
          </TabsContent>

          <TabsContent value="error" className="mt-0">
            <DocumentsContent
              documents={filteredDocuments}
              documentTags={documentTags}
              viewMode={viewMode}
              selectedDocuments={selectedDocuments}
              toggleSelectDocument={toggleSelectDocument}
              handleDeleteDocument={handleDeleteDocument}
              handleDocumentTags={handleDocumentTags}
              token={token}
              isLoading={isLoading}
              formatFileSize={formatFileSize}
              animationsEnabled={animationsEnabled}
            />
          </TabsContent>
        </Tabs>
      </PageSection>
    </PageContainer>
  );
}

interface DocumentsContentProps {
  documents: UploadedDocument[];
  documentTags: Record<string, string[]>;
  viewMode: "grid" | "list";
  selectedDocuments: string[];
  toggleSelectDocument: (id: string) => void;
  handleDeleteDocument: (id: string) => void;
  handleDocumentTags: (docId: string, tags: string[]) => void;
  token: string;
  isLoading: boolean;
  formatFileSize: (bytes: number) => string;
  animationsEnabled: boolean;
}

function DocumentsContent({
  documents,
  documentTags,
  viewMode,
  selectedDocuments,
  toggleSelectDocument,
  handleDeleteDocument,
  handleDocumentTags,
  token,
  isLoading,
  formatFileSize,
  animationsEnabled,
}: DocumentsContentProps) {
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${
          viewMode === "grid" ? "3" : "1"
        } gap-4`}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-xl font-medium mb-2">暂无文档</h3>
        <p className="text-muted-foreground max-w-md">
          上传文档到您的知识库以开始分析和检索信息。
        </p>
        <Button className="mt-6" asChild>
          <label>
            <Upload className="h-4 w-4 mr-2" />
            上传文档
            <input type="file" className="hidden" />
          </label>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col space-y-4"
      }
    >
      {documents.map((doc) => (
        <AnimatedContainer
          key={doc.id}
          type="fade"
          className={viewMode === "list" ? "w-full" : ""}
        >
          <Card
            className={`overflow-hidden ${
              selectedDocuments.includes(doc.id) ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-2">
                  <CardTitle className="text-lg truncate">{doc.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(doc.timestamp), "MMM d, yyyy")}
                    <span className="mx-2">•</span>
                    {formatFileSize(doc.size)}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize ${
                    doc.status === "ready"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : doc.status === "processing"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : doc.status === "error"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                  }`}
                >
                  {doc.status === "ready"
                    ? "就绪"
                    : doc.status === "processing"
                    ? "处理中"
                    : doc.status === "uploading"
                    ? "上传中"
                    : "错误"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {documentTags[doc.id] && documentTags[doc.id].length > 0 ? (
                <div className="flex flex-wrap gap-1 mb-2">
                  {documentTags[doc.id].slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {documentTags[doc.id].length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{documentTags[doc.id].length - 3} 更多
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mb-2">无标签</div>
              )}

              {viewMode === "list" && (
                <DocumentTags
                  tags={documentTags[doc.id] || []}
                  onTagsChange={(tags) => handleDocumentTags(doc.id, tags)}
                  className="mt-2"
                />
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSelectDocument(doc.id)}
                >
                  {selectedDocuments.includes(doc.id) ? "取消选择" : "选择"}
                </Button>
                {doc.status === "ready" && (
                  <DocumentPreview document={doc} token={token} />
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          {viewMode === "grid" && (
            <DocumentTags
              tags={documentTags[doc.id] || []}
              onTagsChange={(tags) => handleDocumentTags(doc.id, tags)}
              className="mt-2"
            />
          )}
        </AnimatedContainer>
      ))}
    </div>
  );
}
