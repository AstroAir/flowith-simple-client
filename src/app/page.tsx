"use client";

import type React from "react";

import { useState, useRef, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Send,
  MessageSquare,
  Database,
  AlertCircle,
  FileText,
  Sparkles,
  Search,
  Upload,
  Users,
  Clock,
  Tag,
  Zap,
} from "lucide-react";
import type { Message, ConversationSession, KnowledgeSeed } from "@/lib/types";
import { toast } from "sonner";
import AIResponse from "@/components/ai-response";
import TokenInput from "@/components/token-input";
import KnowledgeBaseInput from "@/components/knowledge-base-input";
import ModelSelector from "@/components/model-selector";
import ErrorBoundary from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import DocumentUploader, {
  type UploadedDocument,
} from "@/components/document-uploader";
import DocumentList from "@/components/document-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileSidebar from "@/components/mobile-sidebar";
import ThemeToggle from "@/components/theme-toggle";
import DocumentSearch from "@/components/document-search";
import DocumentPreview from "@/components/document-preview";
import ExportChat from "@/components/export-chat";
import AdvancedOptions from "@/components/advanced-options";
import DocumentTags from "@/components/document-tags";
import SessionManager from "@/components/session-manager";
import VoiceInput from "@/components/voice-input";
import BatchDocumentProcessor from "@/components/batch-document-processor";
import CitationView from "@/components/citation-view";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import AnimatedContainer from "@/components/ui/animated-container";
import SettingsPage from "@/components/settings/settings-page";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTheme } from "@/components/theme-provider";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loaded components
const LazyLoadWrapper = dynamic(
  () => import("@/components/lazy-load-wrapper"),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
);

const DataInsights = dynamic(
  () => import("@/components/visualization/data-insights"),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
);

const ContentRecommendations = dynamic(
  () => import("@/components/recommendations/content-recommendations"),
  {
    loading: () => <Skeleton className="h-[200px] w-full" />,
  }
);

const RealTimeUpdates = dynamic(
  () => import("@/components/real-time/real-time-updates"),
  {
    loading: () => <Skeleton className="h-[200px] w-full" />,
  }
);

