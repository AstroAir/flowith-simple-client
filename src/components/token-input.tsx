"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ value, onChange }) => {
  const [showToken, setShowToken] = useState(false);

  return (
    <div>
      <Label htmlFor="api-token" className="text-sm font-medium">
        API Token
      </Label>
      <div className="relative mt-1">
        <Input
          id="api-token"
          type={showToken ? "text" : "password"}
          placeholder="Enter your API token"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => setShowToken(!showToken)}
        >
          {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Your API token is required for authentication. It will not be stored
        server-side.
      </p>
    </div>
  );
};

export default TokenInput;
