"use client";

import React from "react";
import { motion } from "motion/react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
}

const revealVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: "blur(10px)",
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

/**
 * StaggerContainer - A wrapper that coordinates the entry of multiple FadeIn children.
 */
export function StaggerContainer({ children, className = "" }: FadeInProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - A modular component that reveals itself with spring physics.
 * Works best when wrapped in a StaggerContainer.
 */
export default function FadeIn({ children, className = "" }: FadeInProps) {
  return (
    <motion.div
      variants={revealVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
