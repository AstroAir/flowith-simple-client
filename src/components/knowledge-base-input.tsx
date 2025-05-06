"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeBaseInputProps {
  kbList: string[];
  onChange: (kbList: string[]) => void;
}

const KnowledgeBaseInput: React.FC<KnowledgeBaseInputProps> = ({
  kbList,
  onChange,
}) => {
  const [newKbId, setNewKbId] = useState("");

  const addKnowledgeBase = () => {
    if (newKbId.trim() && !kbList.includes(newKbId.trim())) {
      onChange([...kbList, newKbId.trim()]);
      setNewKbId("");
    }
  };

  const removeKnowledgeBase = (index: number) => {
    const updatedList = [...kbList];
    updatedList.splice(index, 1);
    onChange(updatedList);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKnowledgeBase();
    }
  };

  return (
    <div className="mt-4">
      <Label htmlFor="kb-id" className="text-sm font-medium">
        Knowledge Base IDs
      </Label>
      <div className="relative mt-1">
        <Input
          id="kb-id"
          type="text"
          placeholder="Enter knowledge base ID"
          value={newKbId}
          onChange={(e) => setNewKbId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={addKnowledgeBase}
          disabled={!newKbId.trim()}
        >
          <Plus size={16} />
        </Button>
      </div>

      {kbList.length > 0 && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
          {kbList.map((kb, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-2 text-sm rounded-md",
                "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <span className="truncate mr-2">{kb}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-slate-500 hover:text-red-500"
                onClick={() => removeKnowledgeBase(index)}
              >
                <Trash size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Add at least one knowledge base ID to enable searching.
      </p>
    </div>
  );
};

export default KnowledgeBaseInput;
