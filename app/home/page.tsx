"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as m from "motion/react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../utils/api";
import HomeFrame from "../components/home/HomeFrame";
import FadeIn, { StaggerContainer } from "../components/FadeIn";
import { BentoGrid, BentoItem, BentoBox } from "../components/ui/Bento";
import TournamentList from "../components/tournaments/TournamentList";
import MatchHistory from "../components/profile/MatchHistory";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import ProfileHeader from "../components/profile/ProfileHeader";
import StatsGrid from "../components/profile/StatsGrid";
import ContextualToolbar from "../components/home/ContextualToolbar";

function HomeContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const handleLogout = async () => {
    try {
      await authenticatedFetch(API_ENDPOINTS.AUTH.SIGNOUT);
    } finally {
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
        if (!meRes.ok) {
          setIsUnauthorized(true);
          return;
        }
        const meData = await meRes.json();
        setUser(meData);
        const myId = meData.id || meData.sub;
        
        // ... rest of fetch logic ...
        const [statsRes, tournamentsRes, lbRes] = await Promise.all([
          authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.USER_STATS(myId)),
          authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE),
          authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GLOBAL_LEADERBOARD),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        if (tournamentsRes.ok) {
          setTournaments(await tournamentsRes.json());
        }

        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(Array.isArray(lbData) ? lbData : []);
        }

        const mockActivities = [
          { id: '1', type: 'win', title: 'Victory', subtitle: 'Global Swiss Masters', time: '2h ago', value: '+150 PTS' },
          { id: '2', type: 'entry', title: 'Joined', subtitle: 'Late Night Blitz', time: '5h ago' },
          { id: '3', type: 'win', title: 'Match Won', subtitle: 'vs ProPlayer_42', time: '1d ago', value: '+30 PTS' },
          { id: '4', type: 'loss', title: 'Match Lost', subtitle: 'vs GrandMaster_X', time: '2d ago', value: '-10 PTS' },
        ];
        setActivities(mockActivities);

      } catch (error) {
        console.error("Home data fetch failed:", error);
        setIsUnauthorized(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isUnauthorized) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-8 selection:bg-primary selection:text-black">
        <HomeFrame className="flex items-center justify-center" showPattern={true}>
          <m.motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-zinc-900/50 border-2 border-white/10 p-12 text-center relative group overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
            
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-8 font-poppins">
              Access Restricted
            </h2>
            
            <p className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-10 font-poppins">
              LOGIN TO VIEW YOUR PERSONALIZED FEED :)
            </p>
            
            <Link 
              href="/auth"
              className="inline-block bg-primary text-black px-10 py-4 font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(var(--color-primary),0.3)] font-poppins"
            >
              AUTHENTICATE →
            </Link>
          </m.motion.div>
        </HomeFrame>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]"></div>
          <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">Loading Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col overflow-x-hidden selection:bg-primary selection:text-black">
      <HomeFrame className="pt-12 pb-20" showPattern={true}>
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          <FadeIn>
            <BentoGrid>
              {/* Row 1: Full Row Tournament List */}
              <BentoItem colSpan={4} rowSpan={1}>
                <TournamentList tournaments={tournaments} variant="bento" />
              </BentoItem>

              {/* Row 2: Profile (2x1) + Rank (1x1) + Points (1x1) */}
              <BentoItem colSpan={2} rowSpan={1}>
                <ProfileHeader 
                  user={user} 
                  variant="bento" 
                  isOwnProfile={true}
                  onLogout={handleLogout}
                />
              </BentoItem>
              
              <BentoItem colSpan={1} rowSpan={1} className="flex flex-col items-center justify-center bg-surface p-8 group h-full">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 font-poppins w-full text-left">GLOBAL RANK</div>
                <div className="text-7xl font-black text-white tracking-tighter group-hover:text-primary transition-colors">
                  #{stats.rank || "--"}
                </div>
              </BentoItem>

              <BentoItem colSpan={1} rowSpan={1} className="flex flex-col items-center justify-center bg-surface p-8 group h-full">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 font-poppins w-full text-left">TOTAL POINTS</div>
                <div className="text-7xl font-black text-white tracking-tighter group-hover:text-primary transition-colors">
                  {stats.points || "00"}
                </div>
              </BentoItem>

              {/* Row 3 - Left: Full Width Stats (4x1) */}
              <BentoItem colSpan={4} rowSpan={1}>
                <StatsGrid stats={stats} variant="bento" />
              </BentoItem>

              {/* Row 4: Match History (2x2) + Leaderboard (2x2) */}
              <BentoItem colSpan={2} rowSpan={2}>
                <MatchHistory activities={activities} variant="bento" />
              </BentoItem>

              <BentoItem colSpan={2} rowSpan={2}>
                <LeaderboardTable entries={leaderboard} variant="bento" limit={8} />
              </BentoItem>
            </BentoGrid>
          </FadeIn>
        </div>
      </HomeFrame>
    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
