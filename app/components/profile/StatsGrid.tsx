"use client";

import React from "react";
import * as m from "motion/react";

interface LeaderboardStats {
  points: number;
  tournamentsPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
}

interface StatsGridProps {
  stats: LeaderboardStats | null;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  if (!stats) {
    return (
      <m.motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex-1 flex flex-col items-center justify-center text-center bg-background/50 rounded-none border border-dashed border-primary/20 p-8 min-h-[400px]"
      >
        <svg className="w-12 h-12 text-foreground/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p className="text-foreground/30 text-xs font-black uppercase tracking-widest leading-relaxed max-w-xs">
          Insufficient match data to generate performance stats.
        </p>
      </m.motion.div>
    );
  }

  const statItems = [
    { label: "Total Points", value: stats.points, color: "text-primary" },
    { label: "Tournaments", value: stats.tournamentsPlayed, color: "text-foreground/80" },
    { label: "Matches Won", value: stats.wins, color: "text-primary-light" },
    { label: "Win Ratio", value: `${(stats.matchWinPct * 100).toFixed(0)}%`, color: "text-primary" },
  ];

  return (
    <div className="flex-1 grid grid-cols-2 gap-4">
      {statItems.map((item, idx) => (
        <m.motion.div 
          key={item.label}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="bg-foreground/[0.02] rounded-none border border-foreground/10 p-6 flex flex-col justify-center items-center hover:bg-foreground/[0.05] hover:border-primary/20 transition-all duration-300 group shadow-[0_0_15px_rgba(var(--color-primary),0.02)]"
        >
          <span className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mb-2 group-hover:text-foreground/50 transition-colors">
            {item.label}
          </span>
          <span className={`text-3xl md:text-4xl font-black ${item.color}`}>
            {item.value}
          </span>
        </m.motion.div>
      ))}
    </div>
  );
}
