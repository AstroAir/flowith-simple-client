"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import AnimatedContainer from "@/components/ui/animated-container";

interface PageTitleProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageTitle({ title, description, actions }: PageTitleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
  noPadding = false,
}: PageContainerProps) {
  const isMobile = useIsMobile();

  return (
    <AnimatedContainer
      type="fade"
      className={cn("w-full", !noPadding && "space-y-6", className)}
    >
      {children}
    </AnimatedContainer>
  );
}

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
  noPadding?: boolean;
  animation?: "fade" | "scale" | "slide" | "none";
  delay?: number;
}

export function PageSection({
  children,
  title,
  description,
  className,
  actions,
  noPadding = false,
  animation = "fade",
  delay = 0,
}: PageSectionProps) {
  return (
    <AnimatedContainer
      type={animation !== "none" ? animation : undefined}
      delay={delay}
      className={cn("w-full", !noPadding && "p-0", className)}
    >
      {(title || description) && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </AnimatedContainer>
  );
}

interface PageGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function PageGrid({ children, className, columns = 2 }: PageGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
