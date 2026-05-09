"use client";
import React, { useState, useEffect } from "react";
import * as m from "motion/react";
import Link from "next/link";

export default function ContextualToolbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [handDominance, setHandDominance] = useState<"left" | "right">("right");

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <m.motion.div 
      initial={false}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 50,
        scale: isVisible ? 1 : 0.9
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed bottom-10 ${handDominance === "right" ? "right-10" : "left-10"} z-50 flex items-center gap-2 pointer-events-none`}
    >
      <div className="flex bg-surface border-2 border-white/5 p-2 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] pointer-events-auto">
        <button 
          onClick={() => setHandDominance(prev => prev === "right" ? "left" : "right")}
          className="px-6 py-3 text-[10px] font-black text-white hover:text-primary transition-all uppercase tracking-widest font-poppins flex items-center gap-3 group"
        >
          <span className="text-lg group-hover:scale-125 transition-transform">⚙</span>
          <span>{handDominance === "right" ? "R_DRIVE" : "L_DRIVE"}</span>
        </button>
      </div>
    </m.motion.div>
  );
}
