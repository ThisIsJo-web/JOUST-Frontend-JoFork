"use client";
import React from "react";
import FadeIn from "../FadeIn";
import { BentoGrid, BentoItem } from "../ui/Bento";
import TournamentList from "../tournaments/TournamentList";
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
            <BentoGrid>
                {/* Row 1: Full Row Tournament List */}
                <BentoItem colSpan={4} rowSpan={1}>
                    <TournamentList 
                        tournaments={tournaments} 
                        variant="bento" 
                        canManage={canManage}
                    />
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
                
                <BentoItem colSpan={1} rowSpan={1} className="flex flex-col items-center justify-center bg-black p-8 group h-full">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 font-poppins w-full text-left">RANK</div>
                    <div className="text-7xl font-black text-white tracking-tighter group-hover:text-primary transition-colors italic font-poppins">
                        #{stats?.rank || "--"}
                    </div>
                </BentoItem>

                <BentoItem colSpan={1} rowSpan={1} className="flex flex-col items-center justify-center bg-black p-8 group h-full">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 font-poppins w-full text-left">POINTS</div>
                    <div className="text-7xl font-black text-white tracking-tighter group-hover:text-primary transition-colors italic font-poppins">
                        {stats?.points || "00"}
                    </div>
                </BentoItem>

                {/* Row 3: Match History (3x2) + Global Leaderboard Preview (1x2) */}
                <BentoItem colSpan={3} rowSpan={2} className="min-h-[400px]">
                    <MatchHistory userId={user?.id || user?.sub} />
                </BentoItem>

                <BentoItem colSpan={1} rowSpan={2} className="p-0 overflow-hidden">
                    <LeaderboardTable 
                        entries={leaderboard} 
                        variant="bento" 
                        limit={5} 
                    />
                </BentoItem>
            </BentoGrid>
        </FadeIn>
    );
}
