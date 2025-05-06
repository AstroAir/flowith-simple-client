"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  systemTheme: string | undefined;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: undefined,
  systemTheme: undefined,
  accentColor: "blue",
  setAccentColor: () => null,
  fontSize: 14,
  setFontSize: () => null,
  animationsEnabled: true,
  setAnimationsEnabled: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<string | undefined>(
    undefined
  );
  const [systemTheme, setSystemTheme] = useState<string | undefined>(undefined);
  const [accentColor, setAccentColorState] = useState<string>("blue");
  const [fontSize, setFontSizeState] = useState<number>(14);
  const [animationsEnabled, setAnimationsEnabledState] =
    useState<boolean>(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("ai-knowledge-theme");
    const storedAccentColor = localStorage.getItem("ai-knowledge-accent-color");
    const storedFontSize = localStorage.getItem("ai-knowledge-font-size");
    const storedAnimationsEnabled = localStorage.getItem(
      "ai-knowledge-animations-enabled"
    );

    if (storedTheme) setThemeState(storedTheme);
    if (storedAccentColor) setAccentColorState(storedAccentColor);
    if (storedFontSize) setFontSizeState(Number.parseInt(storedFontSize, 10));
    if (storedAnimationsEnabled)
      setAnimationsEnabledState(storedAnimationsEnabled === "true");
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("ai-knowledge-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("ai-knowledge-accent-color", accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem("ai-knowledge-font-size", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(
      "ai-knowledge-animations-enabled",
      animationsEnabled.toString()
    );
  }, [animationsEnabled]);

  // Detect system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Resolve theme based on system preference
  useEffect(() => {
    if (theme === "system" && systemTheme) {
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, systemTheme]);

  // Apply theme to document
  useEffect(() => {
    if (resolvedTheme) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  // Apply accent color to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", accentColor);
    document.documentElement.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  // Apply font size to document
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--base-font-size",
      `${fontSize}px`
    );
  }, [fontSize]);

  // Apply animations setting
  useEffect(() => {
    if (animationsEnabled) {
      document.documentElement.classList.remove("reduce-motion");
    } else {
      document.documentElement.classList.add("reduce-motion");
    }
  }, [animationsEnabled]);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const setAccentColor = (newColor: string) => {
    setAccentColorState(newColor);
  };

  const setFontSize = (newSize: number) => {
    setFontSizeState(newSize);
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled);
  };

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        systemTheme,
        accentColor,
        setAccentColor,
        fontSize,
        setFontSize,
        animationsEnabled,
        setAnimationsEnabled,
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem
        value={{
          light: "light",
          dark: "dark",
          system: "system",
        }}
      >
        {children}
      </NextThemesProvider>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