export default function Home() {
  // 会话管理
  const [sessions, setSessions] = useLocalStorage<ConversationSession[]>(
    "ai-knowledge-sessions",
    []
  );
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string>(
    "ai-knowledge-current-session",
    ""
  );

  // 配置
  const [token, setToken] = useLocalStorage<string>("ai-knowledge-token", "");
  const [kbList, setKbList] = useLocalStorage<string[]>(
    "ai-knowledge-kb-list",
    []
  );
  const [model, setModel] = useLocalStorage<string>(
    "ai-knowledge-model",
    "gpt-4o-mini"
  );
  const [stream, setStream] = useLocalStorage<boolean>(
    "ai-knowledge-stream",
    true
  );
  const [temperature, setTemperature] = useLocalStorage<number>(
    "ai-knowledge-temperature",
    0.7
  );
  const [maxTokens, setMaxTokens] = useLocalStorage<number>(
    "ai-knowledge-max-tokens",
    2000
  );
  const [useHistory, setUseHistory] = useLocalStorage<boolean>(
    "ai-knowledge-use-history",
    true
  );
  const [responseFormat, setResponseFormat] = useLocalStorage<string>(
    "ai-knowledge-response-format",
    "text"
  );

  // 用户偏好设置
  const [autoSave, setAutoSave] = useLocalStorage<boolean>(
    "ai-knowledge-auto-save",
    true
  );
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] =
    useLocalStorage<boolean>("ai-knowledge-keyboard-shortcuts", true);
  const [messageAlignment, setMessageAlignment] = useLocalStorage<
    "left" | "right"
  >("ai-knowledge-message-alignment", "left");

  // 使用主题上下文
  const { theme, accentColor, fontSize, animationsEnabled } = useTheme();

  // 文档管理
  const [documents, setDocuments] = useLocalStorage<UploadedDocument[]>(
    "ai-knowledge-documents",
    []
  );
  const [filteredDocuments, setFilteredDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [selectedDocuments, setSelectedDocuments] = useLocalStorage<string[]>(
    "ai-knowledge-selected-documents",
    []
  );
  const [documentTags, setDocumentTags] = useLocalStorage<
    Record<string, string[]>
  >("ai-knowledge-document-tags", {});

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [isTyping, setIsTyping] = useState(false);
  const [currentMobileTab, setCurrentMobileTab] = useState("home");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // 初始化默认会话
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: ConversationSession = {
        id: uuidv4(),
        name: "默认会话",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        response: "",
        seeds: [],
        searching: false,
      };
      setSessions([defaultSession]);
      setCurrentSessionId(defaultSession.id);
    } else if (
      !currentSessionId ||
      !sessions.find((s) => s.id === currentSessionId)
    ) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId, setSessions, setCurrentSessionId]);

  // 获取当前会话
  const currentSession = sessions.find((s) => s.id === currentSessionId) || {
    id: "",
    name: "",
    createdAt: 0,
    updatedAt: 0,
    messages: [],
    response: "",
    seeds: [],
    searching: false,
  };

  // 更新当前会话
  const updateCurrentSession = (updates: Partial<ConversationSession>) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              ...updates,
              updatedAt: Date.now(),
            }
          : session
      )
    );
  };

  // 创建新会话
  const createSession = (name: string) => {
    const newSession: ConversationSession = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      response: "",
      seeds: [],
      searching: false,
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);

    if (isMobile) {
      setIsSidebarOpen(false);
    }

    toast("已创建新会话", {
      description: `会话 "${name}" 已创建`,
    });
  };

  // 切换会话
  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // 重命名会话
  const renameSession = (sessionId: string, newName: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              name: newName,
              updatedAt: Date.now(),
            }
          : session
      )
    );
  };

  // 删除会话
  const deleteSession = (sessionId: string) => {
    setSessions((prevSessions) => {
      const filteredSessions = prevSessions.filter(
        (session) => session.id !== sessionId
      );

      // 如果删除的是当前会话，切换到第一个会话
      if (sessionId === currentSessionId && filteredSessions.length > 0) {
        setCurrentSessionId(filteredSessions[0].id);
      } else if (filteredSessions.length === 0) {
        // 如果删除后没有会话，创建一个新的默认会话
        const defaultSession: ConversationSession = {
          id: uuidv4(),
          name: "默认会话",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          response: "",
          seeds: [],
          searching: false,
        };
        setCurrentSessionId(defaultSession.id);
        return [defaultSession];
      }

      return filteredSessions;
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: animationsEnabled ? "smooth" : "auto",
      });
    }
  }, [currentSession.messages, currentSession.response, animationsEnabled]);

  // 初始化文档过滤
  useEffect(() => {
    setFilteredDocuments(documents);
  }, [documents]);

  // 键盘快捷键
  useKeyboardShortcuts(
    [
      {
        key: "n",
        ctrlKey: true,
        action: () => {
          const name = `新会话 ${new Date().toLocaleString()}`;
          createSession(name);
        },
      },
      {
        key: "Enter",
        ctrlKey: true,
        action: () => {
          if (input.trim()) {
            sendMessage();
          }
        },
      },
      {
        key: "c",
        ctrlKey: true,
        shiftKey: true,
        action: () => {
          clearChat();
        },
      },
      {
        key: "b",
        ctrlKey: true,
        action: () => {
          setIsSidebarOpen(!isSidebarOpen);
        },
      },
    ],
    keyboardShortcutsEnabled
  );

  // 处理文档上传
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

  // 处理批量文档上传
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

  const handleSelectDocument = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedDocuments((prev) => [...prev, id]);
    } else {
      setSelectedDocuments((prev) => prev.filter((docId) => docId !== id));
    }
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

  const clearChat = () => {
    updateCurrentSession({
      messages: [],
      response: "",
      seeds: [],
      searching: false,
    });

    toast("会话已清空", {
      description: "当前会话的所有消息已被清除",
    });
  };

  const handleVoiceInput = (transcript: string) => {
    setInput((prev) => prev + transcript);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!token) {
      toast.warning("需要 API 令牌", {
        description: "请输入您的 API 令牌以继续。",
      });
      return;
    }

    if (kbList.length === 0) {
      toast.error("需要知识库", {
        description: "请添加至少一个知识库 ID。",
      });
      return;
    }

    setLoading(true);
    const userMessage: Message = { role: "user", content: input };

    // Use history or just the current message based on settings
    const messagesToSend = useHistory
      ? [...currentSession.messages, userMessage]
      : [userMessage];

    // 更新当前会话的消息
    updateCurrentSession({
      messages: [...currentSession.messages, userMessage],
      response: "",
      seeds: [],
      searching: false,
    });

    setInput("");
    setIsTyping(false);

    // Get the selected documents that are ready
    const readySelectedDocs = documents
      .filter(
        (doc) => doc.status === "ready" && selectedDocuments.includes(doc.id)
      )
      .map((doc) => doc.id);

    try {
      if (stream) {
        // Handle streaming response
        const response = await fetch("/api/knowledge/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messagesToSend,
            token,
            model,
            kbList,
            documents: readySelectedDocs,
            temperature,
            max_tokens: maxTokens,
            response_format: responseFormat,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP 错误! 状态: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("响应体不可读");

        const decoder = new TextDecoder();
        let partialChunk = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          partialChunk += chunk;

          // Process each complete data: block
          const lines = partialChunk.split("\n\n");
          partialChunk = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.substring(5).trim());

                if (data.tag === "searching") {
                  updateCurrentSession({ searching: true });
                } else if (data.tag === "seeds") {
                  updateCurrentSession({ seeds: data.content });
                } else if (data.tag === "final") {
                  interface StreamResponseData {
                    tag: string;
                    content: string;
                  }

                  updateCurrentSession({
                    response:
                      (currentSession.response || "") +
                      (data as StreamResponseData).content,
                  });
                }
              } catch (e) {
                console.error("解析 JSON 错误:", e);
              }
            }
          }
        }
      } else {
        // Handle non-streaming response
        const response = await fetch("/api/knowledge/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messagesToSend,
            token,
            model,
            kbList,
            stream: false,
            documents: readySelectedDocs,
            temperature,
            max_tokens: maxTokens,
            response_format: responseFormat,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP 错误! 状态: ${response.status}`);
        }

        const data = await response.json();
        if (data.tag === "final") {
          updateCurrentSession({ response: data.content });
        }
      }
    } catch (error) {
      console.error("查询知识 API 错误:", error);
      toast.error("API 错误", {
        description:
          error instanceof Error ? error.message : "查询知识 API 失败",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 移动端底部导航处理函数
  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
    setCurrentMobileTab("menu");
  };

  const handleOpenDocuments = () => {
    setIsSidebarOpen(true);
    setActiveTab("documents");
    setCurrentMobileTab("documents");
  };

  const handleOpenSettings = () => {
    setIsSidebarOpen(true);
    setActiveTab("config");
    setCurrentMobileTab("settings");
  };

  const handleGoHome = () => {
    setCurrentMobileTab("home");
  };

  // 动态样式
  const getMessageStyle = (role: string) => {
    return cn(
      "p-3 rounded-lg mb-3 transition-all",
      role === "user"
        ? `bg-${accentColor}-50 dark:bg-${accentColor}-900/20 text-slate-800 dark:text-slate-200`
        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
      messageAlignment === "right" && role === "user" ? "ml-auto" : "",
      messageAlignment === "right" && role === "assistant" ? "mr-auto" : "",
      messageAlignment === "right" ? "max-w-[80%]" : "w-full"
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b dark:border-slate-700 py-3 px-4 md:px-6 bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <MobileSidebar
                token={token}
                setToken={setToken}
                kbList={kbList}
                setKbList={setKbList}
                model={model}
                setModel={setModel}
                documents={documents}
                selectedDocuments={selectedDocuments}
                handleDocumentUploaded={handleDocumentUploaded}
                handleSelectDocument={handleSelectDocument}
                handleDeleteDocument={handleDeleteDocument}
                messages={currentSession.messages}
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <Sparkles className={`h-5 w-5 mr-2 text-${accentColor}-500`} />
              AI 知识检索客户端
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <SessionManager
              sessions={sessions}
              currentSessionId={currentSessionId}
              onCreateSession={createSession}
              onSwitchSession={switchSession}
              onRenameSession={renameSession}
              onDeleteSession={deleteSession}
            />
            <div className="hidden md:flex items-center space-x-2">
              <Label htmlFor="stream-mode" className="text-sm">
                流式响应
              </Label>
              <Switch
                id="stream-mode"
                checked={stream}
                onCheckedChange={setStream}
              />
            </div>
            <SettingsPage
              keyboardShortcutsEnabled={keyboardShortcutsEnabled}
              setKeyboardShortcutsEnabled={setKeyboardShortcutsEnabled}
              autoSave={autoSave}
              setAutoSave={setAutoSave}
              messageAlignment={messageAlignment}
              setMessageAlignment={setMessageAlignment}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="container mx-auto flex flex-1 overflow-hidden p-2 md:p-4">
          <div className="flex flex-col overflow-hidden rounded-lg border dark:border-slate-700 shadow-sm w-full">
            <div className="flex flex-1 overflow-hidden">
              <ErrorBoundary>
                {/* Sidebar - hidden on mobile */}
                <div className="hidden md:flex md:flex-col md:w-1/3 lg:w-1/4 border-r dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                  <Tabs
                    defaultValue="config"
                    className="flex flex-col h-full"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="mx-4 mt-4 mb-2">
                      <TabsTrigger value="config">配置</TabsTrigger>
                      <TabsTrigger value="documents">文档</TabsTrigger>
                      <TabsTrigger value="history">历史</TabsTrigger>
                      <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="config"
                      className="flex-1 overflow-auto p-4 pt-0"
                    >
                      <AnimatedContainer type="fade" className="space-y-4">
                        <h2 className="text-lg font-semibold mb-4">配置</h2>

                        {/* API Token */}
                        <TokenInput value={token} onChange={setToken} />

                        {/* Model Selector */}
                        <div className="mt-4">
                          <ModelSelector value={model} onChange={setModel} />
                        </div>

                        {/* Knowledge Base IDs */}
                        <KnowledgeBaseInput
                          kbList={kbList}
                          onChange={setKbList}
                        />

                        {/* Advanced Options */}
                        <div className="mt-4 border-t dark:border-slate-700 pt-4">
                          <AdvancedOptions
                            temperature={temperature}
                            setTemperature={setTemperature}
                            maxTokens={maxTokens}
                            setMaxTokens={setMaxTokens}
                            useHistory={useHistory}
                            setUseHistory={setUseHistory}
                            responseFormat={responseFormat}
                            setResponseFormat={setResponseFormat}
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
                          <h2 className="text-lg font-semibold flex items-center">
                            <FileText size={18} className="mr-2" />
                            文档管理
                          </h2>
                          <div className="flex space-x-2">
                            <BatchDocumentProcessor
                              token={token}
                              onDocumentsUploaded={handleBatchDocumentsUploaded}
                            />
                          </div>
                        </div>

                        <DocumentUploader
                          token={token}
                          onDocumentUploaded={handleDocumentUploaded}
                        />

                        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            已上传文档{" "}
                            {documents.length > 0 && `(${documents.length})`}
                          </h3>

                          <DocumentSearch
                            documents={documents}
                            onFilteredDocuments={setFilteredDocuments}
                          />

                          <ScrollArea className="flex-1">
                            {filteredDocuments.map((doc) => (
                              <AnimatedContainer
                                key={doc.id}
                                type="slide"
                                direction="left"
                                className="mb-4"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <DocumentList
                                    documents={[doc]}
                                    selectedDocuments={selectedDocuments}
                                    onSelectDocument={handleSelectDocument}
                                    onDeleteDocument={handleDeleteDocument}
                                    token={token}
                                  />
                                  {doc.status === "ready" && (
                                    <DocumentPreview
                                      document={doc}
                                      token={token}
                                    />
                                  )}
                                </div>
                                {doc.status === "ready" && (
                                  <DocumentTags
                                    tags={documentTags[doc.id] || []}
                                    onTagsChange={(tags) =>
                                      handleDocumentTags(doc.id, tags)
                                    }
                                    className="ml-8 mt-1"
                                  />
                                )}
                              </AnimatedContainer>
                            ))}
                          </ScrollArea>

                          {selectedDocuments.length > 0 && (
                            <AnimatedContainer
                              type="slide"
                              direction="up"
                              className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm"
                            >
                              <p
                                className={`text-${accentColor}-700 dark:text-${accentColor}-300`}
                              >
                                已选择 {selectedDocuments.length} 个文档用于查询
                              </p>
                            </AnimatedContainer>
                          )}
                        </div>
                      </AnimatedContainer>
                    </TabsContent>

                    <TabsContent
                      value="history"
                      className="flex-1 overflow-auto p-4 pt-0"
                    >
                      <AnimatedContainer type="fade" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold">消息历史</h2>
                          <div className="flex space-x-2">
                            <ExportChat
                              messages={currentSession.messages}
                              response={currentSession.response}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearChat}
                              disabled={currentSession.messages.length === 0}
                            >
                              清空对话
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {currentSession.messages.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                              暂无消息记录，开始对话吧。
                            </p>
                          ) : (
                            currentSession.messages.map((msg, index) => (
                              <AnimatedContainer
                                key={index}
                                type="slide"
                                direction={
                                  msg.role === "user" ? "left" : "right"
                                }
                                delay={index * 0.05}
                                className={getMessageStyle(msg.role)}
                              >
                                <div className="flex items-center mb-1">
                                  <MessageSquare size={16} className="mr-2" />
                                  <span className="text-xs font-medium uppercase">
                                    {msg.role === "user" ? "用户" : "助手"}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">
                                  {msg.content}
                                </p>
                              </AnimatedContainer>
                            ))
                          )}
                        </div>
                      </AnimatedContainer>
                    </TabsContent>
                    <TabsContent
                      value="dashboard"
                      className="flex-1 overflow-auto p-4 pt-0"
                    >
                      <DashboardContent
                        sessions={sessions}
                        documents={documents}
                        documentTags={documentTags}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-800">
                    {currentSession.searching && (
                      <AnimatedContainer
                        type="slide"
                        direction="down"
                        className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-sm flex items-center"
                      >
                        <Loader2
                          size={16}
                          className="animate-spin mr-2 text-yellow-500"
                        />
                        <span className="text-yellow-700 dark:text-yellow-300">
                          正在搜索知识库...
                        </span>
                      </AnimatedContainer>
                    )}

                    {currentSession.seeds &&
                      currentSession.seeds.length > 0 && (
                        <AnimatedContainer type="fade" className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                              <Database size={16} className="mr-2" />
                              知识来源 ({currentSession.seeds.length})
                            </h3>
                            <CitationView
                              seeds={currentSession.seeds as KnowledgeSeed[]}
                            />
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg dark:border-slate-700 p-2">
                            {currentSession.seeds.map((seed, idx) => (
                              <AnimatedContainer
                                key={idx}
                                type="scale"
                                delay={idx * 0.05}
                                className="text-xs p-2 border rounded dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                              >
                                <div className="font-medium mb-1 text-slate-700 dark:text-slate-300">
                                  {seed.source_title || "来源 " + (idx + 1)}
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                                  {seed.content}
                                </p>
                              </AnimatedContainer>
                            ))}
                          </div>
                        </AnimatedContainer>
                      )}

                    {currentSession.response && (
                      <AnimatedContainer type="fade">
                        <AIResponse content={currentSession.response} />
                      </AnimatedContainer>
                    )}

                    {!currentSession.searching &&
                      (!currentSession.seeds ||
                        currentSession.seeds.length === 0) &&
                      !currentSession.response &&
                      !loading && (
                        <AnimatedContainer
                          type="scale"
                          className="h-full flex flex-col items-center justify-center text-center p-8"
                        >
                          <Database
                            size={48}
                            className="text-slate-300 dark:text-slate-600 mb-4"
                          />
                          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">
                            知识检索准备就绪
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 max-w-md">
                            在下方输入框中输入您的问题，从知识库中检索信息。
                          </p>
                        </AnimatedContainer>
                      )}

                    {loading && !currentSession.response && (
                      <AnimatedContainer
                        type="scale"
                        className="flex flex-col items-center justify-center h-32"
                      >
                        <Loader2
                          size={32}
                          className={`animate-spin text-${accentColor}-500 mb-4`}
                        />
                        <p className="text-slate-500 dark:text-slate-400">
                          正在处理您的请求...
                        </p>
                      </AnimatedContainer>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        placeholder="输入您的问题..."
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          setIsTyping(e.target.value.length > 0);
                        }}
                        onKeyDown={handleKeyDown}
                        className={`w-full pr-12 resize-none min-h-[100px] transition-all ${
                          isTyping ? `border-${accentColor}-500` : ""
                        }`}
                        disabled={loading}
                      />
                      <div className="absolute bottom-2 right-2 flex">
                        <VoiceInput
                          onTranscript={handleVoiceInput}
                          isDisabled={loading}
                        />
                        <Button
                          size="icon"
                          className={`bg-${accentColor}-500 hover:bg-${accentColor}-600`}
                          onClick={sendMessage}
                          disabled={!input.trim() || loading}
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                        <AlertCircle size={12} className="mr-1" />按 Enter
                        发送，Shift+Enter 换行
                      </div>

                      {isMobile && (
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="mobile-stream" className="text-xs">
                            流式响应
                          </Label>
                          <Switch
                            id="mobile-stream"
                            checked={stream}
                            onCheckedChange={setStream}
                            className="h-4 w-7"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onNewChat={() => createSession(`新会话 ${new Date().toLocaleString()}`)}
        onOpenSettings={handleOpenSettings}
        onOpenDocuments={handleOpenDocuments}
        onOpenSidebar={handleOpenSidebar}
        onGoHome={handleGoHome}
        currentTab={currentMobileTab}
      />
    </div>
  );
}

function DashboardContent({
  sessions,
  documents,
  documentTags,
}: {
  sessions: ConversationSession[];
  documents: UploadedDocument[];
  documentTags: Record<string, string[]>;
}) {
  return (
    <AnimatedContainer type="fade">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">
          欢迎使用您的 AI 知识检索仪表盘
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedContainer type="scale" delay={0.1}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  文档总数
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length || 1284}</div>
                <p className="text-xs text-muted-foreground">
                  较上周增加 24
                </p>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer type="scale" delay={0.2}>
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  活跃用户
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">较上周增加 5</p>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer type="scale" delay={0.3}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">搜索次数</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,845</div>
                <p className="text-xs text-muted-foreground">
                  较上月增长 12.5%
                </p>
              </CardContent>
            </Card>
          </AnimatedContainer>

          <AnimatedContainer type="scale" delay={0.4}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">上传数量</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground">
                  较上月增长 7%
                </p>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
            <TabsTrigger value="activity">活动</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnimatedContainer type="slide" direction="up" delay={0.2}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>数据洞察</CardTitle>
                    <CardDescription>
                      知识库使用情况和趋势可视化
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Suspense
                      fallback={<Skeleton className="h-[300px] w-full" />}
                    >
                      <LazyLoadWrapper>
                        <DataInsights
                          sessions={sessions}
                          documents={documents}
                          documentTags={documentTags}
                        />
                      </LazyLoadWrapper>
                    </Suspense>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>推荐内容</CardTitle>
                    <CardDescription>
                      基于您的使用模式的个性化内容
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense
                      fallback={<Skeleton className="h-[200px] w-full" />}
                    >
                      <LazyLoadWrapper>
                        <ContentRecommendations
                          sessions={sessions}
                          documents={documents}
                          documentTags={documentTags}
                        />
                      </LazyLoadWrapper>
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </AnimatedContainer>

            <AnimatedContainer type="slide" direction="up" delay={0.3}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      最近活动
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Suspense
                      fallback={<Skeleton className="h-[200px] w-full" />}
                    >
                      <LazyLoadWrapper>
                        <RealTimeUpdates
                          users={[
                            {
                              id: "1",
                              name: "用户1",
                              email: "user1@example.com",
                              role: "admin",
                              status: "active",
                              lastActive: new Date().toISOString(),
                              permissions: {
                                canCreateKb: true,
                                canEditKb: true,
                                canDeleteKb: true,
                                canUploadDocs: true,
                                canDeleteDocs: true,
                                canManageUsers: true,
                                canExportData: true,
                              },
                            },
                            {
                              id: "2",
                              name: "用户2",
                              email: "user2@example.com",
                              role: "manager",
                              status: "active",
                              lastActive: new Date().toISOString(),
                              permissions: {
                                canCreateKb: true,
                                canEditKb: true,
                                canDeleteKb: true,
                                canUploadDocs: true,
                                canDeleteDocs: true,
                                canManageUsers: false,
                                canExportData: true,
                              },
                            },
                            {
                              id: "3",
                              name: "用户3",
                              email: "user3@example.com",
                              role: "viewer",
                              status: "pending",
                              lastActive: new Date().toISOString(),
                              permissions: {
                                canCreateKb: false,
                                canEditKb: false,
                                canDeleteKb: false,
                                canUploadDocs: false,
                                canDeleteDocs: false,
                                canManageUsers: false,
                                canExportData: false,
                              },
                            },
                          ]}
                        />
                      </LazyLoadWrapper>
                    </Suspense>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      热门标签
                    </CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between">
                        <span className="text-sm">人工智能</span>
                        <span className="text-xs text-muted-foreground">245</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-sm">机器学习</span>
                        <span className="text-xs text-muted-foreground">189</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-sm">数据科学</span>
                        <span className="text-xs text-muted-foreground">156</span>
                      </li>
                      <li className="flex items-center justify之间">
                        <span className="text-sm">神经网络</span>
                        <span className="text-xs text-muted-foreground">132</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-sm">深度学习</span>
                        <span className="text-xs text-muted-foreground">98</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      性能指标
                    </CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">查询响应时间</span>
                          <span className="text-xs font-medium">245ms</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div className="h-1.5 w-1/3 rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">文档处理</span>
                          <span className="text-xs font-medium">1.2s</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div className="h-1.5 w-1/2 rounded-full bg-primary"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">API 延迟</span>
                          <span className="text-xs font-medium">89ms</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div className="h-1.5 w-1/4 rounded-full bg-primary"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnimatedContainer type="scale">
              <Card>
                <CardHeader>
                  <CardTitle>高级分析</CardTitle>
                  <CardDescription>
                    关于您的知识库使用情况的详细分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>分析内容将显示在此处</p>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <AnimatedContainer type="scale">
              <Card>
                <CardHeader>
                  <CardTitle>近期活动</CardTitle>
                  <CardDescription>
                    您与知识库的最近互动
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>活动日志将显示在此处</p>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedContainer>
  );
}
