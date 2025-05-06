"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface KeyboardSettingsProps {
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (enabled: boolean) => void;
}

export default function KeyboardSettings({
  keyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
}: KeyboardSettingsProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const defaultShortcuts = [
    {
      action: "创建新会话",
      shortcut: "Ctrl+N",
      customizable: true,
      current: "Ctrl+N",
    },
    {
      action: "发送消息",
      shortcut: "Ctrl+Enter",
      customizable: true,
      current: "Ctrl+Enter",
    },
    {
      action: "清空当前会话",
      shortcut: "Ctrl+Shift+C",
      customizable: true,
      current: "Ctrl+Shift+C",
    },
    {
      action: "切换侧边栏",
      shortcut: "Ctrl+B",
      customizable: true,
      current: "Ctrl+B",
    },
    {
      action: "打开设置",
      shortcut: "Ctrl+,",
      customizable: true,
      current: "Ctrl+,",
    },
    {
      action: "搜索",
      shortcut: "Ctrl+F",
      customizable: true,
      current: "Ctrl+F",
    },
    { action: "帮助", shortcut: "F1", customizable: false, current: "F1" },
  ];

  const [shortcuts, setShortcuts] = useState(defaultShortcuts);

  const resetShortcuts = () => {
    setShortcuts(defaultShortcuts);
  };

  const updateShortcut = (index: number, newShortcut: string) => {
    const newShortcuts = [...shortcuts];
    newShortcuts[index] = { ...newShortcuts[index], current: newShortcut };
    setShortcuts(newShortcuts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="keyboard-shortcuts-toggle" className="text-base">
            启用键盘快捷键
          </Label>
          <p className="text-sm text-muted-foreground">
            使用键盘快捷键提高操作效率
          </p>
        </div>
        <Switch
          id="keyboard-shortcuts-toggle"
          checked={keyboardShortcutsEnabled}
          onCheckedChange={setKeyboardShortcutsEnabled}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">快捷键列表</h3>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
              disabled={!keyboardShortcutsEnabled}
            >
              {isCustomizing ? "完成" : "自定义"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetShortcuts}
              disabled={!keyboardShortcutsEnabled || !isCustomizing}
            >
              重置默认
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <div className="grid grid-cols-2 gap-4 p-4 font-medium border-b">
            <div>操作</div>
            <div>快捷键</div>
          </div>
          <div className="divide-y">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 p-4 items-center"
              >
                <div>{shortcut.action}</div>
                <div>
                  {isCustomizing && shortcut.customizable ? (
                    <Input
                      value={shortcut.current}
                      onChange={(e) => updateShortcut(index, e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    <kbd className="px-2 py-1 bg-muted rounded text-sm">
                      {shortcut.current}
                    </kbd>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          提示：在自定义模式下，您可以点击快捷键并输入新的组合。使用
          Ctrl、Alt、Shift 等修饰键加上字母或数字。
        </p>
      </div>
    </div>
  );
}
