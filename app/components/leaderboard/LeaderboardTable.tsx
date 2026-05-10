"use client";
import React from "react";
import * as m from "motion/react";
import { BentoBox } from "../ui/Bento";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  tournamentsPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
  omw: number;
  oomw: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  variant?: "default" | "bento";
  limit?: number;
}

export default function LeaderboardTable({ entries, loading, variant = "default", limit }: LeaderboardTableProps) {
  const displayEntries = React.useMemo(() => 
    limit ? (entries || []).slice(0, limit) : (entries || []),
  [entries, limit]);

  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {[...Array(variant === "bento" ? 3 : 8)].map((_, i) => (
          <div key={i} className="h-16 bg-black border-2 border-white/10" />
        ))}
      </div>
    );
  }

  const tableContent = (
    <div className="w-full overflow-x-auto selection:bg-primary selection:text-black">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-black border-b-4 border-white">
            <th className="py-6 px-8 text-[10px] font-black text-white uppercase tracking-[0.5em] font-poppins italic">RANK</th>
            <th className="py-6 px-8 text-[10px] font-black text-white uppercase tracking-[0.5em] font-poppins italic">COMPETITOR</th>
            <th className="py-6 px-8 text-[10px] font-black text-white uppercase tracking-[0.5em] font-poppins italic text-center">POINTS</th>
            <th className="py-6 px-8 text-[10px] font-black text-white uppercase tracking-[0.5em] font-poppins italic text-center">W / L / D</th>
            <th className="py-6 px-8 text-[10px] font-black text-white uppercase tracking-[0.5em] font-poppins italic text-right">WIN RATE</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-white/10">
          {displayEntries.map((entry, idx) => (
            <m.motion.tr 
              key={entry.userId} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="group hover:bg-primary/5 transition-colors bg-black"
            >
              <td className="py-6 px-8">
                <span className={`text-4xl font-black tracking-tighter font-poppins italic ${idx < 3 ? 'text-primary' : 'text-white/20'}`}>
                  #{String(idx + 1).padStart(2, '0')}
                </span>
              </td>
              <td className="py-6 px-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#1B1B1B] border-2 border-white/20 group-hover:border-primary flex items-center justify-center font-black text-xl text-primary transition-all">
                    {entry.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <span className="text-xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors block font-poppins italic">
                      {entry.username}
                    </span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] font-poppins">
                      VERIFIED ID // {entry.userId.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-6 px-8 text-center">
                <span className="text-3xl font-black text-white tracking-tighter font-poppins">
                  {entry.points}
                </span>
              </td>
              <td className="py-6 px-8 text-center">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#1B1B1B] border border-white/10 rounded-none">
                  <span className="text-xs font-black text-primary">{entry.wins}</span>
                  <span className="text-[10px] font-black text-white/20">/</span>
                  <span className="text-xs font-black text-white/40">{entry.losses}</span>
                  <span className="text-[10px] font-black text-white/20">/</span>
                  <span className="text-xs font-black text-white/40">{entry.draws}</span>
                </div>
              </td>
              <td className="py-6 px-8 text-right">
                <span className={`text-3xl font-black font-poppins italic ${idx < 3 ? "text-primary" : "text-white"}`}>
                  {(entry.matchWinPct * 100).toFixed(0)}%
                </span>
              </td>
            </m.motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (variant === "bento") {
    return (
      <BentoBox theme="default" noPadding className="p-0 overflow-hidden h-full flex flex-col bg-black border-4 border-white">
        <div className="p-8 border-b-4 border-white flex items-center justify-between bg-black shrink-0">
           <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-primary font-poppins italic">LEADERBOARD</h3>
           <div className="text-[10px] font-black text-white/30 uppercase tracking-widest font-poppins">LIVE FEED</div>
        </div>
        <div className="flex-1 overflow-auto no-scrollbar">
          {tableContent}
        </div>
      </BentoBox>
    );
  }

  return (
    <div className="bg-black border-4 border-white shadow-[16px_16px_0px_0px_#52B946] overflow-hidden">
      {tableContent}
    </div>
  );
}
