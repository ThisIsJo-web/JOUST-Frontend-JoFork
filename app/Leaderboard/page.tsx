"use client";

import { useState, useEffect } from "react";
import Navbar from "../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../utils/api";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
  omw: number;
  oomw: number;
  tournamentsPlayed?: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      let currentUser = null;
      if (meRes.ok) {
        currentUser = await meRes.json();
        setUser(currentUser);
      }

      const lbRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GLOBAL_LEADERBOARD);
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLeaderboard(lbData);
      }

      if (currentUser) {
        const statsRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.USER_STATS(currentUser.id));
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats(statsData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Accessing Archives</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-12 py-12 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-16 border-b border-foreground/5 pb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none mb-4">Archives</h1>
          <p className="text-xs font-black text-primary uppercase tracking-[0.5em] font-poppins">Global Combatant Rankings</p>
        </div>

        {/* User Stats Card */}
        {userStats && (
          <div className="mb-16 bg-primary text-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Combatant Profile</p>
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

        {/* Leaderboard Table */}
        <div className="bg-foreground/5 border border-foreground/5 rounded-[3rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-foreground/40 font-poppins">Rank</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-foreground/40 font-poppins">Combatant</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-foreground/40 font-poppins text-center">Score</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-foreground/40 font-poppins text-center">W-L-D</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-widest text-foreground/40 font-poppins text-right">MWP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr 
                    key={entry.userId} 
                    className={`border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors group ${entry.userId === user?.id ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-8 py-8">
                      <span className={`text-sm font-black font-poppins ${entry.rank <= 3 ? 'text-primary' : 'text-foreground/40'}`}>
                        {entry.rank.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground uppercase tracking-tight font-poppins group-hover:text-primary transition-colors">
                          {entry.username}
                        </span>
                        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                          ID: {entry.userId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className="text-sm font-black text-foreground font-poppins">{entry.points}</span>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className="text-[10px] font-black text-foreground/40 font-poppins">
                        {entry.wins}-{entry.losses}-{entry.draws}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-xs font-black text-foreground font-poppins">{(entry.matchWinPct * 100).toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20 font-poppins">No Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}