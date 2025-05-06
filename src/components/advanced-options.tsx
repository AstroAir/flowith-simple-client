"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvancedOptionsProps {
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  useHistory: boolean;
  setUseHistory: (value: boolean) => void;
  responseFormat: string;
  setResponseFormat: (value: string) => void;
}

export default function AdvancedOptions({
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  useHistory,
  setUseHistory,
  responseFormat,
  setResponseFormat,
}: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-between w-full p-2"
        >
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            <span>高级选项</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-2 px-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">温度: {temperature.toFixed(1)}</Label>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={2}
            step={0.1}
            value={[temperature]}
            onValueChange={(value) => setTemperature(value[0])}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            较低的值使响应更确定，较高的值使响应更随机创意
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-tokens">最大令牌数: {maxTokens}</Label>
          </div>
          <Slider
            id="max-tokens"
            min={100}
            max={4000}
            step={100}
            value={[maxTokens]}
            onValueChange={(value) => setMaxTokens(value[0])}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            限制响应的最大长度
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="use-history"
            checked={useHistory}
            onCheckedChange={setUseHistory}
          />
          <Label htmlFor="use-history">使用对话历史</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-format">响应格式</Label>
          <Select value={responseFormat} onValueChange={setResponseFormat}>
            <SelectTrigger id="response-format">
              <SelectValue placeholder="选择响应格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">纯文本</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
