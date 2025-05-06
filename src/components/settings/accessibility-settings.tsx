"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface AccessibilitySettingsProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
}

export default function AccessibilitySettings({
  fontSize,
  setFontSize,
  animationsEnabled,
  setAnimationsEnabled,
}: AccessibilitySettingsProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(true);
  const [fontFamily, setFontFamily] = useState("system");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">可读性</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size-slider">字体大小</Label>
              <span className="font-medium">{fontSize}px</span>
            </div>
            <Slider
              id="font-size-slider"
              min={12}
              max={24}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
            />
            <p className="text-sm text-muted-foreground">
              调整应用中文本的大小
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">字体家族</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger id="font-family">
                <SelectValue placeholder="选择字体" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">系统默认</SelectItem>
                <SelectItem value="sans">无衬线字体</SelectItem>
                <SelectItem value="serif">衬线字体</SelectItem>
                <SelectItem value="mono">等宽字体</SelectItem>
                <SelectItem value="dyslexic">阅读障碍友好字体</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              选择更适合您阅读的字体
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">视觉辅助</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast" className="text-base">
                高对比度模式
              </Label>
              <p className="text-sm text-muted-foreground">
                增强文本和背景的对比度
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations-toggle" className="text-base">
                减少动画
              </Label>
              <p className="text-sm text-muted-foreground">
                最小化或禁用界面动画
              </p>
            </div>
            <Switch
              id="animations-toggle"
              checked={!animationsEnabled}
              onCheckedChange={(checked) => setAnimationsEnabled(!checked)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">辅助技术</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="screen-reader" className="text-base">
                屏幕阅读器优化
              </Label>
              <p className="text-sm text-muted-foreground">
                改善与屏幕阅读器的兼容性
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={screenReader}
              onCheckedChange={setScreenReader}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="keyboard-navigation" className="text-base">
                键盘导航
              </Label>
              <p className="text-sm text-muted-foreground">
                启用完整的键盘导航支持
              </p>
            </div>
            <Switch
              id="keyboard-navigation"
              checked={keyboardNavigation}
              onCheckedChange={setKeyboardNavigation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
