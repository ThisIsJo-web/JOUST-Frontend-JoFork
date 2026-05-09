"use client";

import React from "react";
import * as m from "motion/react";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <m.motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(200px,auto)] gap-6 md:gap-8 ${className}`}
    >
      {children}
    </m.motion.div>
  );
}

export function BentoItem({ 
  children, 
  className = "", 
  colSpan = 1, 
  rowSpan = 1 
}: { 
  children: React.ReactNode; 
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}) {
  const colSpans = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
  };

  const rowSpans = {
    1: "lg:row-span-1",
    2: "lg:row-span-2",
    3: "lg:row-span-3",
  };

  return (
    <m.motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      className={`md:col-span-2 ${colSpans[colSpan]} ${rowSpans[rowSpan]} ${className}`}
    >
      {children}
    </m.motion.div>
  );
}

interface BentoBoxProps {
  children: React.ReactNode;
  theme?: "default" | "primary" | "secondary";
  className?: string;
  noPadding?: boolean;
}

export function BentoBox({ 
  children, 
  theme = "default", 
  className = "",
  noPadding = false
}: BentoBoxProps) {
  const themes = {
    default: "bg-surface text-white border-2 border-white/5 hover:border-primary/40 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(82,185,70,0.1)]",
    primary: "bg-surface text-primary border-4 border-primary shadow-[15px_15px_0px_0px_rgba(82,185,70,0.2)]",
    secondary: "bg-primary text-black border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]",
  };

  return (
    <m.motion.div 
      whileHover={{ y: -4, x: -4 }}
      whileTap={{ scale: 0.99, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`h-full relative overflow-hidden flex flex-col group transition-all duration-200 ${themes[theme]} ${noPadding ? "" : "p-8"} ${className}`}
    >
      {/* Purpose-driven Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-1 bg-primary/20 group-hover:bg-primary transition-all duration-300" />
      <div className="absolute top-0 left-0 w-1 h-6 bg-primary/20 group-hover:bg-primary transition-all duration-300" />

      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
      
      {/* Tactile Highlight Overlay */}
      <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/5 transition-colors pointer-events-none" />
    </m.motion.div>
  );
}

