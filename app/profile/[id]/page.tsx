"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../utils/api";

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
  isGuest?: boolean;
  createdAt?: string;
}

interface LeaderboardStats {
  points: number;
  tournamentsPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
}

function ProfileContent() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
        let myData = null;
        if (meRes.ok) {
          myData = await meRes.json();
        }

        const targetId = profileId || (myData ? (myData.id || myData.sub) : null);
        
        if (!targetId) {
            router.push("/auth");
            return;
        }

        const isMe = myData && (myData.id === targetId || myData.sub === targetId);
        setIsOwnProfile(!!isMe);

        if (isMe) {
          setUser(myData);
        }

        const lbRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GLOBAL_LEADERBOARD);
        if (lbRes.ok) {
          const leaderboard = await lbRes.json();
          const targetUserStats = leaderboard.find((u: any) => u.userId === targetId);
          
          if (targetUserStats) {
            setStats(targetUserStats);
            
            if (!isMe) {
              setUser({
                id: targetUserStats.userId,
                username: targetUserStats.username,
              });
            }
          } else if (!isMe) {
             setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [profileId, router]);

  if (loading && !user) {
    return (
      <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col items-center px-4 py-12 sm:px-8 w-full animate-pulse">
          <div className="w-full max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-foreground/5 border border-foreground/10 p-10 rounded-none">
              <div className="w-40 h-40 bg-foreground/10" />
              <div className="flex-1 space-y-4">
                <div className="h-16 bg-foreground/10 w-3/4 rounded-xl" />
                <div className="h-4 bg-foreground/10 w-1/4 rounded-md" />
                <div className="h-4 bg-foreground/10 w-1/2 rounded-md mt-8" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[400px] bg-foreground/5 border border-foreground/10 rounded-none" />
              <div className="h-[400px] bg-foreground/5 border border-foreground/10 rounded-none" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4 font-poppins">User Not Found</h2>
            <p className="text-foreground/40 font-bold uppercase tracking-widest">This user may not exist, or they haven't played any matches yet to be publicly visible.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 py-12 sm:px-8 w-full">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-l-4 border-l-primary border-y border-r border-primary/20 rounded-none p-8 md:p-10 relative overflow-hidden">
              {isOwnProfile && (
                <button className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2 px-5 py-2.5 bg-primary text-background border border-primary rounded-none text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 group shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit Profile
                  <span className="absolute -top-10 right-0 bg-background border border-foreground/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-foreground/50">Coming Soon</span>
                </button>
              )}

              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/20 rounded-none border-2 border-primary flex items-center justify-center text-primary text-6xl font-black shadow-[0_0_40px_rgba(var(--primary),0.4)]">
                  <div>{user.username?.[0]?.toUpperCase() || "U"}</div>
                </div>
                {user.roles?.includes("ADMIN") && (
                  <div className="absolute -bottom-3 -right-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-4 border-neutral-900 shadow-xl transform rotate-12">
                    Admin
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left flex flex-col justify-center pt-2 md:pt-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground font-poppins mb-2 drop-shadow-md">
                  {user.username}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                  {user.isGuest && (
                    <span className="bg-foreground/10 text-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                      Guest Account
                    </span>
                  )}
                </div>
                
                {user.createdAt && (
                  <p className="text-foreground/30 text-[10px] font-black uppercase tracking-[0.2em] mt-8">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-foreground/5 to-transparent border border-primary/10 rounded-none p-8 md:p-10 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest text-foreground font-poppins flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Match History
                </h3>
                <span className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Recent 10</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-background/50 rounded-none border border-dashed border-primary/20 p-8">
                <svg className="w-12 h-12 text-foreground/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-foreground/30 text-xs font-black uppercase tracking-widest leading-relaxed max-w-xs">
                  Awaiting match data.<br/>Play matches to populate history.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-bl from-foreground/5 to-transparent border border-primary/10 rounded-none p-8 md:p-10 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest text-foreground font-poppins flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Performance Stats
                </h3>
              </div>

              {stats ? (
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-none border border-primary/10 p-6 flex flex-col justify-center items-center hover:bg-primary/10 transition-colors">
                    <span className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-2">Total Points</span>
                    <span className="text-4xl font-black text-primary">{stats.points}</span>
                  </div>
                  <div className="bg-primary/5 rounded-none border border-primary/10 p-6 flex flex-col justify-center items-center hover:bg-primary/10 transition-colors">
                    <span className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-2">Tournaments</span>
                    <span className="text-4xl font-black text-primary">{stats.tournamentsPlayed}</span>
                  </div>
                  <div className="bg-primary/5 rounded-none border border-primary/10 p-6 flex flex-col justify-center items-center hover:bg-primary/10 transition-colors">
                    <span className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-2">Matches Won</span>
                    <span className="text-3xl font-black text-green-500">{stats.wins}</span>
                  </div>
                  <div className="bg-primary/5 rounded-none border border-primary/10 p-6 flex flex-col justify-center items-center hover:bg-primary/10 transition-colors">
                    <span className="text-primary/60 text-[10px] font-black uppercase tracking-widest mb-2">Matches Lost</span>
                    <span className="text-3xl font-black text-red-500">{stats.losses}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-background/50 rounded-none border border-dashed border-primary/20 p-8">
                  <svg className="w-12 h-12 text-foreground/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-foreground/30 text-xs font-black uppercase tracking-widest leading-relaxed max-w-xs">
                    Insufficient match data to generate performance stats.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-background font-questrial flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-black uppercase tracking-widest text-sm">Loading Profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
