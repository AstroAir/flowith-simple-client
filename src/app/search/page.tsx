"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  MessageSquare,
  Tag,
  Filter,
  Save,
  Clock,
  Trash2,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import { PageContainer, PageTitle, PageSection } from "@/components/layout/page-container";
import type { UploadedDocument } from "@/components/document-uploader";
import type { ConversationSession } from "@/lib/types";
import { format } from "date-fns";
import { debounce } from "@/lib/performance-utils";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    contentType: string[];
    dateRange: {
      from: string | null;
      to: string | null;
    };
    tags: string[];
    status: string[];
  };
  createdAt: number;
}

export default function AdvancedSearchPage() {
  const [documents, setDocuments] = useLocalStorage<UploadedDocument[]>(
    "ai-knowledge-documents",
    []
  );
  const [sessions, setSessions] = useLocalStorage<ConversationSession[]>(
    "ai-knowledge-sessions",
    []
  );
  const [documentTags, setDocumentTags] = useLocalStorage<
    Record<string, string[]>
  >("ai-knowledge-document-tags", {});
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>(
    "ai-knowledge-saved-searches",
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<UploadedDocument | ConversationSession>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newSearchName, setNewSearchName] = useState("");

  // Filters
  const [contentTypeFilter, setContentTypeFilter] = useState<string[]>([
    "documents",
    "sessions",
  ]);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: null,
    to: null,
  });
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [relevanceThreshold, setRelevanceThreshold] = useState([70]);

  const { accentColor, animationsEnabled } = useTheme();

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      Object.values(documentTags).reduce((acc, tags) => {
        return [...acc, ...tags];
      }, [] as string[])
    )
  ).sort();

  // Perform search when query or filters change
  useEffect(() => {
    if (!searchQuery.trim() && activeTab === "all") {
      setSearchResults([]);
      return;
    }

    const debouncedSearch = debounce(() => {
      performSearch(searchQuery);
    }, 300);

    debouncedSearch();

    return () => {
      // Clean up
    };
  }, [
    searchQuery,
    contentTypeFilter,
    dateRangeFilter,
    tagFilter,
    statusFilter,
    relevanceThreshold,
    activeTab,
  ]);

  const performSearch = async (query: string) => {
    setIsSearching(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let results: Array<UploadedDocument | ConversationSession> = [];

      // Filter by content type
      if (contentTypeFilter.includes("documents")) {
        results = [...results, ...documents];
      }

      if (contentTypeFilter.includes("sessions")) {
        results = [...results, ...sessions];
      }

      // Filter by query text
      if (query.trim()) {
        results = results.filter((item) => {
          if ("name" in item && typeof item.name === "string") {
            // Document
            return item.name.toLowerCase().includes(query.toLowerCase());
          } else if (
            "messages" in item &&
            Array.isArray(item.messages) &&
            "name" in item
          ) {
            // Session
            return (
              (item.name as string)
                .toLowerCase()
                .includes(query.toLowerCase()) ||
              item.messages.some((msg: { content: string }) =>
                msg.content.toLowerCase().includes(query.toLowerCase())
              )
            );
          }
          return false;
        });
      }

      // Filter by date range
      if (dateRangeFilter.from || dateRangeFilter.to) {
        results = results.filter((item) => {
          const itemDate = new Date(
            "timestamp" in item ? item.timestamp : item.updatedAt
          );

          if (dateRangeFilter.from && dateRangeFilter.to) {
            return (
              itemDate >= new Date(dateRangeFilter.from) &&
              itemDate <= new Date(dateRangeFilter.to)
            );
          } else if (dateRangeFilter.from) {
            return itemDate >= new Date(dateRangeFilter.from);
          } else if (dateRangeFilter.to) {
            return itemDate <= new Date(dateRangeFilter.to);
          }

          return true;
        });
      }

      // Filter by tags (documents only)
      if (tagFilter.length > 0) {
        results = results.filter((item) => {
          if ("id" in item && documentTags[item.id]) {
            return tagFilter.some((tag) => documentTags[item.id].includes(tag));
          }
          return false;
        });
      }

      // Filter by status (documents only)
      if (statusFilter.length > 0) {
        results = results.filter((item) => {
          if ("status" in item) {
            return statusFilter.includes(item.status);
          }
          return true;
        });
      }

      // Filter by tab
      if (activeTab === "documents") {
        results = results.filter((item) => "status" in item);
      } else if (activeTab === "sessions") {
        results = results.filter((item) => "messages" in item);
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed", {
        description: "An error occurred while searching. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const saveCurrentSearch = () => {
    if (!newSearchName.trim()) {
      toast("Name required", {
        description: "Please enter a name for your saved search.",
      });
      return;
    }

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName,
      query: searchQuery,
      filters: {
        contentType: contentTypeFilter,
        dateRange: dateRangeFilter,
        tags: tagFilter,
        status: statusFilter,
      },
      createdAt: Date.now(),
    };

    setSavedSearches([...savedSearches, newSavedSearch]);
    setNewSearchName("");

    toast("Search saved", {
      description: `Your search "${newSearchName}" has been saved.`,
    });
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query);
    setContentTypeFilter(search.filters.contentType);
    setDateRangeFilter(search.filters.dateRange);
    setTagFilter(search.filters.tags);
    setStatusFilter(search.filters.status);

    toast("Search loaded", {
      description: `Loaded saved search "${search.name}".`,
    });
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(savedSearches.filter((search) => search.id !== id));

    toast("Search deleted", {
      description: "The saved search has been deleted.",
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setContentTypeFilter(["documents", "sessions"]);
    setDateRangeFilter({
      from: null,
      to: null,
    });
    setTagFilter([]);
    setStatusFilter([]);
    setRelevanceThreshold([70]);
    setSearchResults([]);
  };

  return (
    <PageContainer>
      <PageTitle 
        title="高级搜索" 
        description="在文档和会话中搜索信息"
        actions={
          <Button variant="outline" onClick={clearSearch}>
            清除
          </Button>
        }
      />

      <PageSection noPadding>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search Filters */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                搜索过滤器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">内容类型</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="documents"
                      checked={contentTypeFilter.includes("documents")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setContentTypeFilter([
                            ...contentTypeFilter,
                            "documents",
                          ]);
                        } else {
                          setContentTypeFilter(
                            contentTypeFilter.filter(
                              (type) => type !== "documents"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="documents" className="text-sm">
                      文档
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sessions"
                      checked={contentTypeFilter.includes("sessions")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setContentTypeFilter([
                            ...contentTypeFilter,
                            "sessions",
                          ]);
                        } else {
                          setContentTypeFilter(
                            contentTypeFilter.filter(
                              (type) => type !== "sessions"
                            )
                          );
                        }
                      }}
                    />
                    <Label htmlFor="sessions" className="text-sm">
                      会话
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">日期范围</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="from-date" className="text-xs">
                      从
                    </Label>
                    <Input
                      id="from-date"
                      type="date"
                      value={dateRangeFilter.from || ""}
                      onChange={(e) =>
                        setDateRangeFilter({
                          ...dateRangeFilter,
                          from: e.target.value || null,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="to-date" className="text-xs">
                      至
                    </Label>
                    <Input
                      id="to-date"
                      type="date"
                      value={dateRangeFilter.to || ""}
                      onChange={(e) =>
                        setDateRangeFilter({
                          ...dateRangeFilter,
                          to: e.target.value || null,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">标签</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-2">
                    {allTags.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        没有可用标签
                      </p>
                    ) : (
                      allTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={tagFilter.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTagFilter([...tagFilter, tag]);
                              } else {
                                setTagFilter(
                                  tagFilter.filter((t) => t !== tag)
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="text-sm">
                            {tag}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">文档状态</Label>
                <div className="space-y-2">
                  {[
                    { id: "ready", label: "就绪" },
                    { id: "processing", label: "处理中" },
                    { id: "uploading", label: "上传中" },
                    { id: "error", label: "错误" }
                  ].map(
                    (status) => (
                      <div key={status.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.id}`}
                          checked={statusFilter.includes(status.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilter([...statusFilter, status.id]);
                            } else {
                              setStatusFilter(
                                statusFilter.filter((s) => s !== status.id)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`status-${status.id}`}
                          className="text-sm capitalize"
                        >
                          {status.label}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    相关性阈值
                  </Label>
                  <span className="text-xs">{relevanceThreshold}%</span>
                </div>
                <Slider
                  value={relevanceThreshold}
                  onValueChange={setRelevanceThreshold}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">保存搜索</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="搜索名称"
                    value={newSearchName}
                    onChange={(e) => setNewSearchName(e.target.value)}
                    className="h-9"
                  />
                  <Button
                    size="sm"
                    onClick={saveCurrentSearch}
                    disabled={!newSearchName.trim()}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    保存
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索文档和会话..."
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
                    <TabsTrigger value="all">所有结果</TabsTrigger>
                    <TabsTrigger value="documents">文档</TabsTrigger>
                    <TabsTrigger value="sessions">会话</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between text-sm text-muted-foreground">
                <div>
                  {isSearching
                    ? "搜索中..."
                    : `找到 ${searchResults.length} 个结果`}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    导出
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    分享
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    已保存的搜索
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1">
                      {savedSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => loadSavedSearch(search)}
                        >
                          <div className="flex items-center">
                            <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">
                                {search.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-md">
                                {search.query || "(无查询)"} •{" "}
                                {format(search.createdAt, "yyyy年M月d日")}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSavedSearch(search.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {isSearching ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">未找到结果</h3>
                <p className="text-muted-foreground max-w-md">
                  尝试调整您的搜索查询或过滤器，以找到您要查找的内容。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <AnimatedContainer
                    key={
                      "id" in result
                        ? result.id
                        : "messages" in result
                        ? result.id
                        : Date.now().toString()
                    }
                    type="fade"
                  >
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 mr-2">
                            <CardTitle className="text-lg flex items-center">
                              {"status" in result ? (
                                <FileText className="h-4 w-4 mr-2" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-2" />
                              )}
                              {result.name}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(
                                new Date(
                                  "timestamp" in result
                                    ? result.timestamp
                                    : result.updatedAt
                                ),
                                "yyyy年M月d日"
                              )}
                              {"size" in result && (
                                <>
                                  <span className="mx-2">•</span>
                                  {result.size} 字节
                                </>
                              )}
                            </CardDescription>
                          </div>
                          {"status" in result ? (
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                result.status === "ready"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                  : result.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                  : result.status === "error"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              }`}
                            >
                              {result.status === "ready" 
                                ? "就绪" 
                                : result.status === "processing" 
                                  ? "处理中"
                                  : result.status === "uploading"
                                    ? "上传中"
                                    : "错误"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                            >
                              {result.messages.length} 条消息
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {"id" in result &&
                        documentTags[result.id] &&
                        documentTags[result.id].length > 0 ? (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {documentTags[result.id].map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : "messages" in result &&
                          result.messages.length > 0 ? (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {
                              result.messages[result.messages.length - 1]
                                .content
                            }
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            无附加信息
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end">
                        <Button variant="outline" size="sm">
                          查看详情
                        </Button>
                      </CardFooter>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageSection>
    </PageContainer>
  );
}
