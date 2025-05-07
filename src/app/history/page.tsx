"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Download,
  MessageSquare,
  Search,
  Trash2,
  User,
  Bot,
  MoreHorizontal,
  Share2,
  Copy,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import { PageContainer, PageTitle, PageSection } from "@/components/layout/page-container";
import type { ConversationSession, Message } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HistoryPage() {
  const [sessions, setSessions] = useLocalStorage<ConversationSession[]>(
    "ai-knowledge-sessions",
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const { accentColor, animationsEnabled } = useTheme();

  // Filter sessions based on search query and active tab
  const filteredSessions = sessions.filter((session) => {
    // Filter by search query
    if (
      searchQuery &&
      !session.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !session.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }

    // Filter by tab
    if (activeTab === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(session.updatedAt) >= today;
    } else if (activeTab === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(session.updatedAt) >= weekAgo;
    } else if (activeTab === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(session.updatedAt) >= monthAgo;
    }

    return true;
  });

  // Sort sessions by updatedAt (newest first)
  const sortedSessions = [...filteredSessions].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter((session) => session.id !== sessionId));
    setSelectedSessions(selectedSessions.filter((id) => id !== sessionId));

    toast("会话已删除", {
      description: "对话已被删除。",
    });
  };

  const deleteSelectedSessions = () => {
    setSessions(
      sessions.filter((session) => !selectedSessions.includes(session.id))
    );
    setSelectedSessions([]);

    toast("会话已删除", {
      description: `${selectedSessions.length} 个对话已被删除。`,
    });
  };

  const toggleSelectSession = (sessionId: string) => {
    setSelectedSessions((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else {
        return [...prev, sessionId];
      }
    });
  };

  const selectAllSessions = () => {
    if (selectedSessions.length === sortedSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sortedSessions.map((session) => session.id));
    }
  };

  const copySessionContent = (session: ConversationSession) => {
    const content = session.messages
      .map(
        (msg) => `${msg.role === "user" ? "用户" : "助手"}: ${msg.content}`
      )
      .join("\n\n");

    navigator.clipboard.writeText(content);

    toast("已复制到剪贴板", {
      description: "对话内容已复制到剪贴板。",
    });
  };

  const exportSession = (session: ConversationSession) => {
    const content = {
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages,
      response: session.response,
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.name.replace(/\s+/g, "_")}_${format(
      new Date(session.updatedAt),
      "yyyy-MM-dd"
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("会话已导出", {
      description: "对话已导出为JSON文件。",
    });
  };

  return (
    <PageContainer>
      <PageTitle 
        title="对话历史" 
        description="查看和管理所有过去的对话"
        actions={
          <>
            {selectedSessions.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedSessions}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                删除选中项
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={selectAllSessions}>
              {selectedSessions.length === sortedSessions.length
                ? "取消全选"
                : "全选"}
            </Button>
          </>
        }
      />

      <PageSection>
        <Card>
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索对话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">所有时间</TabsTrigger>
                <TabsTrigger value="today">今天</TabsTrigger>
                <TabsTrigger value="week">本周</TabsTrigger>
                <TabsTrigger value="month">本月</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
          <CardFooter className="pt-0 text-sm text-muted-foreground">
            找到 {sortedSessions.length} 个对话
          </CardFooter>
        </Card>
      </PageSection>

      <PageSection noPadding animation="fade">
        {sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">未找到对话</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "尝试调整您的搜索查询以找到您要查找的内容。"
                : "开始一个新的对话，它将显示在您的历史记录中。"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <AnimatedContainer key={session.id} type="fade">
                <Card
                  className={`overflow-hidden ${
                    selectedSessions.includes(session.id)
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-2">
                        <CardTitle className="text-lg flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {session.name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(
                            new Date(session.updatedAt),
                            "yyyy年M月d日 HH:mm"
                          )}
                          <span className="mx-2">•</span>
                          {session.messages.length} 条消息
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleSelectSession(session.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSessions.includes(session.id)}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => copySessionContent(session)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              复制内容
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => exportSession(session)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              导出
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              分享
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {session.messages.length > 0
                        ? session.messages[session.messages.length - 1].content
                        : "无消息"}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSession(
                          expandedSession === session.id ? null : session.id
                        )
                      }
                    >
                      {expandedSession === session.id
                        ? "隐藏消息"
                        : "查看消息"}
                    </Button>
                    <Button variant="outline" size="sm">
                      继续对话
                    </Button>
                  </CardFooter>
                  {expandedSession === session.id && (
                    <div className="border-t p-4 bg-muted/30">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {session.messages.map((message, index) => (
                            <MessageBubble key={index} message={message} />
                          ))}
                          {session.response && (
                            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                              <div className="flex items-center mb-1">
                                <Bot className="h-4 w-4 mr-2" />
                                <span className="text-xs font-medium uppercase">
                                  回复
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {session.response}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </Card>
              </AnimatedContainer>
            ))}
          </div>
        )}
      </PageSection>
    </PageContainer>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const { accentColor } = useTheme();

  return (
    <div
      className={`p-3 rounded-lg ${
        message.role === "user"
          ? `bg-${accentColor}-50 dark:bg-${accentColor}-900/20 text-slate-800 dark:text-slate-200`
          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
      }`}
    >
      <div className="flex items-center mb-1">
        {message.role === "user" ? (
          <User className="h-4 w-4 mr-2" />
        ) : (
          <Bot className="h-4 w-4 mr-2" />
        )}
        <span className="text-xs font-medium uppercase">
          {message.role === "user" ? "用户" : "助手"}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}
