"use client";

import React, { useState, useMemo } from "react";
import { Match, Round, LeaderboardEntry } from "../../types";
import MatchCard from "../../components/MatchCard";

interface MobileCombatFeedProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match) => void;
    addLog: (action: string, details?: string) => void;
}

export default function MobileCombatFeed({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog
}: MobileCombatFeedProps) {
    const [activePhase, setActivePhase] = useState<number>(0);
    const [trackedUserId, setTrackedUserId] = useState<string | null>(null);

    const rounds = tournament?.rounds || [];
    const sortedRounds = useMemo(() => {
        return [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
    }, [rounds]);

    const activeRound = sortedRounds[activePhase];

    const getRoundLabel = (round: Round) => {
        const num = round.roundNumber;
        if (num >= 200) return "Grand Final";
        if (num >= 100) return `Losers Round ${num - 100}`;
        return `Round ${num}`;
    };

    const handleTrackParticipant = (id: string | null) => {
        setTrackedUserId(id);
        if (id) {
            const user = leaderboard.find(u => u.userId === id);
            addLog("TRACKING", `MONITORING: ${user?.guestName || user?.username}`);
        }
    };

    const handlePhaseChange = (idx: number) => {
        setActivePhase(idx);
        const round = sortedRounds[idx];
        if (round) {
            addLog("PHASE_SHIFT", `NAVIGATED TO ${getRoundLabel(round).toUpperCase()}`);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 px-4 pb-20 overflow-y-auto no-scrollbar">
            {/* Mobile Tactical Header */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pt-4 pb-2 space-y-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <select 
                        value={trackedUserId || ""} 
                        onChange={(e) => handleTrackParticipant(e.target.value || null)}
                        className="flex-1 bg-foreground/5 text-foreground/60 border border-white/5 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none"
                    >
                        <option value="">Track Participant</option>
                        {leaderboard.map(u => (
                            <option key={u.userId} value={u.userId}>{u.guestName || u.username}</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            addLog("NAV_COMMAND", "SCROLL TO LEADERBOARD");
                        }}
                        className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {sortedRounds.map((round, idx) => (
                        <button
                            key={round.id}
                            onClick={() => handlePhaseChange(idx)}
                            className={`shrink-0 px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activePhase === idx ? 'bg-primary text-white' : 'bg-foreground/5 text-foreground/20'}`}
                        >
                            {getRoundLabel(round)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Combat Feed */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins">
                        {activeRound ? getRoundLabel(activeRound) : "No Data"}
                    </h2>
                    <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">
                        {activeRound?.matches.length || 0} Matchups
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {activeRound?.matches.map((match: Match) => (
                        <div key={match.id} className="w-full">
                            <MatchCard 
                                match={match}
                                onOpenScoring={() => onOpenScoring(match)}
                                isAdmin={isAdmin}
                                isUpdating={updating === match.id}
                                leaderboard={leaderboard}
                                trackedUserId={trackedUserId}
                                showPoints={tournament?.format === "SWISS"}
                            />
                        </div>
                    ))}
                </div>

                {/* Champion Section */}
                {activePhase === sortedRounds.length - 1 && (
                    <div className="mt-12 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Tournament Champion</span>
                        <div className={`w-full p-10 flex flex-col items-center justify-center gap-6 rounded-3xl ${tournament?.status === "COMPLETED" ? 'bg-primary text-white' : 'bg-foreground/5 border border-dashed border-white/10'}`}>
                            <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter">
                                {tournament?.status === "COMPLETED" ? (leaderboard[0]?.guestName || leaderboard[0]?.username) : "AWAITING RESULTS"}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
