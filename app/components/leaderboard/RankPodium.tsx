"use client";

import React from "react";
import { motion } from "motion/react";

interface PodiumEntry {
  rank: number;
  username: string;
  points: number;
  matchWinPct: number;
  wins: number;
  losses: number;
}

interface RankPodiumProps {
  entries: PodiumEntry[];
}

export default function RankPodium({ entries }: RankPodiumProps) {
  if (entries.length === 0) return null;

  // Ensure entries are ordered 2, 1, 3 for the visual podium if on desktop
  // but keep it simple for mobile
  const rank1 = entries.find(e => e.rank === 1);
  const rank2 = entries.find(e => e.rank === 2);
  const rank3 = entries.find(e => e.rank === 3);

  return (
    <div className="w-full mb-16 px-4 md:px-0">
      <div className="flex flex-col lg:flex-row items-end justify-center gap-6 lg:gap-8">
        
        {/* Rank 2 */}
        {rank2 && (
          <PodiumCard 
            entry={rank2} 
            delay={0.2} 
            className="lg:h-[320px] lg:w-[300px] border-primary/20 bg-primary/5" 
            rankColor="text-foreground/40"
          />
        )}

        {/* Rank 1 */}
        {rank1 && (
          <PodiumCard 
            entry={rank1} 
            delay={0.1} 
            featured
            className="lg:h-[400px] lg:w-[340px] border-primary bg-primary/10 shadow-[0_0_50px_rgba(var(--primary),0.1)]" 
            rankColor="text-primary"
          />
        )}

        {/* Rank 3 */}
        {rank3 && (
          <PodiumCard 
            entry={rank3} 
            delay={0.3} 
            className="lg:h-[280px] lg:w-[280px] border-primary/10 bg-primary/5" 
            rankColor="text-foreground/20"
          />
        )}
      </div>
    </div>
  );
}

function PodiumCard({ entry, className, rankColor, featured = false, delay = 0 }: { entry: PodiumEntry, className: string, rankColor: string, featured?: boolean, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col items-center justify-center p-8 border rounded-none transition-all duration-500 hover:border-primary/60 group w-full ${className}`}
    >
      {/* Background Glow for Rank 1 */}
      {featured && (
        <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
      )}

      {/* Stylized Rank Number */}
      <div className={`absolute top-4 left-6 text-6xl font-black italic opacity-20 group-hover:opacity-40 transition-opacity font-poppins ${rankColor}`}>
        #{entry.rank}
      </div>

      <div className="relative z-10 text-center space-y-6">
        <div className="space-y-1">
           <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors font-poppins">
             {entry.username}
           </h3>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-5xl font-black text-foreground/90 font-poppins leading-none">
            {(entry.matchWinPct * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 mt-2">Win Rate</span>
        </div>

        <div className="flex gap-8 items-center justify-center font-poppins">
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-primary">{entry.points}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Points</span>
          </div>
          <div className="w-px h-6 bg-foreground/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-foreground/60">{entry.wins}-{entry.losses}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Record</span>
          </div>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className={`absolute bottom-0 right-0 w-12 h-12 bg-primary/5 transition-all duration-500 group-hover:bg-primary/20 ${featured ? 'opacity-100' : 'opacity-0'}`} style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
    </motion.div>
  );
}
