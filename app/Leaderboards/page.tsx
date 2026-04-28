"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../utils/api";

interface GlobalLeaderboardEntry {
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

function LeaderboardsContent() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  const fetchGlobalLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GLOBAL_LEADERBOARD);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      } else {
        setError("UPLINK ERROR: FAILED TO RETRIEVE GLOBAL TELEMETRY");
      }
    } catch (err) {
      setError("CONNECTION LOST: UNABLE TO REACH CENTRAL COMMAND");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto space-y-12 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-foreground/5 pb-12">
            <div>
                <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2 block">Global Command</span>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none">Global Leaderboards</h1>
                <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mt-6 font-poppins">
                    TOP PERFORMERS ACROSS ALL SECTORS
                </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button 
                    onClick={() => router.push("/Tournaments")}
                    className="flex-1 md:px-12 py-5 border-2 border-foreground/10 text-foreground/60 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:border-primary hover:text-primary transition-all font-poppins"
                >
                    Tournaments
                </button>
            </div>
        </div>

        {/* Main Display Area */}
        <main className="flex-1 min-h-0 flex flex-col">
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Global Telemetry</p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center">
                        <p className="text-red-500 font-black uppercase tracking-widest text-sm mb-4">{error}</p>
                        <button 
                            onClick={fetchGlobalLeaderboard}
                            className="px-8 py-3 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all"
                        >
                            Retry Uplink
                        </button>
                    </div>
                </div>
            ) : leaderboard.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/10 mb-8">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground/40 font-poppins">No Global Data Found</h2>
                    <p className="text-foreground/20 text-xs font-bold uppercase tracking-widest mt-4">Awaiting tournament results for global rankings</p>
                </div>
            ) : (
                <div className="bg-foreground/5 border border-foreground/5 rounded-[3rem] overflow-hidden flex-1 flex flex-col">
                    {/* Table Header */}
                    <div className="px-8 bg-background/50 border-b border-foreground/10 shrink-0 hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">
                                    <th className="py-6 px-8 w-32">RANK</th>
                                    <th className="py-6 px-4">OPERATOR</th>
                                    <th className="py-6 px-8 text-center w-48">COMMENDATIONS</th>
                                    <th className="py-6 px-8 text-center w-48">DEPLOYMENTS</th>
                                    <th className="py-6 px-8 text-center w-48">W-D-L</th>
                                    <th className="py-6 px-8 text-right w-48">SUCCESS RATE</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-4">
                        <table className="w-full text-left border-collapse">
                            <tbody className="text-lg md:text-2xl font-black text-foreground uppercase">
                                {leaderboard.map((entry) => (
                                    <tr key={entry.userId} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                        <td className="py-8 px-8 text-primary font-poppins w-32">
                                            #{entry.rank.toString().padStart(2, '0')}
                                        </td>
                                        <td className="py-8 px-4 font-poppins tracking-tighter">
                                            {entry.username}
                                        </td>
                                        <td className="py-8 px-8 text-center font-poppins w-48 hidden md:table-cell">
                                            {entry.points} <span className="text-[10px] text-foreground/20 tracking-widest ml-1">PTS</span>
                                        </td>
                                        <td className="py-8 px-8 text-center font-poppins w-48 hidden md:table-cell text-foreground/40">
                                            {entry.tournamentsPlayed}
                                        </td>
                                        <td className="py-8 px-8 text-center text-foreground/20 font-poppins w-48 hidden md:table-cell">
                                            {entry.wins}-{entry.draws || 0}-{entry.losses}
                                        </td>
                                        <td className="py-8 px-8 text-right text-foreground/60 font-poppins w-48">
                                            {(entry.matchWinPct * 100).toFixed(0)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile view cards (Alternative to table if screen is too small) */}
                        <div className="md:hidden space-y-4 py-4">
                            {leaderboard.map((entry) => (
                                <div key={entry.userId} className="p-6 bg-foreground/5 rounded-2xl border border-white/5 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <span className="text-primary font-black text-xs">#{entry.rank}</span>
                                        <h3 className="text-xl font-black tracking-tighter">{entry.username}</h3>
                                        <p className="text-[9px] font-black text-foreground/40 tracking-widest uppercase">
                                            {entry.points} PTS · {entry.wins}W {entry.losses}L
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black">{(entry.matchWinPct * 100).toFixed(0)}%</span>
                                        <p className="text-[9px] font-black text-foreground/20 tracking-widest uppercase">RATIO</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(82, 185, 70, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(82, 185, 70, 0.4);
        }
      `}</style>
    </div>
  );
}

export default function LeaderboardsPage() {
  return (
    <Suspense fallback={
        <div className="h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Initializing Terminal</p>
            </div>
        </div>
    }>
      <LeaderboardsContent />
    </Suspense>
  );
}
