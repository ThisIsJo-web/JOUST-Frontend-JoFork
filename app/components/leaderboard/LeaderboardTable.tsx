"use client";
import React from "react";

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
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
}

export default function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-foreground/5 border border-foreground/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-foreground/10 bg-[#0A0A0A]/50 font-questrial">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-foreground/5 text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] font-poppins">
            <th className="py-4 px-4 md:px-8 w-16 md:w-24">Pos</th>
            <th className="py-4 px-2 md:px-4">User</th>
            <th className="py-4 px-8 text-center w-40 hidden md:table-cell">Score</th>
            <th className="py-4 px-8 text-center w-40 hidden md:table-cell">Events</th>
            <th className="py-4 px-8 text-center w-40 hidden lg:table-cell">Record</th>
            <th className="py-4 px-4 md:px-8 text-right w-32 md:w-40">Win rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {entries.map((entry) => (
            <tr 
              key={entry.userId} 
              className="group hover:bg-primary/5 transition-colors cursor-default"
            >
              <td className="py-5 px-4 md:px-8">
                <span className={`text-lg md:text-xl font-black font-poppins ${
                  entry.rank <= 3 ? 'text-primary' : 'text-foreground/30'
                }`}>
                  #{entry.rank.toString().padStart(2, '0')}
                </span>
              </td>
              <td className="py-5 px-2 md:px-4">
                <div className="flex flex-col">
                  <span className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors font-poppins truncate max-w-[120px] md:max-w-none">
                    {entry.username}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/20 md:hidden font-poppins">
                    {entry.points} PTS · {entry.wins}W-{entry.losses}L
                  </span>
                </div>
              </td>
              <td className="py-6 px-8 text-center hidden md:table-cell">
                <span className="text-xl font-black text-foreground/60 group-hover:text-foreground transition-colors font-poppins">
                  {entry.points}
                </span>
              </td>
              <td className="py-6 px-8 text-center hidden md:table-cell">
                <span className="text-xl font-black text-foreground/40 font-poppins">
                  {entry.tournamentsPlayed}
                </span>
              </td>
              <td className="py-6 px-8 text-center hidden lg:table-cell text-foreground/20 font-black font-poppins">
                {entry.wins}-{entry.draws || 0}-{entry.losses}
              </td>
              <td className="py-5 px-4 md:px-8 text-right">
                <div className="flex flex-col items-end font-poppins">
                  <span className="text-lg md:text-xl font-black text-primary-light">
                    {(entry.matchWinPct * 100).toFixed(0)}%
                  </span>
                  <div className="w-12 md:w-16 h-1 bg-foreground/5 mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${entry.matchWinPct * 100}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
