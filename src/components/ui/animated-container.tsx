"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animateEnter?: boolean;
  animateExit?: boolean;
  delay?: number;
  duration?: number;
  type?: "fade" | "slide" | "scale" | "bounce" | "flip" | "none";
  direction?: "up" | "down" | "left" | "right";
  staggerChildren?: boolean;
  staggerDelay?: number;
  id?: string;
}

export default function AnimatedContainer({
  children,
  className,
  animateEnter = true,
  animateExit = true,
  delay = 0,
  duration = 0.3,
  type = "fade",
  direction = "up",
  staggerChildren = false,
  staggerDelay = 0.05,
  id,
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(!animateEnter);
  const firstRender = useRef(true);
  const { animationsEnabled } = useTheme();

  useEffect(() => {
    if (firstRender.current && animateEnter) {
      firstRender.current = false;
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [animateEnter]);

  if (!animationsEnabled) {
    return <div className={className}>{children}</div>;
  }

  // Define animation variants based on type and direction
  const getVariants = () => {
    const baseVariants = {
      hidden: {},
      visible: {
        transition: {
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0,
          delayChildren: delay,
        },
      },
      exit: {},
    };

    switch (type) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
              delayChildren: delay,
            },
          },
          exit: { opacity: 0 },
        };
      case "slide":
        const offset = 30;
        let initial = {};

        switch (direction) {
          case "up":
            initial = { y: offset };
            break;
          case "down":
            initial = { y: -offset };
            break;
          case "left":
            initial = { x: offset };
            break;
          case "right":
            initial = { x: -offset };
            break;
        }

        return {
          hidden: { ...initial, opacity: 0 },
          visible: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
              delayChildren: delay,
            },
          },
          exit: { ...initial, opacity: 0 },
        };
      case "scale":
        return {
          hidden: { scale: 0.95, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
              delayChildren: delay,
            },
          },
          exit: { scale: 0.95, opacity: 0 },
        };
      case "bounce":
        return {
          hidden: { y: 50, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 15,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
              delayChildren: delay,
            },
          },
          exit: { y: 50, opacity: 0 },
        };
      case "flip":
        return {
          hidden: { rotateX: 90, opacity: 0 },
          visible: {
            rotateX: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay,
              staggerChildren: staggerChildren ? staggerDelay : 0,
              delayChildren: delay,
            },
          },
          exit: { rotateX: 90, opacity: 0 },
        };
      case "none":
      default:
        return baseVariants;
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const renderChildren = () => {
    if (!staggerChildren) return children;

    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;

      return (
        <motion.div
          variants={childVariants}
          key={index}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      );
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit={animateExit ? "exit" : undefined}
          variants={getVariants()}
          layoutId={id}
        >
          {staggerChildren ? renderChildren() : children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
