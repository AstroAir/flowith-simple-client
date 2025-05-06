"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Moon, Sun, Check } from "lucide-react";

interface AppearanceSettingsProps {
  theme: string;
  setTheme: (theme: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  messageAlignment: "left" | "right";
  setMessageAlignment: (alignment: "left" | "right") => void;
}

export default function AppearanceSettings({
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  fontSize,
  setFontSize,
  animationsEnabled,
  setAnimationsEnabled,
  messageAlignment,
  setMessageAlignment,
}: AppearanceSettingsProps) {
  const accentColors = [
    {
      name: "蓝色",
      value: "blue",
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
    },
    {
      name: "绿色",
      value: "green",
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
    },
    {
      name: "紫色",
      value: "purple",
      bg: "bg-purple-500",
      hover: "hover:bg-purple-600",
    },
    { name: "红色", value: "red", bg: "bg-red-500", hover: "hover:bg-red-600" },
    {
      name: "橙色",
      value: "orange",
      bg: "bg-orange-500",
      hover: "hover:bg-orange-600",
    },
    {
      name: "粉色",
      value: "pink",
      bg: "bg-pink-500",
      hover: "hover:bg-pink-600",
    },
    {
      name: "靛蓝",
      value: "indigo",
      bg: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
    },
    {
      name: "青色",
      value: "cyan",
      bg: "bg-cyan-500",
      hover: "hover:bg-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">主题</h3>
        <Tabs defaultValue={theme} onValueChange={setTheme} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="light" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              浅色
            </TabsTrigger>
            <TabsTrigger value="dark" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              深色
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              系统
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">强调色</h3>
        <div className="grid grid-cols-4 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              className={`h-12 rounded-md relative ${color.bg} ${color.hover} transition-all`}
              onClick={() => setAccentColor(color.value)}
              aria-label={`设置强调色为${color.name}`}
            >
              {accentColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-4">字体大小</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">较小</span>
              <span className="font-medium">{fontSize}px</span>
              <span className="text-sm">较大</span>
            </div>
            <Slider
              min={12}
              max={20}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              className="w-full"
            />
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-lg font-medium mb-4">消息对齐方式</h3>
          <RadioGroup
            value={messageAlignment}
            onValueChange={(value) =>
              setMessageAlignment(value as "left" | "right")
            }
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="left" id="align-left" />
              <Label htmlFor="align-left">左对齐（传统布局）</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="right" id="align-right" />
              <Label htmlFor="align-right">右对齐（聊天布局）</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="animations-toggle" className="text-base">
              启用动画效果
            </Label>
            <Switch
              id="animations-toggle"
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            控制界面过渡和动画效果。禁用可提高性能和减少视觉干扰。
          </p>
        </div>
      </div>
    </div>
  );
}
