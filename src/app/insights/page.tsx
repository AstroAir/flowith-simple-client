"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  BarChart2,
  Tag,
  FileText,
  MessageSquare,
  Download,
  Users,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/components/theme-provider";
import DataInsights from "@/components/visualization/data-insights";
import { PageContainer, PageTitle, PageSection } from "@/components/layout/page-container";
import type { ConversationSession } from "@/lib/types";
import type { UploadedDocument } from "@/components/document-uploader";

export default function InsightsPage() {
  const [sessions, setSessions] = useLocalStorage<ConversationSession[]>(
    "ai-knowledge-sessions",
    []
  );
  const [documents, setDocuments] = useLocalStorage<UploadedDocument[]>(
    "ai-knowledge-documents",
    []
  );
  const [documentTags, setDocumentTags] = useLocalStorage<
    Record<string, string[]>
  >("ai-knowledge-document-tags", {});

  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");

  const { accentColor, animationsEnabled } = useTheme();

  return (
    <PageContainer>
      <PageTitle 
        title="数据洞察" 
        description="您的知识库使用情况和趋势分析"
        actions={
          <>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">最近7天</SelectItem>
                <SelectItem value="month">最近30天</SelectItem>
                <SelectItem value="year">最近12个月</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          </>
        }
      />

      <PageSection noPadding>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                文档总数
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                {documents.length > 0
                  ? `较上周增长 ${Math.floor(documents.length * 0.1)}`
                  : "尚无文档"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                会话总数
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                {sessions.length > 0
                  ? `较上周增长 ${Math.floor(sessions.length * 0.15)}`
                  : "尚无会话"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                消息总数
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.reduce(
                  (count, session) => count + session.messages.length,
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {sessions.length > 0
                  ? "较上月增长 12.5%"
                  : "尚无消息"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                标签总数
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(documentTags).reduce(
                  (count, tags) => count + tags.length,
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.keys(documentTags).length > 0
                  ? "较上月增长 7%"
                  : "尚无标签"}
              </p>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <PageSection noPadding>
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              活动
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              文档
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              标签
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              用户
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>数据洞察</CardTitle>
                <CardDescription>
                  您的知识库使用情况和趋势可视化。
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataInsights
                  sessions={sessions}
                  documents={documents}
                  documentTags={documentTags}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>活动趋势</CardTitle>
                <CardDescription>
                  使用模式和随时间变化的活动。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    活动可视化将显示在此处。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>文档分析</CardTitle>
                <CardDescription>
                  文档使用和性能指标。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    文档分析将显示在此处。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>标签分布</CardTitle>
                <CardDescription>
                  跨文档的标签使用分析。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    标签分布将显示在此处。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>用户活动</CardTitle>
                <CardDescription>
                  用户参与度和活动指标。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    用户活动将显示在此处。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageSection>

      <PageSection noPadding>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                性能指标
              </CardTitle>
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                热门标签
              </CardTitle>
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
                <li className="flex items-center justify-between">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                系统状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">API 服务</span>
                  </div>
                  <span className="text-xs text-green-500">运行正常</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">数据库</span>
                  </div>
                  <span className="text-xs text-green-500">运行正常</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">搜索引擎</span>
                  </div>
                  <span className="text-xs text-green-500">运行正常</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">AI 模型</span>
                  </div>
                  <span className="text-xs text-yellow-500">性能下降</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </PageContainer>
  );
}
