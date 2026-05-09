"use client";
import React from "react";
import * as m from "motion/react";

interface UserRankProps {
  stats: {
    username: string;
    rank: number;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    matchWinPct: number;
  } | null;
  loading?: boolean;
}

/**
 * UserRankCard - A high-fidelity card showcasing the current user's global status.
 * Designed for reuse across Leaderboards, Profile, and Home pages.
 */
export default function UserRankCard({ stats, loading }: UserRankProps) {
  if (loading) {
    return (
      <div className="w-full bg-foreground/5 border border-foreground/10 p-8 md:p-12 animate-pulse relative overflow-hidden">
        <div className="h-10 bg-foreground/10 w-1/3 mb-4" />
        <div className="h-6 bg-foreground/10 w-1/4" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <m.motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative w-full bg-background border border-foreground/10 p-8 md:p-12 overflow-hidden transition-all duration-500 hover:border-primary/40 font-questrial"
    >
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="text-center md:text-left space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 font-poppins">Authenticated Pilot</p>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-none font-poppins">
              {stats.username}
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start font-poppins">
            <div className="bg-primary text-background px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_var(--color-primary-glow)]">
              Rank #{stats.rank}
            </div>
            <div className="bg-foreground/5 border border-foreground/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/60">
              {stats.points} Total Points
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 md:gap-16 border-t md:border-t-0 md:border-l border-foreground/10 pt-10 md:pt-0 md:pl-16 w-full md:w-auto font-poppins">
          <div className="text-center md:text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-2">Wins</p>
            <p className="text-3xl font-black text-foreground">{stats.wins}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-2">Losses</p>
            <p className="text-3xl font-black text-foreground">{stats.losses}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-2">Ratio</p>
            <p className="text-3xl font-black text-primary-light">
              {(stats.matchWinPct * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-primary/5 skew-x-12 translate-x-6 translate-y-6" />
    </m.motion.div>
  );
}
