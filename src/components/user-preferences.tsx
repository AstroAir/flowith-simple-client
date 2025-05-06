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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Check,
  Monitor,
  Palette,
  Type,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";

interface UserPreferencesProps {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (enabled: boolean) => void;
  messageAlignment: "left" | "right";
  setMessageAlignment: (alignment: "left" | "right") => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export default function UserPreferences({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  animationsEnabled,
  setAnimationsEnabled,
  autoSave,
  setAutoSave,
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
  messageAlignment,
  setMessageAlignment,
  accentColor,
  setAccentColor,
}: UserPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const savePreferences = () => {
    setIsOpen(false);
    toast("偏好设置已保存", {
      description: "您的偏好设置已成功保存",
    });
  };

  const accentColors = [
    { name: "蓝色", value: "blue" },
    { name: "绿色", value: "green" },
    { name: "紫色", value: "purple" },
    { name: "红色", value: "red" },
    { name: "橙色", value: "orange" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="用户偏好设置">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>用户偏好设置</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              外观
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center">
              <Type className="h-4 w-4 mr-2" />
              文本
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center">
              <Keyboard className="h-4 w-4 mr-2" />
              行为
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label>主题</Label>
              <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">浅色</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">深色</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system">
                    <Monitor className="h-4 w-4 inline mr-1" />
                    系统
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>强调色</Label>
              <div className="grid grid-cols-5 gap-2">
                {accentColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    className={`h-10 w-full relative bg-${color.value}-100 hover:bg-${color.value}-200 border-${color.value}-200 dark:bg-${color.value}-900/20 dark:hover:bg-${color.value}-900/30 dark:border-${color.value}-900/30`}
                    onClick={() => setAccentColor(color.value)}
                  >
                    {accentColor === color.value && (
                      <Check className="h-4 w-4 absolute" />
                    )}
                    <span className="sr-only">{color.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animations-toggle">启用动画效果</Label>
                <Switch
                  id="animations-toggle"
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                控制界面过渡和动画效果。禁用可提高性能。
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">字体大小: {fontSize}px</Label>
              </div>
              <Slider
                id="font-size"
                min={12}
                max={20}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>消息对齐方式</Label>
              <RadioGroup
                value={messageAlignment}
                onValueChange={setMessageAlignment as any}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="align-left" />
                  <Label htmlFor="align-left">左对齐</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="align-right" />
                  <Label htmlFor="align-right">右对齐</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="autosave-toggle">自动保存会话</Label>
                <Switch
                  id="autosave-toggle"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                自动保存会话内容，防止意外关闭页面导致数据丢失。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="shortcuts-toggle">启用键盘快捷键</Label>
                <Switch
                  id="shortcuts-toggle"
                  checked={keyboardShortcutsEnabled}
                  onCheckedChange={setKeyboardShortcutsEnabled}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                启用键盘快捷键以提高操作效率。
              </p>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">可用的键盘快捷键:</h4>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>创建新会话</span>
                  <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    Ctrl + N
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>发送消息</span>
                  <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    Ctrl + Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>清空当前会话</span>
                  <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    Ctrl + Shift + C
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>切换侧边栏</span>
                  <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    Ctrl + B
                  </kbd>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={savePreferences}>保存设置</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
