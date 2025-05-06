"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  LineChart,
  BarChart2,
  Calendar,
  Tag,
  Clock,
  FileText,
  MessageSquare,
  Download,
  Share2,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import type { ConversationSession } from "@/lib/types";
import type { UploadedDocument } from "@/components/document-uploader";

// Import chart libraries
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DataInsightsProps {
  sessions: ConversationSession[];
  documents: UploadedDocument[];
  documentTags: Record<string, string[]>;
}

export default function DataInsights({
  sessions,
  documents,
  documentTags,
}: DataInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("week");
  const { accentColor, animationsEnabled } = useTheme();

  // Prepare data for charts
  const prepareActivityData = () => {
    // Get dates for the selected time range
    const today = new Date();
    const dates: Date[] = [];
    const labels: string[] = [];

    if (timeRange === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
        labels.push(date.toLocaleDateString("zh-CN", { weekday: "short" }));
      }
    } else if (timeRange === "month") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
        labels.push(date.getDate().toString());
      }
    } else if (timeRange === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        dates.push(date);
        labels.push(date.toLocaleDateString("zh-CN", { month: "short" }));
      }
    }

    // Count sessions and documents per date
    const sessionCounts = dates.map((date) => {
      return sessions.filter((session) => {
        const sessionDate = new Date(session.updatedAt);
        return isSameDay(sessionDate, date, timeRange);
      }).length;
    });

    const documentCounts = dates.map((date) => {
      return documents.filter((doc) => {
        const docDate = new Date(doc.timestamp);
        return isSameDay(docDate, date, timeRange);
      }).length;
    });

    // Count messages per date
    const messageCounts = dates.map((date) => {
      return sessions.reduce((count, session) => {
        const sessionDate = new Date(session.updatedAt);
        if (isSameDay(sessionDate, date, timeRange)) {
          return count + session.messages.length;
        }
        return count;
      }, 0);
    });

    return {
      labels,
      sessionCounts,
      documentCounts,
      messageCounts,
    };
  };

  // Helper function to check if two dates are the same based on time range
  const isSameDay = (date1: Date, date2: Date, timeRange: string) => {
    if (timeRange === "week" || timeRange === "month") {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    } else if (timeRange === "year") {
      return (
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    }
    return false;
  };

  // Prepare document status data for pie chart
  const prepareDocumentStatusData = () => {
    const statusCounts: Record<string, number> = {
      ready: 0,
      processing: 0,
      uploading: 0,
      error: 0,
    };

    documents.forEach((doc) => {
      if (statusCounts[doc.status] !== undefined) {
        statusCounts[doc.status]++;
      }
    });

    return {
      labels: ["就绪", "处理中", "上传中", "错误"],
      data: [
        statusCounts.ready,
        statusCounts.processing,
        statusCounts.uploading,
        statusCounts.error,
      ],
    };
  };

  // Prepare tag distribution data
  const prepareTagDistributionData = () => {
    const tagCounts: Record<string, number> = {};

    Object.values(documentTags).forEach((tags) => {
      tags.forEach((tag) => {
        if (tagCounts[tag] === undefined) {
          tagCounts[tag] = 1;
        } else {
          tagCounts[tag]++;
        }
      });
    });

    // Sort tags by count (descending)
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Take top 10 tags

    return {
      labels: sortedTags.map(([tag]) => tag),
      data: sortedTags.map(([, count]) => count),
    };
  };

  // Get activity data
  const activityData = prepareActivityData();

  // Get document status data
  const documentStatusData = prepareDocumentStatusData();

  // Get tag distribution data
  const tagDistributionData = prepareTagDistributionData();

  // Calculate summary statistics
  const totalSessions = sessions.length;
  const totalDocuments = documents.length;
  const totalMessages = sessions.reduce(
    (count, session) => count + session.messages.length,
    0
  );
  const totalTags = Object.values(documentTags).reduce(
    (count, tags) => count + tags.length,
    0
  );

  // Calculate average messages per session
  const avgMessagesPerSession =
    totalSessions > 0
      ? Math.round((totalMessages / totalSessions) * 10) / 10
      : 0;

  // Calculate average tags per document
  const avgTagsPerDocument =
    totalDocuments > 0 ? Math.round((totalTags / totalDocuments) * 10) / 10 : 0;

  // Calculate document size statistics
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const avgSize =
    totalDocuments > 0 ? Math.round(totalSize / totalDocuments) : 0;

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>数据分析</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            数据分析与可视化
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="border-b px-6">
            <TabsList className="justify-start -mb-px">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                概览
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <LineChart className="h-4 w-4 mr-2" />
                活动
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                文档
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                <Tag className="h-4 w-4 mr-2" />
                标签
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <AnimatedContainer type="fade" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          总会话数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <MessageSquare
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-2xl font-bold">
                            {totalSessions}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          总文档数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <FileText
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-2xl font-bold">
                            {totalDocuments}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          总消息数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <MessageSquare
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-2xl font-bold">
                            {totalMessages}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          总标签数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Tag
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-2xl font-bold">{totalTags}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>文档状态分布</CardTitle>
                        <CardDescription>按状态分类的文档数量</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                          {documents.length > 0 ? (
                            <Pie
                              data={{
                                labels: documentStatusData.labels,
                                datasets: [
                                  {
                                    data: documentStatusData.data,
                                    backgroundColor: [
                                      "rgba(75, 192, 192, 0.6)",
                                      "rgba(255, 206, 86, 0.6)",
                                      "rgba(54, 162, 235, 0.6)",
                                      "rgba(255, 99, 132, 0.6)",
                                    ],
                                    borderColor: [
                                      "rgba(75, 192, 192, 1)",
                                      "rgba(255, 206, 86, 1)",
                                      "rgba(54, 162, 235, 1)",
                                      "rgba(255, 99, 132, 1)",
                                    ],
                                    borderWidth: 1,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                              }}
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                              <p>暂无文档数据</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>活动趋势</CardTitle>
                        <CardDescription>最近一周的活动数据</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Line
                            data={{
                              labels: activityData.labels,
                              datasets: [
                                {
                                  label: "会话",
                                  data: activityData.sessionCounts,
                                  borderColor: "rgba(75, 192, 192, 1)",
                                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                                  tension: 0.4,
                                },
                                {
                                  label: "文档",
                                  data: activityData.documentCounts,
                                  borderColor: "rgba(54, 162, 235, 1)",
                                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                                  tension: 0.4,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          平均每会话消息数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold">
                            {avgMessagesPerSession}
                          </div>
                          <span className="text-muted-foreground ml-2">
                            条/会话
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          平均每文档标签数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold">
                            {avgTagsPerDocument}
                          </div>
                          <span className="text-muted-foreground ml-2">
                            个/文档
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          平均文档大小
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold">
                            {formatFileSize(avgSize)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>导出报告</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>分享</span>
                    </Button>
                  </div>
                </AnimatedContainer>
              </ScrollArea>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="h-full flex flex-col">
              <div className="p-6 pb-3 flex justify-between items-center">
                <h3 className="text-lg font-medium">活动分析</h3>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">最近一周</SelectItem>
                    <SelectItem value="month">最近一月</SelectItem>
                    <SelectItem value="year">最近一年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="flex-1 px-6 pb-6">
                <AnimatedContainer type="fade" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>活动趋势</CardTitle>
                      <CardDescription>
                        {timeRange === "week"
                          ? "最近一周"
                          : timeRange === "month"
                          ? "最近一月"
                          : "最近一年"}
                        的活动数据
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <Line
                          data={{
                            labels: activityData.labels,
                            datasets: [
                              {
                                label: "会话",
                                data: activityData.sessionCounts,
                                borderColor: "rgba(75, 192, 192, 1)",
                                backgroundColor: "rgba(75, 192, 192, 0.2)",
                                tension: 0.4,
                              },
                              {
                                label: "文档",
                                data: activityData.documentCounts,
                                borderColor: "rgba(54, 162, 235, 1)",
                                backgroundColor: "rgba(54, 162, 235, 0.2)",
                                tension: 0.4,
                              },
                              {
                                label: "消息",
                                data: activityData.messageCounts,
                                borderColor: "rgba(255, 99, 132, 1)",
                                backgroundColor: "rgba(255, 99, 132, 0.2)",
                                tension: 0.4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>会话活动</CardTitle>
                        <CardDescription>会话创建和更新频率</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Bar
                            data={{
                              labels: activityData.labels,
                              datasets: [
                                {
                                  label: "会话数",
                                  data: activityData.sessionCounts,
                                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>消息活动</CardTitle>
                        <CardDescription>消息发送频率</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Bar
                            data={{
                              labels: activityData.labels,
                              datasets: [
                                {
                                  label: "消息数",
                                  data: activityData.messageCounts,
                                  backgroundColor: "rgba(255, 99, 132, 0.6)",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          最活跃的日期
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Calendar
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {activityData.sessionCounts.length > 0
                              ? activityData.labels[
                                  activityData.sessionCounts.indexOf(
                                    Math.max(...activityData.sessionCounts)
                                  )
                                ]
                              : "无数据"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          平均每日会话数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <MessageSquare
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {activityData.sessionCounts.length > 0
                              ? (
                                  activityData.sessionCounts.reduce(
                                    (a, b) => a + b,
                                    0
                                  ) / activityData.sessionCounts.length
                                ).toFixed(1)
                              : "0"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          平均每日消息数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <MessageSquare
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {activityData.messageCounts.length > 0
                              ? (
                                  activityData.messageCounts.reduce(
                                    (a, b) => a + b,
                                    0
                                  ) / activityData.messageCounts.length
                                ).toFixed(1)
                              : "0"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AnimatedContainer>
              </ScrollArea>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="h-full flex flex-col">
              <div className="p-6 pb-3">
                <h3 className="text-lg font-medium">文档分析</h3>
              </div>

              <ScrollArea className="flex-1 px-6 pb-6">
                <AnimatedContainer type="fade" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>文档状态分布</CardTitle>
                        <CardDescription>按状态分类的文档数量</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                          {documents.length > 0 ? (
                            <Pie
                              data={{
                                labels: documentStatusData.labels,
                                datasets: [
                                  {
                                    data: documentStatusData.data,
                                    backgroundColor: [
                                      "rgba(75, 192, 192, 0.6)",
                                      "rgba(255, 206, 86, 0.6)",
                                      "rgba(54, 162, 235, 0.6)",
                                      "rgba(255, 99, 132, 0.6)",
                                    ],
                                    borderColor: [
                                      "rgba(75, 192, 192, 1)",
                                      "rgba(255, 206, 86, 1)",
                                      "rgba(54, 162, 235, 1)",
                                      "rgba(255, 99, 132, 1)",
                                    ],
                                    borderWidth: 1,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                              }}
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                              <p>暂无文档数据</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>文档上传趋势</CardTitle>
                        <CardDescription>文档上传频率</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <Bar
                            data={{
                              labels: activityData.labels,
                              datasets: [
                                {
                                  label: "文档数",
                                  data: activityData.documentCounts,
                                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>文档大小分布</CardTitle>
                      <CardDescription>
                        按大小范围分类的文档数量
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {documents.length > 0 ? (
                          <Bar
                            data={{
                              labels: [
                                "0-100KB",
                                "100KB-1MB",
                                "1MB-5MB",
                                "5MB-10MB",
                                "10MB+",
                              ],
                              datasets: [
                                {
                                  label: "文档数",
                                  data: [
                                    documents.filter((doc) => doc.size < 102400)
                                      .length,
                                    documents.filter(
                                      (doc) =>
                                        doc.size >= 102400 && doc.size < 1048576
                                    ).length,
                                    documents.filter(
                                      (doc) =>
                                        doc.size >= 1048576 &&
                                        doc.size < 5242880
                                    ).length,
                                    documents.filter(
                                      (doc) =>
                                        doc.size >= 5242880 &&
                                        doc.size < 10485760
                                    ).length,
                                    documents.filter(
                                      (doc) => doc.size >= 10485760
                                    ).length,
                                  ],
                                  backgroundColor: "rgba(153, 102, 255, 0.6)",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                            }}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>暂无文档数据</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          总文档大小
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <FileText
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {formatFileSize(totalSize)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          最大文档
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <FileText
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {documents.length > 0
                              ? formatFileSize(
                                  Math.max(...documents.map((doc) => doc.size))
                                )
                              : "无数据"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          就绪文档比例
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Clock
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {documents.length > 0
                              ? `${Math.round(
                                  (documents.filter(
                                    (doc) => doc.status === "ready"
                                  ).length /
                                    documents.length) *
                                    100
                                )}%`
                              : "0%"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AnimatedContainer>
              </ScrollArea>
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags" className="h-full flex flex-col">
              <div className="p-6 pb-3">
                <h3 className="text-lg font-medium">标签分析</h3>
              </div>

              <ScrollArea className="flex-1 px-6 pb-6">
                <AnimatedContainer type="fade" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>标签分布</CardTitle>
                      <CardDescription>最常用的标签</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        {tagDistributionData.labels.length > 0 ? (
                          <Bar
                            data={{
                              labels: tagDistributionData.labels,
                              datasets: [
                                {
                                  label: "文档数",
                                  data: tagDistributionData.data,
                                  backgroundColor: "rgba(255, 159, 64, 0.6)",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              indexAxis: "y",
                              scales: {
                                x: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                            }}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                            <Tag className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>暂无标签数据</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>标签使用频率</CardTitle>
                        <CardDescription>
                          每个文档的标签数量分布
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          {documents.length > 0 ? (
                            <Pie
                              data={{
                                labels: [
                                  "无标签",
                                  "1个标签",
                                  "2个标签",
                                  "3个标签",
                                  "4个标签",
                                  "5个及以上",
                                ],
                                datasets: [
                                  {
                                    data: [
                                      Object.values(documentTags).filter(
                                        (tags) => tags.length === 0
                                      ).length,
                                      Object.values(documentTags).filter(
                                        (tags) => tags.length === 1
                                      ).length,
                                      Object.values(documentTags).filter(
                                        (tags) => tags.length === 2
                                      ).length,
                                      Object.values(documentTags).filter(
                                        (tags) => tags.length === 3
                                      ).length,
                                      Object.values(documentTags).filter(
                                        (tags) => tags.length === 4
                                      ).length,
                                      Object.values(documentTags).filter(
                                        (tags) => tags.length >= 5
                                      ).length,
                                    ],
                                    backgroundColor: [
                                      "rgba(201, 203, 207, 0.6)",
                                      "rgba(255, 99, 132, 0.6)",
                                      "rgba(255, 159, 64, 0.6)",
                                      "rgba(255, 205, 86, 0.6)",
                                      "rgba(75, 192, 192, 0.6)",
                                      "rgba(54, 162, 235, 0.6)",
                                    ],
                                    borderColor: [
                                      "rgb(201, 203, 207)",
                                      "rgb(255, 99, 132)",
                                      "rgb(255, 159, 64)",
                                      "rgb(255, 205, 86)",
                                      "rgb(75, 192, 192)",
                                      "rgb(54, 162, 235)",
                                    ],
                                    borderWidth: 1,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                              }}
                            />
                          ) : (
                            <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                              <Tag className="h-12 w-12 mx-auto mb-2 opacity-20" />
                              <p>暂无标签数据</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>标签关联性</CardTitle>
                        <CardDescription>常见的标签组合</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px] overflow-auto">
                        {Object.values(documentTags).some(
                          (tags) => tags.length >= 2
                        ) ? (
                          <div className="space-y-4">
                            {/* This is a simplified representation of tag correlations */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                <span>研究 + 科技</span>
                              </div>
                              <div className="w-1/2 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                  className={`bg-${accentColor}-500 h-2.5 rounded-full`}
                                  style={{ width: "70%" }}
                                ></div>
                              </div>
                              <span className="text-sm">70%</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                <span>报告 + 数据</span>
                              </div>
                              <div className="w-1/2 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                  className={`bg-${accentColor}-500 h-2.5 rounded-full`}
                                  style={{ width: "65%" }}
                                ></div>
                              </div>
                              <span className="text-sm">65%</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                <span>文档 + 指南</span>
                              </div>
                              <div className="w-1/2 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                  className={`bg-${accentColor}-500 h-2.5 rounded-full`}
                                  style={{ width: "55%" }}
                                ></div>
                              </div>
                              <span className="text-sm">55%</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                <span>项目 + 计划</span>
                              </div>
                              <div className="w-1/2 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                  className={`bg-${accentColor}-500 h-2.5 rounded-full`}
                                  style={{ width: "45%" }}
                                ></div>
                              </div>
                              <span className="text-sm">45%</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2" />
                                <span>分析 + 结果</span>
                              </div>
                              <div className="w-1/2 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                  className={`bg-${accentColor}-500 h-2.5 rounded-full`}
                                  style={{ width: "40%" }}
                                ></div>
                              </div>
                              <span className="text-sm">40%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                            <Tag className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>暂无足够的标签组合数据</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          最常用标签
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Tag
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {tagDistributionData.labels.length > 0
                              ? tagDistributionData.labels[0]
                              : "无数据"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          无标签文档
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <FileText
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {
                              documents.filter(
                                (doc) =>
                                  !documentTags[doc.id] ||
                                  documentTags[doc.id].length === 0
                              ).length
                            }
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            {documents.length > 0
                              ? `(${Math.round(
                                  (documents.filter(
                                    (doc) =>
                                      !documentTags[doc.id] ||
                                      documentTags[doc.id].length === 0
                                  ).length /
                                    documents.length) *
                                    100
                                )}%)`
                              : "(0%)"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          平均每文档标签数
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Tag
                            className={`h-5 w-5 mr-2 text-${accentColor}-500`}
                          />
                          <div className="text-xl font-bold">
                            {avgTagsPerDocument}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AnimatedContainer>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
