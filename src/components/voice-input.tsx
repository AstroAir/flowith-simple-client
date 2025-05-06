"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Add type declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isDisabled?: boolean;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
}

export default function VoiceInput({
  onTranscript,
  isDisabled = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "zh-CN"; // Default to Chinese

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast("语音识别错误", {
        description: `错误: ${event.error}`,
      });
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResult) => result[0])
        .map((result) => result.transcript)
        .join("");

      // Only send final results
      if (event.results[0].isFinal) {
        onTranscript(transcript);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        setIsProcessing(true);
        recognitionRef.current?.start();
        toast("语音输入已开启", {
          description: "请开始说话...",
        });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast("无法启动语音识别", {
          description: "请检查浏览器权限设置",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
        disabled
        title="您的浏览器不支持语音识别"
      >
        <MicOff size={18} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "transition-all duration-200",
        isListening
          ? "text-red-500 dark:text-red-400 animate-pulse"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      )}
      onClick={toggleListening}
      disabled={isDisabled || isProcessing}
      title={isListening ? "点击停止语音输入" : "点击开始语音输入"}
    >
      {isProcessing ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isListening ? (
        <Mic size={18} className="text-red-500 dark:text-red-400" />
      ) : (
        <Mic size={18} />
      )}
    </Button>
  );
}
