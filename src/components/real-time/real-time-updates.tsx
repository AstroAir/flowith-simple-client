"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellOff,
  Check,
  Clock,
  RefreshCw,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import type { User } from "@/components/user/user-management";

interface RealTimeUpdatesProps {
  users: User[];
}

interface ActivityEvent {
  id: string;
  type:
    | "document_upload"
    | "document_delete"
    | "session_create"
    | "user_login"
    | "user_logout"
    | "system";
  userId: string;
  timestamp: number;
  details: string;
}

export default function RealTimeUpdates({ users }: RealTimeUpdatesProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const { accentColor, animationsEnabled } = useTheme();

  // Simulate WebSocket connection
  useEffect(() => {
    if (!isEnabled) return;

    // Simulate connection status
    const connectionInterval = setInterval(() => {
      // 95% chance of staying connected
      const connected = Math.random() > 0.05;
      setIsConnected(connected);

      if (!connected) {
        toast.error("连接已断开", {
          description: "正在尝试重新连接...",
        });
      }
    }, 30000); // Check every 30 seconds

    // Simulate active users
    const updateActiveUsers = () => {
      const onlineUsers = users
        .filter(() => Math.random() > 0.3) // Randomly select users to be online
        .map((user) => user.id);
      setActiveUsers(onlineUsers);
    };

    updateActiveUsers();
    const userInterval = setInterval(updateActiveUsers, 60000); // Update every minute

    // Simulate incoming events
    const eventTypes: Array<ActivityEvent["type"]> = [
      "document_upload",
      "document_delete",
      "session_create",
      "user_login",
      "user_logout",
      "system",
    ];

    const eventInterval = setInterval(() => {
      if (!isConnected) return;

      // 30% chance of new event
      if (Math.random() > 0.7) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const eventType =
          eventTypes[Math.floor(Math.random() * eventTypes.length)];

        let details = "";
        switch (eventType) {
          case "document_upload":
            details = `上传了文档 "示例文档-${Math.floor(
              Math.random() * 1000
            )}.pdf"`;
            break;
          case "document_delete":
            details = `删除了文档 "示例文档-${Math.floor(
              Math.random() * 1000
            )}.pdf"`;
            break;
          case "session_create":
            details = `创建了新会话 "会话-${Math.floor(Math.random() * 1000)}"`;
            break;
          case "user_login":
            details = `登录了系统`;
            break;
          case "user_logout":
            details = `退出了系统`;
            break;
          case "system":
            details = `系统维护将在 ${new Date(
              Date.now() + 3600000
            ).toLocaleTimeString()} 进行`;
            break;
        }

        const newEvent: ActivityEvent = {
          id: Date.now().toString(),
          type: eventType,
          userId: randomUser.id,
          timestamp: Date.now(),
          details,
        };

        setEvents((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events

        // Show toast for important events
        if (eventType === "system") {
          toast("系统通知", {
            description: details,
          });
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(connectionInterval);
      clearInterval(userInterval);
      clearInterval(eventInterval);
    };
  }, [isEnabled, isConnected, users, toast]);

  const reconnect = () => {
    setIsConnected(false);

    toast("正在重新连接", {
      description: "尝试重新建立连接...",
    });

    // Simulate reconnection
    setTimeout(() => {
      setIsConnected(true);
      toast("连接已恢复", {
        description: "实时更新已恢复",
      });
    }, 2000);
  };

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "document_upload":
      case "document_delete":
        return <FileText className="h-4 w-4" />;
      case "session_create":
        return <MessageSquare className="h-4 w-4" />;
      case "user_login":
      case "user_logout":
        return <Users className="h-4 w-4" />;
      case "system":
        return <Bell className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "document_upload":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "document_delete":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "session_create":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "user_login":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "user_logout":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "system":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">实时动态</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEnabled(!isEnabled)}
            className="h-8 w-8"
          >
            {isEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="flex items-center">
          {isConnected ? (
            <>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 mr-2"
              >
                <Check className="h-3 w-3 mr-1" />
                已连接
              </Badge>
              <span>当前在线: {activeUsers.length} 用户</span>
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 mr-2"
              >
                已断开
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 py-0 text-xs"
                onClick={reconnect}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                重新连接
              </Button>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEnabled ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>暂无活动</p>
                </div>
              ) : (
                events.map((event) => {
                  const user = users.find((u) => u.id === event.userId);

                  return (
                    <AnimatedContainer
                      key={event.id}
                      type="slide"
                      direction="left"
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div
                        className={`p-1.5 rounded-full ${getEventColor(
                          event.type
                        )}`}
                      >
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {event.type === "system"
                              ? "系统通知"
                              : user?.name || "未知用户"}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.details}
                        </p>
                      </div>
                    </AnimatedContainer>
                  );
                })
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <BellOff className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>实时更新已禁用</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsEnabled(true)}
            >
              启用实时更新
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
