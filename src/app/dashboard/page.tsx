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
            text: "How does the knowledge retrieval system work?",
            timestamp: "2 mins ago",
          },
          {
            id: 2,
            text: "What are the best practices for document organization?",
            timestamp: "15 mins ago",
          },
          {
            id: 3,
            text: "Can I integrate this with my existing CMS?",
            timestamp: "1 hour ago",
          },
          {
            id: 4,
            text: "How to optimize search performance?",
            timestamp: "3 hours ago",
          },
          {
            id: 5,
            text: "What file formats are supported?",
            timestamp: "5 hours ago",
          },
        ],
        recentDocuments: [
          {
            id: 1,
            name: "System Architecture.pdf",
            size: "2.4 MB",
            uploaded: "1 hour ago",
            type: "PDF",
          },
          {
            id: 2,
            name: "User Manual v2.1.docx",
            size: "1.8 MB",
            uploaded: "3 hours ago",
            type: "DOCX",
          },
          {
            id: 3,
            name: "API Documentation.md",
            size: "0.5 MB",
            uploaded: "5 hours ago",
            type: "MD",
          },
          {
            id: 4,
            name: "Implementation Guide.pdf",
            size: "3.2 MB",
            uploaded: "1 day ago",
            type: "PDF",
          },
          {
            id: 5,
            name: "Release Notes.txt",
            size: "0.1 MB",
            uploaded: "2 days ago",
            type: "TXT",
          },
        ],
        popularDocuments: [
          { id: 1, name: "Getting Started Guide.pdf", views: 245, type: "PDF" },
          { id: 2, name: "Troubleshooting.docx", views: 189, type: "DOCX" },
          { id: 3, name: "FAQ.md", views: 156, type: "MD" },
          { id: 4, name: "Best Practices.pdf", views: 132, type: "PDF" },
          { id: 5, name: "Integration Examples.txt", views: 98, type: "TXT" },
        ],
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getDocumentBadgeColor = (type: string): string => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "DOCX":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "MD":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "TXT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AnimatedContainer>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.documentsCount}
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.queriesCount}
                    </div>
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.usersCount}
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Knowledge Bases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : stats.knowledgeBasesCount}
                    </div>
                    <Database className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>Current storage utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={stats.storageUsed} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>{stats.storageUsed}% used</div>
                    <div>
                      {stats.storageUsed} GB of {stats.totalStorage} GB
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Queries</CardTitle>
                  <CardDescription>Latest search queries</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-pulse">Loading...</div>
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
                              <Search className="h-4 w-4 mt-1 text-muted-foreground" />
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
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>Latest uploaded documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-pulse">Loading...</div>
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
                              <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
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
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Documents</CardTitle>
                <CardDescription>Most viewed documents</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse">Loading...</div>
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
                            <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
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
                              {doc.views} views
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Types</CardTitle>
                  <CardDescription>Distribution by file format</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <PieChart className="h-40 w-40 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Sizes</CardTitle>
                  <CardDescription>Distribution by file size</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <BarChart className="h-40 w-40 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Activity</CardTitle>
                <CardDescription>Queries over time</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-80">
                <LineChart className="h-60 w-60 text-muted-foreground" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Active users over time</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <Activity className="h-40 w-40 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>Average query response time</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-60">
                  <BarChart className="h-40 w-40 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
    </div>
  );
}
