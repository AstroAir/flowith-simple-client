"use client";

import type React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="model-selector" className="text-sm font-medium">
        Model
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="model-selector" className="mt-1">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
          <SelectItem value="gpt-4">GPT-4</SelectItem>
          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
