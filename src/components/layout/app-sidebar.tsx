"use client";

import type React from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Home,
  Settings,
  Users,
  Search,
  Database,
  Upload,
  History,
  BookOpen,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { accentColor } = useTheme();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">知识库</span>
        </div>
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索..."
              className="w-full bg-background pl-8 text-sm"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link href="/" className="flex items-center gap-3">
                    <Home className="h-4 w-4" />
                    <span>仪表盘</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/documents")}>
                  <Link href="/documents" className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <span>文档</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/search")}>
                  <Link href="/search" className="flex items-center gap-3">
                    <Search className="h-4 w-4" />
                    <span>高级搜索</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/history")}>
                  <Link href="/history" className="flex items-center gap-3">
                    <History className="h-4 w-4" />
                    <span>历史</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/documents")}>
                  <Link href="/documents" className="flex items-center gap-3">
                    <Upload className="h-4 w-4" />
                    <span>上传</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/dashboard")}
                >
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    <span>用户管理</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/database")}>
                  <Link href="/database" className="flex items-center gap-3">
                    <Database className="h-4 w-4" />
                    <span>知识库</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>分析</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/insights")}>
                  <Link href="/insights" className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4" />
                    <span>数据洞察</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border mt-auto">
        <div className="flex items-center justify-between p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">用户资料</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile, isMounted]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen bg-background">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out z-30",
            isMobile ? "fixed inset-y-0 left-0 w-64" : "relative"
          )}
        >
          <AppSidebar />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 flex items-center gap-4 border-b border-border px-4 md:px-6 bg-background sticky top-0 z-20">
            <div className="flex items-center">
              {/* 修复问题：SidebarTrigger 需要一个单独的子元素 */}
              <SidebarTrigger>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <div className="hidden md:flex items-center">
                <h1 className="text-xl font-bold">
                  {isMobile ? "" : "AI 知识检索"}
                </h1>
              </div>
            </div>
            <div className="flex-1"></div>
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
