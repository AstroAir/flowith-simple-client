"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Check,
  ChevronDown,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ConversationSession } from "@/lib/types";

interface SessionManagerProps {
  sessions: ConversationSession[];
  currentSessionId: string;
  onCreateSession: (name: string) => void;
  onSwitchSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function SessionManager({
  sessions,
  currentSessionId,
  onCreateSession,
  onSwitchSession,
  onRenameSession,
  onDeleteSession,
}: SessionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionToEdit, setSessionToEdit] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSession =
    sessions.find((session) => session.id === currentSessionId) || sessions[0];

  useEffect(() => {
    if ((isCreateDialogOpen || isRenameDialogOpen) && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isCreateDialogOpen, isRenameDialogOpen]);

  const handleCreateSession = () => {
    if (!newSessionName.trim()) {
      toast.warning("会话名称不能为空");
      return;
    }

    onCreateSession(newSessionName.trim());
    setNewSessionName("");
    setIsCreateDialogOpen(false);
    toast("会话已创建", {
      description: `已创建新会话 "${newSessionName.trim()}"`,
    });
  };

  const handleRenameSession = () => {
    if (!sessionToEdit) return;
    if (!newSessionName.trim()) {
      toast.warning("会话名称不能为空");
      return;
    }

    onRenameSession(sessionToEdit, newSessionName.trim());
    setNewSessionName("");
    setSessionToEdit(null);
    setIsRenameDialogOpen(false);
    toast("会话已重命名", {
      description: `会话已重命名为 "${newSessionName.trim()}"`,
    });
  };

  const handleDeleteSession = () => {
    if (!sessionToDelete) return;

    onDeleteSession(sessionToDelete);
    setSessionToDelete(null);
    setIsDeleteDialogOpen(false);
    toast("会话已删除", {
      description: "会话已成功删除",
    });
  };

  const openRenameDialog = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSessionToEdit(sessionId);
      setNewSessionName(session.name);
      setIsRenameDialogOpen(true);
    }
  };

  const openDeleteDialog = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      <div className="flex items-center">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-between w-full max-w-[240px]"
            >
              <div className="flex items-center mr-1 truncate">
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {currentSession?.name || "无会话"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            <div className="px-2 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              会话列表
            </div>
            <ScrollArea className="h-[min(400px,60vh)]">
              <div className="p-1">
                {sessions.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    暂无会话，点击下方按钮创建
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
                        session.id === currentSessionId
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <button
                        className="flex items-center flex-1 truncate text-left"
                        onClick={() => {
                          onSwitchSession(session.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <MessageSquare
                          className={cn(
                            "h-4 w-4 mr-2 flex-shrink-0",
                            session.id === currentSessionId
                              ? "text-blue-500 dark:text-blue-400"
                              : "text-slate-400 dark:text-slate-500"
                          )}
                        />
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate">
                            {session.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(session.updatedAt)}
                          </div>
                        </div>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => openRenameDialog(session.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            重命名
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(session.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsCreateDialogOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              创建新会话
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="ml-1"
          onClick={() => {
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 创建会话对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新会话</DialogTitle>
            <DialogDescription>为新会话输入一个名称</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="session-name" className="text-right">
              会话名称
            </Label>
            <Input
              id="session-name"
              ref={inputRef}
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="例如：项目研究、技术咨询..."
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateSession();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleCreateSession}>
              <Check className="h-4 w-4 mr-2" />
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名会话对话框 */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名会话</DialogTitle>
            <DialogDescription>为会话输入一个新名称</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-session" className="text-right">
              会话名称
            </Label>
            <Input
              id="rename-session"
              ref={inputRef}
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSession();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setSessionToEdit(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleRenameSession}>
              <Check className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除会话对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除会话</DialogTitle>
            <DialogDescription>
              确定要删除此会话吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSessionToDelete(null);
              }}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteSession}>
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
