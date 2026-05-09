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
          <div key={i} className="h-16 bg-white/5" />
        ))}
      </div>
    );
  }

  const tableRef = React.useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = React.useState({ left: 0, right: 0 });

  React.useEffect(() => {
    const updateConstraints = () => {
      if (tableRef.current) {
        const containerWidth = tableRef.current.offsetWidth;
        const scrollWidth = tableRef.current.scrollWidth;
        const newLeft = scrollWidth > containerWidth ? -(scrollWidth - containerWidth) : 0;
        
        setDragConstraints(prev => {
          if (prev.left === newLeft) return prev;
          return { left: newLeft, right: 0 };
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [displayEntries]);

  const tableContent = (
    <div className="w-full h-full overflow-hidden relative">
      <div ref={tableRef} className="w-full h-full overflow-hidden">
        <m.motion.table 
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.05}
          className="w-full text-left border-collapse min-w-[600px] md:min-w-full cursor-grab active:cursor-grabbing"
        >
          <thead>
            <tr className="bg-zinc-900/50 text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">
              <th className="py-5 px-8 w-24 text-center border-b-2 border-r border-white/10">RANK</th>
              <th className="py-5 px-8 border-b-2 border-r border-white/10 flex-1">PLAYER</th>
              <th className="py-5 px-8 w-24 text-center border-b-2 border-r border-white/10">POINTS</th>
              <th className="py-5 px-8 text-right border-b-2 border-white/10 w-32">WIN RATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayEntries.map((entry, idx) => (
              <m.motion.tr 
                key={entry.userId} 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ backgroundColor: "rgba(82, 185, 70, 0.05)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group cursor-default transition-colors relative"
              >
                <td className="py-4 px-8 text-center border-r border-white/5 w-24">
                  <span className={`text-2xl font-black tracking-tighter ${idx < 3 ? 'text-primary' : 'text-white/20'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </td>
                <td className="py-4 px-8 border-r border-white/5 min-w-[200px]">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-[10px] text-primary shrink-0">
                      {entry.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <span className="text-md font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors block">
                        {entry.username}
                      </span>
                      <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                        UID_{entry.userId.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-8 text-center border-r border-white/5 w-24">
                  <span className="text-xl font-black text-white tracking-tighter">
                    {entry.points}
                  </span>
                </td>
                <td className="py-4 px-8 text-right w-32">
                  <span className={`text-xl font-black ${idx < 3 ? "text-primary" : "text-white"}`}>
                    {(entry.matchWinPct * 100).toFixed(0)}%
                  </span>
                </td>
              </m.motion.tr>
            ))}
            
            {limit && displayEntries.length < limit && [...Array(limit - displayEntries.length)].map((_, i) => (
              <tr key={`empty-${i}`} className="opacity-10 pointer-events-none">
                <td className="py-4 px-8 text-center border-r border-white/5 w-24">
                   <span className="text-xl font-black text-white/10">{(displayEntries.length + i + 1).toString().padStart(2, '0')}</span>
                </td>
                <td className="py-4 px-8 border-r border-white/5 min-w-[200px]">
                   <div className="h-4 w-32 bg-white/5 animate-pulse" />
                </td>
                <td className="py-4 px-8 border-r border-white/5 w-24" />
                <td className="py-4 px-8 w-32" />
              </tr>
            ))}
          </tbody>
        </m.motion.table>
      </div>
    </div>
  );

  if (variant === "bento") {
    return (
      <BentoBox theme="default" noPadding className="p-0 overflow-hidden h-full flex flex-col">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-zinc-900/30 shrink-0">
           <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary font-poppins">LEADERBOARD</h3>
           <svg className="w-5 h-5 text-primary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
           </svg>
        </div>
        <div className="flex-1 overflow-auto no-scrollbar">
          {tableContent}
        </div>
      </BentoBox>
    );
  }

  return (
    <div className="p-8">
      {tableContent}
    </div>
  );
}
