"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
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

import HomeFrame from "../components/home/HomeFrame";
import SectionHeader from "../components/home/SectionHeader";
import UserRankCard from "../components/leaderboard/UserRankCard";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";

function LeaderboardsContent() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<GlobalLeaderboardEntry | null>(null);
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
      }

      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GLOBAL_LEADERBOARD);
      
      if (res.ok) {
        const data = await safeJson(res);
        setLeaderboard(Array.isArray(data) ? data : []);
      } else {
        setError(`Error: Server returned status ${res.status}`);
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
      setError("Connection error: Unable to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeFrame className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-8">
          <SectionHeader 
            title="Leaderboards" 
            subtitle="Global Pilot Rankings" 
            description="The most elite competitors in the JOUST ecosystem. Ranked by combat performance and victory consistency."
          />

          {userStats && (
            <div className="mb-20">
              <UserRankCard stats={userStats} loading={loading} />
            </div>
          )}

          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-primary">Top Performers</h3>
              {leaderboard.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                  {leaderboard.length} Pilots Synchronized
                </span>
              )}
            </div>

            {loading ? (
              <LeaderboardTable entries={[]} loading={true} />
            ) : error ? (
              <div className="p-20 border border-red-500/10 bg-red-500/5 text-center font-poppins">
                <p className="text-red-500 text-xs font-black uppercase tracking-[0.3em] mb-6">{error}</p>
                <button 
                  onClick={fetchGlobalLeaderboard}
                  className="px-10 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Reconnect
                </button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-24 border border-foreground/5 bg-foreground/5 text-center font-poppins">
                <p className="text-foreground/20 text-xs font-black uppercase tracking-[0.3em]">No ranking data currently available</p>
              </div>
            ) : (
              <LeaderboardTable entries={leaderboard} />
            )}
          </div>
        </div>
      </HomeFrame>
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
