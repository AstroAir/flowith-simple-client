"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPosition, setNotificationPosition] = useState("top-right");
  const [notificationDuration, setNotificationDuration] = useState(5);
  const [notificationLevel, setNotificationLevel] = useState("all");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">通知设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-toggle" className="text-base">
                启用通知
              </Label>
              <p className="text-sm text-muted-foreground">接收应用内通知</p>
            </div>
            <Switch
              id="notifications-toggle"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-toggle" className="text-base">
                通知声音
              </Label>
              <p className="text-sm text-muted-foreground">
                为通知播放声音提示
              </p>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">通知显示</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-position">通知位置</Label>
            <Select
              value={notificationPosition}
              onValueChange={setNotificationPosition}
            >
              <SelectTrigger id="notification-position">
                <SelectValue placeholder="选择通知位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right">右上角</SelectItem>
                <SelectItem value="top-left">左上角</SelectItem>
                <SelectItem value="bottom-right">右下角</SelectItem>
                <SelectItem value="bottom-left">左下角</SelectItem>
                <SelectItem value="top-center">顶部居中</SelectItem>
                <SelectItem value="bottom-center">底部居中</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notification-duration">通知持续时间</Label>
              <span>{notificationDuration} 秒</span>
            </div>
            <Slider
              id="notification-duration"
              min={1}
              max={10}
              step={1}
              value={[notificationDuration]}
              onValueChange={(value) => setNotificationDuration(value[0])}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">通知级别</h3>
        <RadioGroup
          value={notificationLevel}
          onValueChange={setNotificationLevel}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all-notifications" />
            <Label htmlFor="all-notifications">所有通知</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="important" id="important-notifications" />
            <Label htmlFor="important-notifications">仅重要通知</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="no-notifications" />
            <Label htmlFor="no-notifications">无通知</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
