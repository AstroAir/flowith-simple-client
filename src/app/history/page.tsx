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

    toast("Session deleted", {
      description: "The conversation has been deleted.",
    });
  };

  const deleteSelectedSessions = () => {
    setSessions(
      sessions.filter((session) => !selectedSessions.includes(session.id))
    );
    setSelectedSessions([]);

    toast("Sessions deleted", {
      description: `${selectedSessions.length} conversations have been deleted.`,
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
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    navigator.clipboard.writeText(content);

    toast("Copied to clipboard", {
      description:
        "The conversation content has been copied to your clipboard.",
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

    toast("Session exported", {
      description: "The conversation has been exported as JSON.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Conversation History
          </h1>
          <div className="flex items-center gap-2">
            {selectedSessions.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedSessions}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={selectAllSessions}>
              {selectedSessions.length === sortedSessions.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
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
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
          <CardFooter className="pt-0 text-sm text-muted-foreground">
            {sortedSessions.length} conversations found
          </CardFooter>
        </Card>

        {sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">No conversations found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "Try adjusting your search query to find what you're looking for."
                : "Start a new conversation to see it in your history."}
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
                            "MMM d, yyyy h:mm a"
                          )}
                          <span className="mx-2">•</span>
                          {session.messages.length} messages
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
                              Copy Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => exportSession(session)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
                        : "No messages"}
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
                        ? "Hide Messages"
                        : "View Messages"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Continue Conversation
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
                                  Response
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
      </div>
    </div>
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
          {message.role === "user" ? "User" : "Assistant"}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}
