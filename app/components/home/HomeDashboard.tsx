"use client";
import React from "react";
import FadeIn from "../FadeIn";
import TournamentHero, { TournamentHeroContent } from "../tournaments/TournamentHero";
import ProfileHeader from "../profile/ProfileHeader";
import MatchHistory from "../profile/MatchHistory";
import LeaderboardTable from "../leaderboard/LeaderboardTable";

interface HomeDashboardProps {
    user: any;
    tournaments: any[];
    leaderboard: any[];
    stats: any;
    handleLogout: () => void;
}

export default function HomeDashboard({ user, tournaments, leaderboard, stats, handleLogout }: HomeDashboardProps) {
    const canManage = user?.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER");

    return (
        <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-[2.25fr_1.75fr] lg:grid-rows-[auto_auto_1fr] gap-6 md:gap-8 items-stretch">
                {/* HERO: TOP LEFT (Spans 2 rows) */}
                <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2 flex flex-col min-h-[400px]">
                    <TournamentHeroContent 
                        tournaments={tournaments} 
                        canManage={canManage} 
                        currentUserId={user?.id || user?.sub}
                    />
                </div>

                {/* PROFILE: TOP RIGHT (Row 1) */}
                <div className="lg:col-start-2 lg:row-start-1 flex flex-col">
                    <ProfileHeader 
                        user={user} 
                        variant="bento" 
                        isOwnProfile={true}
                        onLogout={handleLogout}
                    />
                </div>

                {/* TACTICAL STATS: MIDDLE RIGHT (Row 2) */}
                <div className="lg:col-start-2 lg:row-start-2 grid grid-cols-2 gap-4">
                    {/* Rank Card */}
                    <div className="bg-black border border-white/5 p-8 flex flex-col justify-between group hover:border-primary/40 transition-all min-h-[140px]">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">RANK</span>
                        <div className="text-5xl font-black text-white italic group-hover:text-primary transition-colors">#{stats?.rank || "--"}</div>
                    </div>
                    {/* Performance Card */}
                    <div className="bg-black border border-white/5 p-8 flex flex-col justify-between group hover:border-primary/40 transition-all min-h-[140px]">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">WIN_LOSS</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-primary">{stats?.wins || 0}</span>
                            <span className="text-sm text-white/20 font-black">/</span>
                            <span className="text-3xl font-black text-white/40">{stats?.losses || 0}</span>
                        </div>
                    </div>
                </div>

                {/* RECENT ACTIVITY: BOTTOM LEFT (Row 3) */}
                <div className="lg:col-start-1 lg:row-start-3 flex flex-col min-h-[450px]">
                    <MatchHistory userId={user?.id || user?.sub} />
                </div>

                {/* LEADERBOARDS: BOTTOM RIGHT (Row 3) */}
                <div className="lg:col-start-2 lg:row-start-3 flex flex-col min-h-[450px] bg-black border border-white/5 overflow-hidden">
                    <LeaderboardTable 
                        entries={leaderboard} 
                        variant="bento" 
                        limit={10} 
                    />
                </div>
            </div>
        </FadeIn>
    );
}
