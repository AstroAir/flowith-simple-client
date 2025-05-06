import React from "react";
/**
 * Performance utilities for optimizing application performance
 */

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit the rate at which a function can fire
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Memoize function to cache expensive function calls
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();

  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

// Measure execution time of a function
export function measureExecutionTime<T extends (...args: any[]) => any>(
  func: T,
  funcName = "Function"
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();

    console.log(`${funcName} execution time: ${end - start}ms`);
    return result;
  };
}

// Batch DOM updates to reduce layout thrashing
export function batchDOMUpdates(updates: (() => void)[]): void {
  // Request animation frame to batch updates
  requestAnimationFrame(() => {
    // Force a style recalculation
    document.body.getBoundingClientRect();

    // Apply all updates
    updates.forEach((update) => update());
  });
}

// Detect slow renders and log them
export function detectSlowRender(
  Component: React.ComponentType<any>,
  threshold = 16 // 16ms = 60fps
): React.ComponentType<any> {
  const ComponentName = Component.displayName || Component.name || "Component";

  return function WrappedComponent(props: any) {
    const start = performance.now();
    const result = React.createElement(Component, props);
    const end = performance.now();

    const renderTime = end - start;
    if (renderTime > threshold) {
      console.warn(
        `Slow render detected: ${ComponentName} took ${renderTime}ms to render`
      );
    }

    return result;
  };
}

// Lazy load images
export function lazyLoadImage(
  imageUrl: string,
  placeholderUrl = "/placeholder.svg?height=200&width=200"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error("Failed to load image"));

    // Return placeholder immediately
    resolve(placeholderUrl);
  });
}
