"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../utils/api";

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
  const [userStats, setUserStats] = useState<GlobalLeaderboardEntry | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  const fetchGlobalLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      let currentUser = null;
      if (meRes.ok) {
        currentUser = await safeJson(meRes);
        if (currentUser) setUser(currentUser);
      }

      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GLOBAL_LEADERBOARD);
      
      if (res.ok) {
        const data = await safeJson(res);
        setLeaderboard(Array.isArray(data) ? data : []);
      } else {
        const status = res.status;
        if (status === 404) {
          setError("ERROR: LEADERBOARD NOT FOUND (404)");
        } else if (status === 401 || status === 403) {
          setError("ACCESS DENIED: PLEASE LOGIN (401/403)");
        } else {
          setError(`ERROR: SERVER RETURNED STATUS ${status}`);
        }
      }

      if (currentUser && (currentUser.sub || currentUser.id)) {
        const statsRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.USER_STATS(currentUser.sub || currentUser.id));
        if (statsRes.ok) {
          const statsData = await safeJson(statsRes);
          if (statsData) setUserStats(statsData);
        }
      }
    } catch (err) {
      console.error("Leaderboard fetch crash:", err);
      setError("CONNECTION ERROR: UNABLE TO REACH SERVER");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto space-y-12 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-foreground/5 pb-12">
            <div>
                <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2 block">Global Leaderboard</span>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none">Global Leaderboards</h1>
                <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mt-6 font-poppins">
                    TOP PERFORMERS WORLDWIDE
                </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button 
                    onClick={() => router.push("/tournaments")}
                    className="flex-1 md:px-12 py-5 border-2 border-foreground/10 text-foreground/60 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:border-primary hover:text-primary transition-all font-poppins"
                >
                    Tournaments
                </button>
            </div>
        </div>

        {userStats && !loading && (
          <div className="bg-primary text-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Player Profile</p>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-poppins">{userStats.username}</h2>
                <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
                   <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Rank #{userStats.rank}</span>
                   <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{userStats.points} PTS</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 md:gap-16">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Wins</p>
                  <p className="text-2xl font-black font-poppins">{userStats.wins}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Losses</p>
                  <p className="text-2xl font-black font-poppins">{userStats.losses}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">MWP</p>
                  <p className="text-2xl font-black font-poppins">{(userStats.matchWinPct * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-h-0 flex flex-col">
            {loading ? (
                <div className="bg-foreground/5 border border-foreground/5 rounded-[3rem] overflow-hidden flex-1 flex flex-col animate-pulse">
                    <div className="px-8 bg-background/50 border-b border-foreground/10 h-20 flex items-center">
                         <div className="grid grid-cols-6 w-full gap-8">
                             <div className="h-4 bg-foreground/10 rounded w-12" />
                             <div className="h-4 bg-foreground/10 rounded w-32" />
                             <div className="h-4 bg-foreground/10 rounded w-24 mx-auto" />
                             <div className="h-4 bg-foreground/10 rounded w-24 mx-auto" />
                             <div className="h-4 bg-foreground/10 rounded w-24 mx-auto" />
                             <div className="h-4 bg-foreground/10 rounded w-24 ml-auto" />
                         </div>
                    </div>
                    <div className="p-8 space-y-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-8">
                                <div className="h-8 bg-foreground/10 rounded w-16" />
                                <div className="h-8 bg-foreground/10 rounded w-48" />
                                <div className="h-8 bg-foreground/10 rounded w-24 hidden md:block" />
                                <div className="h-8 bg-foreground/10 rounded w-16 hidden md:block" />
                                <div className="h-8 bg-foreground/10 rounded w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center">
                        <p className="text-red-500 font-black uppercase tracking-widest text-sm mb-4">{error}</p>
                        <button 
                            onClick={fetchGlobalLeaderboard}
                            className="px-8 py-3 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all"
                        >
                            Retry Connection
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
                    <div className="px-8 bg-background/50 border-b border-foreground/10 shrink-0 hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">
                                    <th className="py-6 px-8 w-32">RANK</th>
                                    <th className="py-6 px-4">PLAYER</th>
                                    <th className="py-6 px-8 text-center w-48">POINTS</th>
                                    <th className="py-6 px-8 text-center w-48">TOURNAMENTS</th>
                                    <th className="py-6 px-8 text-center w-48">W-D-L</th>
                                    <th className="py-6 px-8 text-right w-48">WIN RATE</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

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
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Loading Leaderboards</p>
            </div>
        </div>
    }>
      <LeaderboardsContent />
    </Suspense>
  );
}
