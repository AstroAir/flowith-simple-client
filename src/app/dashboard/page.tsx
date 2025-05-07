"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  FileText,
  Users,
  Database,
  Search,
  Clock,
} from "lucide-react";
import AnimatedContainer from "@/components/ui/animated-container";
import { PageContainer, PageTitle, PageSection, PageGrid } from "@/components/layout/page-container";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

// 定义类型
interface Query {
  id: number;
  text: string;
  timestamp: string;
}

interface Document {
  id: number;
  name: string;
  size: string;
  uploaded: string;
  type: string;
}

interface PopularDocument {
  id: number;
  name: string;
  views: number;
  type: string;
}

interface Stats {
  documentsCount: number;
  queriesCount: number;
  usersCount: number;
  knowledgeBasesCount: number;
  storageUsed: number;
  totalStorage: number;
  recentQueries: Query[];
  recentDocuments: Document[];
  popularDocuments: PopularDocument[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    documentsCount: 0,
    queriesCount: 0,
    usersCount: 0,
    knowledgeBasesCount: 0,
    storageUsed: 0,
    totalStorage: 100,
    recentQueries: [],
    recentDocuments: [],
    popularDocuments: [],
  });
  
  // 使用全局主题设置
  const { theme, accentColor, animationsEnabled } = useTheme();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        documentsCount: 256,
        queriesCount: 1243,
        usersCount: 18,
        knowledgeBasesCount: 5,
        storageUsed: 68,
        totalStorage: 100,
        recentQueries: [
          {
            id: 1,
            text: "知识检索系统是如何工作的？",
            timestamp: "2 分钟前",
          },
          {
            id: 2,
            text: "文档组织的最佳实践是什么？",
            timestamp: "15 分钟前",
          },
          {
            id: 3,
            text: "我可以将这个系统与现有的 CMS 集成吗？",
            timestamp: "1 小时前",
          },
          {
            id: 4,
            text: "如何优化搜索性能？",
            timestamp: "3 小时前",
          },
          {
            id: 5,
            text: "支持哪些文件格式？",
            timestamp: "5 小时前",
          },
        ],
        recentDocuments: [
          {
            id: 1,
            name: "系统架构.pdf",
            size: "2.4 MB",
            uploaded: "1 小时前",
            type: "PDF",
          },
          {
            id: 2,
            name: "用户手册 v2.1.docx",
            size: "1.8 MB",
            uploaded: "3 小时前",
            type: "DOCX",
          },
          {
            id: 3,
            name: "API 文档.md",
            size: "0.5 MB",
            uploaded: "5 小时前",
            type: "MD",
          },
          {
            id: 4,
            name: "实施指南.pdf",
            size: "3.2 MB",
            uploaded: "1 天前",
            type: "PDF",
          },
          {
            id: 5,
            name: "发布说明.txt",
            size: "0.1 MB",
            uploaded: "2 天前",
            type: "TXT",
          },
        ],
        popularDocuments: [
          { id: 1, name: "入门指南.pdf", views: 245, type: "PDF" },
          { id: 2, name: "故障排除.docx", views: 189, type: "DOCX" },
          { id: 3, name: "常见问题.md", views: 156, type: "MD" },
          { id: 4, name: "最佳实践.pdf", views: 132, type: "PDF" },
          { id: 5, name: "集成示例.txt", views: 98, type: "TXT" },
        ],
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getDocumentBadgeColor = (type: string): string => {
    switch (type) {
      case "PDF":
        return cn(
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          accentColor === "red" && "bg-red-200 dark:bg-red-800"
        );
      case "DOCX":
        return cn(
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          accentColor === "blue" && "bg-blue-200 dark:bg-blue-800"
        );
      case "MD":
        return cn(
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          accentColor === "purple" && "bg-purple-200 dark:bg-purple-800"
        );
      case "TXT":
        return cn(
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        );
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <PageContainer>
      <PageTitle 
        title="仪表盘" 
        description="欢迎使用AI知识检索仪表盘"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="documents">文档</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PageSection animation={animationsEnabled ? "fade" : "none"} delay={0.1}>
            <PageGrid columns={4}>
              <Card className={cn(accentColor === "blue" && "border-blue-200 dark:border-blue-800")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    文档
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.documentsCount}
                    </div>
                    <FileText className={`h-5 w-5 text-${accentColor}-500 text-muted-foreground`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">查询</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.queriesCount}
                    </div>
                    <Search className={`h-5 w-5 text-${accentColor}-500 text-muted-foreground`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">用户</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.usersCount}
                    </div>
                    <Users className={`h-5 w-5 text-${accentColor}-500 text-muted-foreground`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    知识库
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.knowledgeBasesCount}
                    </div>
                    <Database className={`h-5 w-5 text-${accentColor}-500 text-muted-foreground`} />
                  </div>
                </CardContent>
              </Card>
            </PageGrid>
          </PageSection>

          <PageSection animation={animationsEnabled ? "slide" : "none"} delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>存储使用情况</CardTitle>
                <CardDescription>当前存储利用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress 
                    value={stats.storageUsed} 
                    className={`h-2 bg-${accentColor}-100 dark:bg-${accentColor}-900/20`} 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>{stats.storageUsed}% 已使用</div>
                    <div>
                      {stats.storageUsed} GB / {stats.totalStorage} GB
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageSection>

          <PageSection animation={animationsEnabled ? "fade" : "none"} delay={0.3}>
            <PageGrid columns={2}>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>最近查询</CardTitle>
                  <CardDescription>最新搜索查询</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-pulse">加载中...</div>
                    </div>
                  ) : (
                    <ScrollArea className="h-60">
                      <div className="space-y-4">
                        {stats.recentQueries.map((query) => (
                          <div
                            key={query.id}
                            className="flex justify-between items-start border-b pb-3"
                          >
                            <div className="flex items-start gap-2">
                              <Search className={`h-4 w-4 mt-1 text-${accentColor}-500 text-muted-foreground`} />
                              <div>
                                <p className="text-sm font-medium">
                                  {query.text}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {query.timestamp}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>最近文档</CardTitle>
                  <CardDescription>最新上传的文档</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-pulse">加载中...</div>
                    </div>
                  ) : (
                    <ScrollArea className="h-60">
                      <div className="space-y-4">
                        {stats.recentDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex justify-between items-start border-b pb-3"
                          >
                            <div className="flex items-start gap-2">
                              <FileText className={`h-4 w-4 mt-1 text-${accentColor}-500 text-muted-foreground`} />
                              <div>
                                <p className="text-sm font-medium">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                className={`text-xs ${getDocumentBadgeColor(
                                  doc.type
                                )}`}
                              >
                                {doc.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {doc.uploaded}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </PageGrid>
          </PageSection>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <PageSection title="热门文档" description="最常查看的文档" animation={animationsEnabled ? "fade" : "none"}>
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse">加载中...</div>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {stats.popularDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex justify-between items-start border-b pb-3"
                        >
                          <div className="flex items-start gap-2">
                            <FileText className={`h-4 w-4 mt-1 text-${accentColor}-500 text-muted-foreground`} />
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              className={`text-xs ${getDocumentBadgeColor(
                                doc.type
                              )}`}
                            >
                              {doc.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {doc.views} 次查看
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </PageSection>

          <PageSection animation={animationsEnabled ? "fade" : "none"} delay={0.2}>
            <PageGrid columns={2}>
              <Card>
                <CardHeader>
                  <CardTitle>文档类型</CardTitle>
                  <CardDescription>按文件格式分布</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <PieChart className={`h-40 w-40 text-${accentColor}-500 text-muted-foreground`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>文档大小</CardTitle>
                  <CardDescription>按文件大小分布</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <BarChart className={`h-40 w-40 text-${accentColor}-500 text-muted-foreground`} />
                </CardContent>
              </Card>
            </PageGrid>
          </PageSection>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PageSection animation={animationsEnabled ? "fade" : "none"}>
            <Card>
              <CardHeader>
                <CardTitle>查询活动</CardTitle>
                <CardDescription>随时间的查询情况</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-80">
                <LineChart className={`h-60 w-60 text-${accentColor}-500 text-muted-foreground`} />
              </CardContent>
            </Card>
          </PageSection>

          <PageSection animation={animationsEnabled ? "fade" : "none"} delay={0.2}>
            <PageGrid columns={2}>
              <Card>
                <CardHeader>
                  <CardTitle>用户活动</CardTitle>
                  <CardDescription>随时间的活跃用户</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <Activity className={`h-40 w-40 text-${accentColor}-500 text-muted-foreground`} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>响应时间</CardTitle>
                  <CardDescription>平均查询响应时间</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <BarChart className={`h-40 w-40 text-${accentColor}-500 text-muted-foreground`} />
                </CardContent>
              </Card>
            </PageGrid>
          </PageSection>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
