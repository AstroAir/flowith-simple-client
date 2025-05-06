"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Plus, Menu, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

interface MobileBottomNavProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenDocuments: () => void;
  onOpenSidebar: () => void;
  onGoHome: () => void;
  currentTab: string;
}

export default function MobileBottomNav({
  onNewChat,
  onOpenSettings,
  onOpenDocuments,
  onOpenSidebar,
  onGoHome,
  currentTab,
}: MobileBottomNavProps) {
  const [activeTab, setActiveTab] = useState<string>(currentTab || "home");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isMobile = useIsMobile();
  const { accentColor } = useTheme();

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!isMobile) {
    return null;
  }

  const getTabColor = (tab: string) => {
    return activeTab === tab ? `text-${accentColor}-500` : "text-slate-500";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 py-2 px-4 z-50 shadow-lg"
        >
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center justify-center h-14 w-14"
              onClick={() => {
                onGoHome();
                setActiveTab("home");
              }}
            >
              <Home className={cn("h-5 w-5", getTabColor("home"))} />
              <span className={cn("text-xs mt-1", getTabColor("home"))}>
                首页
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center justify-center h-14 w-14"
              onClick={() => {
                onOpenSidebar();
                setActiveTab("menu");
              }}
            >
              <Menu className={cn("h-5 w-5", getTabColor("menu"))} />
              <span className={cn("text-xs mt-1", getTabColor("menu"))}>
                菜单
              </span>
            </Button>

            <div className="relative flex items-center justify-center">
              <div
                className={`absolute -top-5 h-14 w-14 rounded-full bg-${accentColor}-500 flex items-center justify-center shadow-lg`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full text-white hover:bg-transparent"
                  onClick={() => {
                    onNewChat();
                    setActiveTab("chat");
                  }}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <div className="h-10 w-10"></div> {/* Spacer */}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center justify-center h-14 w-14"
              onClick={() => {
                onOpenDocuments();
                setActiveTab("documents");
              }}
            >
              <FileText className={cn("h-5 w-5", getTabColor("documents"))} />
              <span className={cn("text-xs mt-1", getTabColor("documents"))}>
                文档
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center justify-center h-14 w-14"
              onClick={() => {
                onOpenSettings();
                setActiveTab("settings");
              }}
            >
              <Settings className={cn("h-5 w-5", getTabColor("settings"))} />
              <span className={cn("text-xs mt-1", getTabColor("settings"))}>
                设置
              </span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
