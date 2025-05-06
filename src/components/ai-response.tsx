import type React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface AIResponseProps {
  content: string;
  className?: string;
}

const AIResponse: React.FC<AIResponseProps> = ({ content, className }) => {
  return (
    <Card
      className={cn(
        "p-4 mb-4 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30",
        className
      )}
    >
      <div className="flex items-center mb-2">
        <MessageSquare
          size={16}
          className="mr-2 text-green-600 dark:text-green-400"
        />
        <span className="text-xs font-medium uppercase text-green-700 dark:text-green-400">
          AI Response
        </span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </Card>
  );
};

export default AIResponse;
