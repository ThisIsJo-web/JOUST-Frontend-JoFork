"use client";

import React from "react";
import * as m from "motion/react";

export default function MatchHistory() {
  return (
    <m.motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-br from-primary/10 via-background to-transparent border border-primary/20 rounded-none p-8 md:p-10 flex flex-col min-h-[400px] shadow-[inset_0_0_20px_var(--color-primary-glow)]"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black uppercase tracking-widest text-foreground font-poppins flex items-center gap-3">
          <svg className="w-6 h-6 text-primary shadow-[0_0_10px_var(--color-primary-glow)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Match History
        </h3>
        <span className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Recent 10</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center bg-background/50 rounded-none border border-dashed border-primary/20 p-8">
        <m.motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-12 h-12 text-foreground/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </m.motion.div>
        <p className="text-foreground/30 text-xs font-black uppercase tracking-widest leading-relaxed max-w-xs font-questrial">
          Awaiting match data.<br/>Play matches to populate history.
        </p>
      </div>
    </m.motion.div>
  );
}
