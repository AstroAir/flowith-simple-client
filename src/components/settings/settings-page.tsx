"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import AppearanceSettings from "@/components/settings/appearance-settings";
import AccessibilitySettings from "@/components/settings/accessibility-settings";
import NotificationSettings from "@/components/settings/notification-settings";
import KeyboardSettings from "@/components/settings/keyboard-settings";
import AdvancedSettings from "@/components/settings/advanced-settings";

interface SettingsPageProps {
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (enabled: boolean) => void;
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  messageAlignment: "left" | "right";
  setMessageAlignment: (alignment: "left" | "right") => void;
}

export default function SettingsPage({
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
  autoSave,
  setAutoSave,
  messageAlignment,
  setMessageAlignment,
}: SettingsPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    animationsEnabled,
    setAnimationsEnabled,
  } = useTheme();

  const saveSettings = () => {
    setIsOpen(false);
    toast("设置已保存", {
      description: "您的偏好设置已成功应用",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="设置">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">设置</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="appearance"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="border-b px-6">
            <TabsList className="justify-start -mb-px">
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                外观
              </TabsTrigger>
              <TabsTrigger
                value="accessibility"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                无障碍
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                通知
              </TabsTrigger>
              <TabsTrigger
                value="keyboard"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                键盘
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:border-b-2 rounded-none border-primary"
              >
                高级
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="appearance" className="p-6 h-full">
              <AppearanceSettings
                theme={theme}
                setTheme={setTheme}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                fontSize={fontSize}
                setFontSize={setFontSize}
                animationsEnabled={animationsEnabled}
                setAnimationsEnabled={setAnimationsEnabled}
                messageAlignment={messageAlignment}
                setMessageAlignment={setMessageAlignment}
              />
            </TabsContent>

            <TabsContent value="accessibility" className="p-6 h-full">
              <AccessibilitySettings
                fontSize={fontSize}
                setFontSize={setFontSize}
                animationsEnabled={animationsEnabled}
                setAnimationsEnabled={setAnimationsEnabled}
              />
            </TabsContent>

            <TabsContent value="notifications" className="p-6 h-full">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="keyboard" className="p-6 h-full">
              <KeyboardSettings
                keyboardShortcutsEnabled={keyboardShortcutsEnabled}
                setKeyboardShortcutsEnabled={setKeyboardShortcutsEnabled}
              />
            </TabsContent>

            <TabsContent value="advanced" className="p-6 h-full">
              <AdvancedSettings autoSave={autoSave} setAutoSave={setAutoSave} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end p-6 pt-4 border-t">
          <Button onClick={saveSettings} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
