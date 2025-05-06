"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Database,
  Plus,
  Search,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/components/theme-provider";
import AnimatedContainer from "@/components/ui/animated-container";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  size: number;
  lastUpdated: string;
  status: "active" | "indexing" | "error";
  provider: "openai" | "azure" | "custom";
  indexProgress?: number;
}

export default function DatabasePage() {
  const [kbList, setKbList] = useLocalStorage<string[]>(
    "ai-knowledge-kb-list",
    []
  );
  const [knowledgeBases, setKnowledgeBases] = useLocalStorage<KnowledgeBase[]>(
    "ai-knowledge-bases",
    [
      {
        id: "kb1",
        name: "Main Knowledge Base",
        description: "Primary knowledge base for all documents",
        documentCount: 128,
        size: 256000000,
        lastUpdated: new Date().toISOString(),
        status: "active",
        provider: "openai",
      },
      {
        id: "kb2",
        name: "Research Papers",
        description: "Collection of research papers and academic documents",
        documentCount: 45,
        size: 120000000,
        lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: "active",
        provider: "azure",
      },
      {
        id: "kb3",
        name: "Technical Documentation",
        description: "Technical guides and API documentation",
        documentCount: 67,
        size: 180000000,
        lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString(),
        status: "indexing",
        provider: "openai",
        indexProgress: 65,
      },
    ]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { accentColor, animationsEnabled } = useTheme();

  // Filter knowledge bases based on search query and active tab
  const filteredKBs = knowledgeBases.filter((kb) => {
    // Filter by search query
    if (
      searchQuery &&
      !kb.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !kb.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by tab
    if (activeTab === "active" && kb.status !== "active") {
      return false;
    } else if (activeTab === "indexing" && kb.status !== "indexing") {
      return false;
    } else if (activeTab === "error" && kb.status !== "error") {
      return false;
    }

    return true;
  });

  const handleDeleteKB = (id: string) => {
    const kbToDelete = knowledgeBases.find((kb) => kb.id === id);

    setKnowledgeBases(knowledgeBases.filter((kb) => kb.id !== id));
    setKbList(kbList.filter((kbId) => kbId !== id));

    toast("Knowledge Base deleted", {
      description: kbToDelete
        ? `${kbToDelete.name} has been deleted`
        : "Knowledge Base has been deleted",
    });
  };

  const handleRefreshKB = (id: string) => {
    const kb = knowledgeBases.find((kb) => kb.id === id);

    if (kb) {
      setKnowledgeBases(
        knowledgeBases.map((kb) =>
          kb.id === id
            ? {
                ...kb,
                status: "indexing",
                indexProgress: 0,
                lastUpdated: new Date().toISOString(),
              }
            : kb
        )
      );

      // Simulate indexing progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          setKnowledgeBases(
            knowledgeBases.map((kb) =>
              kb.id === id
                ? {
                    ...kb,
                    status: "active",
                    indexProgress: undefined,
                    lastUpdated: new Date().toISOString(),
                  }
                : kb
            )
          );

          toast("Indexing complete", {
            description: `${kb.name} has been successfully indexed`,
          });
        } else {
          setKnowledgeBases(
            knowledgeBases.map((kb) =>
              kb.id === id
                ? {
                    ...kb,
                    indexProgress: Math.round(progress),
                  }
                : kb
            )
          );
        }
      }, 500);
    }
  };

  const addToKbList = (id: string) => {
    if (!kbList.includes(id)) {
      setKbList([...kbList, id]);

      toast("Knowledge Base added", {
        description: "Knowledge Base has been added to your active list",
      });
    }
  };

  const removeFromKbList = (id: string) => {
    setKbList(kbList.filter((kbId) => kbId !== id));

    toast("Knowledge Base removed", {
      description: "Knowledge Base has been removed from your active list",
    });
  };

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
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Knowledge Base Management
          </h1>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Knowledge Base
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Knowledge Bases</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search knowledge bases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[250px]"
                  />
                </div>
              </div>
            </div>
            <CardDescription>
              Manage your knowledge bases and their settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="indexing">Indexing</TabsTrigger>
                <TabsTrigger value="error">Error</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
          <CardFooter className="pt-0 text-sm text-muted-foreground">
            {filteredKBs.length} knowledge bases found
          </CardFooter>
        </Card>

        {filteredKBs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">
              No knowledge bases found
            </h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "Try adjusting your search query to find what you're looking for."
                : "Create a new knowledge base to get started."}
            </p>
            <Button className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Knowledge Base
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKBs.map((kb) => (
              <AnimatedContainer key={kb.id} type="fade">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-2">
                        <CardTitle className="text-lg flex items-center">
                          <Database className="h-4 w-4 mr-2" />
                          {kb.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {kb.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          kb.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : kb.status === "indexing"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {kb.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Documents:
                        </span>{" "}
                        <span className="font-medium">{kb.documentCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>{" "}
                        <span className="font-medium">
                          {formatFileSize(kb.size)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Provider:</span>{" "}
                        <span className="font-medium capitalize">
                          {kb.provider}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>{" "}
                        <span className="font-medium">
                          {format(new Date(kb.lastUpdated), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {kb.status === "indexing" &&
                      kb.indexProgress !== undefined && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Indexing Progress</span>
                            <span>{kb.indexProgress}%</span>
                          </div>
                          <Progress value={kb.indexProgress} className="h-1" />
                        </div>
                      )}

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`kb-active-${kb.id}`}
                          checked={kbList.includes(kb.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addToKbList(kb.id);
                            } else {
                              removeFromKbList(kb.id);
                            }
                          }}
                          disabled={kb.status !== "active"}
                        />
                        <Label
                          htmlFor={`kb-active-${kb.id}`}
                          className="text-sm"
                        >
                          Use in queries
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRefreshKB(kb.id)}
                          disabled={kb.status === "indexing"}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in Provider
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => handleDeleteKB(kb.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
