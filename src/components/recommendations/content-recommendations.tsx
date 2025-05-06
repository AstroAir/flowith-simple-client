"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  FileText,
  Tag,
  BookOpen,
  ThumbsUp,
  ChevronRight,
  Star,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { ConversationSession } from "@/lib/types";
import type { UploadedDocument } from "@/components/document-uploader";

interface ContentRecommendationsProps {
  sessions: ConversationSession[];
  documents: UploadedDocument[];
  documentTags: Record<string, string[]>;
}

interface Recommendation {
  id: string;
  type: "document" | "session" | "tag" | "topic";
  title: string;
  description: string;
  relevance: number; // 0-100
  source?: string;
  tags?: string[];
}

export default function ContentRecommendations({
  sessions,
  documents,
  documentTags,
}: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const { accentColor } = useTheme();

  // 计算和生成推荐内容
  useEffect(() => {
    // 模拟异步数据加载
    setLoading(true);

    // 延迟执行以模拟API调用
    const timer = setTimeout(() => {
      // 生成推荐内容列表
      const generatedRecommendations: Recommendation[] = [
        ...generateSessionRecommendations(sessions),
        ...generateDocumentRecommendations(documents, documentTags),
        ...generateTagRecommendations(documents, documentTags),
        ...generateTopicRecommendations(sessions, documents),
      ];

      // 按相关性排序
      generatedRecommendations.sort((a, b) => b.relevance - a.relevance);

      setRecommendations(generatedRecommendations);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [sessions, documents, documentTags]);

  // 根据会话历史生成推荐
  const generateSessionRecommendations = (
    sessions: ConversationSession[]
  ): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // 获取最近的几个会话
    const recentSessions = [...sessions]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3);

    // 为每个会话创建推荐
    recentSessions.forEach((session) => {
      // 提取会话中的关键内容作为描述
      let description = "";
      if (session.messages.length > 0) {
        // 使用最近的消息作为描述
        description = session.messages[session.messages.length - 1].content;
        // 截断描述
        description =
          description.length > 100
            ? `${description.substring(0, 100)}...`
            : description;
      }

      recommendations.push({
        id: `session-${session.id}`,
        type: "session",
        title: session.name || "未命名会话",
        description,
        relevance: 85 + Math.floor(Math.random() * 15), // 模拟相关性得分
        source: `${new Date(session.updatedAt).toLocaleDateString()}`,
        tags: extractKeywords(
          session.messages.map((msg) => msg.content).join(" ")
        ),
      });
    });

    return recommendations;
  };

  // 根据文档生成推荐
  const generateDocumentRecommendations = (
    documents: UploadedDocument[],
    documentTags: Record<string, string[]>
  ): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // 优先考虑有标签的文档
    const docsWithTags = documents.filter(
      (doc) => documentTags[doc.id] && documentTags[doc.id].length > 0
    );

    // 选择一些文档作为推荐
    const selectedDocs = [...docsWithTags]
      .sort(() => 0.5 - Math.random()) // 随机排序
      .slice(0, 4);

    selectedDocs.forEach((doc) => {
      recommendations.push({
        id: `document-${doc.id}`,
        type: "document",
        title: doc.name,
        description: `${"查看此文档以获取更多相关信息"}`,
        relevance: 70 + Math.floor(Math.random() * 25),
        source: formatFileSize(doc.size),
        tags: documentTags[doc.id] || [],
      });
    });

    return recommendations;
  };

  // 根据标签生成推荐
  const generateTagRecommendations = (
    documents: UploadedDocument[],
    documentTags: Record<string, string[]>
  ): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // 收集所有标签并计算频率
    const tagFrequency: Record<string, number> = {};
    Object.values(documentTags).forEach((tags) => {
      tags.forEach((tag) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    // 获取最常用的标签
    const popularTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // 为每个热门标签创建推荐
    popularTags.forEach((tag) => {
      // 查找包含此标签的文档
      const relatedDocs = documents.filter(
        (doc) => documentTags[doc.id] && documentTags[doc.id].includes(tag)
      );

      if (relatedDocs.length > 0) {
        recommendations.push({
          id: `tag-${tag}`,
          type: "tag",
          title: `#${tag}`,
          description: `该主题有 ${relatedDocs.length} 个相关文档可供参考`,
          relevance: 60 + Math.floor(Math.random() * 30),
          source: `${relatedDocs.length} 个文档`,
          tags: [tag],
        });
      }
    });

    return recommendations;
  };

  // 根据内容分析生成主题推荐
  const generateTopicRecommendations = (
    sessions: ConversationSession[],
    documents: UploadedDocument[]
  ): Recommendation[] => {
    // 这里实际应用中可能需要NLP或LLM分析提取主题
    // 这里我们模拟一些主题作为示例
    const sampleTopics = [
      {
        title: "数据分析基础",
        description:
          "探索数据分析的基本概念、方法和工具，包括数据清洗、可视化和统计分析",
        tags: ["数据分析", "统计", "可视化"],
      },
      {
        title: "机器学习入门",
        description:
          "了解机器学习的核心概念，包括监督学习、无监督学习和常见算法",
        tags: ["机器学习", "AI", "算法"],
      },
      {
        title: "前端开发最佳实践",
        description: "学习现代前端开发的技巧和工具，提高代码质量和开发效率",
        tags: ["前端", "React", "Web开发"],
      },
    ];

    return sampleTopics.map((topic, index) => ({
      id: `topic-${index}`,
      type: "topic",
      title: topic.title,
      description: topic.description,
      relevance: 50 + Math.floor(Math.random() * 45),
      tags: topic.tags,
    }));
  };

  // 从文本中提取关键词作为标签
  const extractKeywords = (text: string): string[] => {
    // 在实际应用中，应该使用NLP或API提取关键词
    // 这里用简单方法模拟
    const commonWords = [
      "a",
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "is",
      "are",
      "was",
      "were",
    ];
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word));

    // 获取不重复的词
    const uniqueWords = Array.from(new Set(words));

    // 返回最多4个"关键词"
    return uniqueWords.slice(0, 4);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 根据类型过滤推荐
  const filteredRecommendations =
    activeTab === "all"
      ? recommendations
      : recommendations.filter((rec) => rec.type === activeTab);

  // 获取推荐类型的图标
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "session":
        return <MessageSquare className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "tag":
        return <Tag className="h-5 w-5" />;
      case "topic":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  // 获取推荐类型的颜色
  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "session":
        return "text-blue-500";
      case "document":
        return "text-green-500";
      case "tag":
        return "text-amber-500";
      case "topic":
        return "text-purple-500";
      default:
        return `text-${accentColor}-500`;
    }
  };

  // 获取推荐相关性的星级表示
  const getRelevanceStars = (relevance: number) => {
    const starsCount = Math.round(relevance / 20);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < starsCount
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-2 border-b">
        <h3 className="text-lg font-medium">推荐内容</h3>
        <p className="text-sm text-muted-foreground">
          基于你的历史会话和文档分析
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 py-2 border-b">
          <TabsList className="grid grid-cols-5 h-8">
            <TabsTrigger value="all" className="text-xs">
              全部
            </TabsTrigger>
            <TabsTrigger value="session" className="text-xs">
              会话
            </TabsTrigger>
            <TabsTrigger value="document" className="text-xs">
              文档
            </TabsTrigger>
            <TabsTrigger value="tag" className="text-xs">
              标签
            </TabsTrigger>
            <TabsTrigger value="topic" className="text-xs">
              主题
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-8 bg-muted rounded w-1/4"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((recommendation) => (
                  <Card
                    key={recommendation.id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span
                          className={getRecommendationColor(
                            recommendation.type
                          )}
                        >
                          {getRecommendationIcon(recommendation.type)}
                        </span>
                        {recommendation.title}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>
                          {recommendation.type === "session"
                            ? "会话"
                            : recommendation.type === "document"
                            ? "文档"
                            : recommendation.type === "tag"
                            ? "标签集合"
                            : "主题"}
                        </span>
                        {getRelevanceStars(recommendation.relevance)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recommendation.description}
                      </p>
                      {recommendation.tags &&
                        recommendation.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recommendation.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      {recommendation.source && (
                        <span className="text-xs text-muted-foreground">
                          {recommendation.source}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        查看
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    {activeTab === "all" ? (
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      getRecommendationIcon(activeTab)
                    )}
                  </div>
                  <h3 className="text-lg font-medium">暂无推荐</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    随着您的交互和添加更多文档，我们将为您提供个性化的推荐
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="px-4 py-3 border-t mt-auto">
        <Button variant="outline" size="sm" className="w-full">
          <ThumbsUp className="h-4 w-4 mr-2" />
          提高推荐质量
        </Button>
      </div>
    </div>
  );
}
