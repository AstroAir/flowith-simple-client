"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  X,
  CalendarIcon,
  Tag,
  Save,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { format } from "date-fns";
import type { UploadedDocument } from "@/components/document-uploader";

interface AdvancedSearchProps {
  documents: UploadedDocument[];
  documentTags: Record<string, string[]>;
  onFilteredDocuments: (documents: UploadedDocument[]) => void;
}

export interface SearchFilters {
  query: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  status: string[];
  tags: string[];
  savedSearch: string | null;
}

export default function AdvancedSearch({
  documents,
  documentTags,
  onFilteredDocuments,
}: AdvancedSearchProps) {
  const { accentColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    status: [],
    tags: [],
    savedSearch: null,
  });
  const [savedSearches, setSavedSearches] = useLocalStorage<
    Record<string, SearchFilters>
  >("ai-knowledge-saved-searches", {});
  const [newSearchName, setNewSearchName] = useState("");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Extract all unique tags from documents
  const allTags = Array.from(
    new Set(
      Object.values(documentTags).reduce((acc, tags) => {
        return [...acc, ...tags];
      }, [] as string[])
    )
  ).sort();

  // Apply filters
  useEffect(() => {
    let filtered = [...documents];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((doc) => filters.status.includes(doc.status));
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.timestamp);

        if (filters.dateRange.from && filters.dateRange.to) {
          return (
            docDate >= filters.dateRange.from && docDate <= filters.dateRange.to
          );
        } else if (filters.dateRange.from) {
          return docDate >= filters.dateRange.from;
        } else if (filters.dateRange.to) {
          return docDate <= filters.dateRange.to;
        }

        return true;
      });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((doc) => {
        const docTags = documentTags[doc.id] || [];
        return filters.tags.some((tag) => docTags.includes(tag));
      });
    }

    onFilteredDocuments(filtered);

    // Count active filters
    let count = 0;
    if (filters.query) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.tags.length > 0) count++;
    setActiveFiltersCount(count);
  }, [filters, documents, documentTags, onFilteredDocuments]);

  const clearFilters = () => {
    setFilters({
      query: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      status: [],
      tags: [],
      savedSearch: null,
    });
  };

  const saveCurrentSearch = () => {
    if (!newSearchName.trim()) return;

    setSavedSearches({
      ...savedSearches,
      [newSearchName]: { ...filters },
    });

    setNewSearchName("");
  };

  const loadSavedSearch = (name: string) => {
    if (savedSearches[name]) {
      setFilters(savedSearches[name]);
      setFilters((prev) => ({
        ...prev,
        savedSearch: name,
      }));
    }
  };

  const deleteSavedSearch = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const newSavedSearches = { ...savedSearches };
    delete newSavedSearches[name];
    setSavedSearches(newSavedSearches);

    if (filters.savedSearch === name) {
      setFilters((prev) => ({
        ...prev,
        savedSearch: null,
      }));
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索文档..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-8 pr-8"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
              onClick={() => setFilters({ ...filters, query: "" })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              data-active={activeFiltersCount > 0}
            >
              <Filter className="h-4 w-4" />
              <span>筛选</span>
              {activeFiltersCount > 0 && (
                <Badge
                  className={`ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-${accentColor}-500 text-white`}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="grid gap-4">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">高级筛选</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 px-2 text-xs"
                  >
                    清除全部
                  </Button>
                </div>
              </div>

              <Separator />

              <ScrollArea className="h-[min(400px,60vh)] px-4">
                <div className="space-y-4">
                  {/* Status filter */}
                  <div>
                    <h5 className="mb-2 text-sm font-medium">文档状态</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {["uploading", "processing", "ready", "error"].map(
                        (status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`status-${status}`}
                              checked={filters.status.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({
                                    ...filters,
                                    status: [...filters.status, status],
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    status: filters.status.filter(
                                      (s) => s !== status
                                    ),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`status-${status}`}
                              className="text-sm capitalize"
                            >
                              {status === "uploading"
                                ? "上传中"
                                : status === "processing"
                                ? "处理中"
                                : status === "ready"
                                ? "就绪"
                                : "错误"}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Date range filter */}
                  <div>
                    <h5 className="mb-2 text-sm font-medium">上传日期</h5>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="date-from" className="text-xs">
                            从
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-from"
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filters.dateRange.from &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.from ? (
                                  format(filters.dateRange.from, "yyyy-MM-dd")
                                ) : (
                                  <span>选择日期</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={filters.dateRange.from}
                                onSelect={(date) =>
                                  setFilters({
                                    ...filters,
                                    dateRange: {
                                      ...filters.dateRange,
                                      from: date,
                                    },
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="date-to" className="text-xs">
                            至
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-to"
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !filters.dateRange.to &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.to ? (
                                  format(filters.dateRange.to, "yyyy-MM-dd")
                                ) : (
                                  <span>选择日期</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={filters.dateRange.to}
                                onSelect={(date) =>
                                  setFilters({
                                    ...filters,
                                    dateRange: {
                                      ...filters.dateRange,
                                      to: date,
                                    },
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      {(filters.dateRange.from || filters.dateRange.to) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            setFilters({
                              ...filters,
                              dateRange: {
                                from: undefined,
                                to: undefined,
                              },
                            })
                          }
                        >
                          清除日期
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tags filter */}
                  {allTags.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium">标签</h5>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={
                              filters.tags.includes(tag) ? "default" : "outline"
                            }
                            className={cn(
                              "cursor-pointer",
                              filters.tags.includes(tag)
                                ? `bg-${accentColor}-500 hover:bg-${accentColor}-600`
                                : ""
                            )}
                            onClick={() => {
                              if (filters.tags.includes(tag)) {
                                setFilters({
                                  ...filters,
                                  tags: filters.tags.filter((t) => t !== tag),
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  tags: [...filters.tags, tag],
                                });
                              }
                            }}
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Saved searches */}
                  <div>
                    <h5 className="mb-2 text-sm font-medium">保存的搜索</h5>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="输入搜索名称"
                          value={newSearchName}
                          onChange={(e) => setNewSearchName(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={saveCurrentSearch}
                          disabled={
                            !newSearchName.trim() || activeFiltersCount === 0
                          }
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          保存
                        </Button>
                      </div>

                      {Object.keys(savedSearches).length > 0 && (
                        <div className="space-y-1 mt-2">
                          {Object.keys(savedSearches).map((name) => (
                            <div
                              key={name}
                              className={cn(
                                "flex items-center justify-between px-2 py-1 rounded-md text-sm",
                                filters.savedSearch === name
                                  ? `bg-${accentColor}-100 dark:bg-${accentColor}-900/20`
                                  : "hover:bg-accent"
                              )}
                              onClick={() => loadSavedSearch(name)}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                <span>{name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => deleteSavedSearch(name, e)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>关键词: {filters.query}</span>
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters({ ...filters, query: "" })}
              />
            </Badge>
          )}

          {filters.status.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>状态: {filters.status.length}个已选</span>
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters({ ...filters, status: [] })}
              />
            </Badge>
          )}

          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>
                日期:{" "}
                {filters.dateRange.from
                  ? format(filters.dateRange.from, "MM/dd")
                  : "起始"}{" "}
                -{" "}
                {filters.dateRange.to
                  ? format(filters.dateRange.to, "MM/dd")
                  : "结束"}
              </span>
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() =>
                  setFilters({
                    ...filters,
                    dateRange: { from: undefined, to: undefined },
                  })
                }
              />
            </Badge>
          )}

          {filters.tags.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>标签: {filters.tags.length}个已选</span>
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters({ ...filters, tags: [] })}
              />
            </Badge>
          )}

          {filters.savedSearch && (
            <Badge
              variant="secondary"
              className={`flex items-center gap-1 bg-${accentColor}-100 dark:bg-${accentColor}-900/20`}
            >
              <span>已保存: {filters.savedSearch}</span>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
