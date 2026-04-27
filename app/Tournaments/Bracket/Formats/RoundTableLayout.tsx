"use client";

import React, { useState } from "react";
import { Match, Round, LeaderboardEntry } from "../types";
import MatchCard from "../components/MatchCard";

interface RoundTableLayoutProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match, pos?: {x: number, y: number}) => void;
}

export default function RoundTableLayout({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring
}: RoundTableLayoutProps) {
    const [mobileRoundIndex, setMobileRoundIndex] = useState(0);
    const rounds = tournament?.rounds || [];

    const handleMobileNav = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setMobileRoundIndex(prev => Math.max(0, prev - 1));
        } else {
            setMobileRoundIndex(prev => Math.min(rounds.length - 1, prev + 1));
        }
    };

    return (
        <div className="space-y-8 lg:space-y-12">
            {/* Mobile Navigation Console */}
            <div className="lg:hidden flex items-center justify-between gap-4 flex-1 bg-foreground/5 p-1 rounded-2xl border border-white/5">
                <button 
                    onClick={() => handleMobileNav("prev")}
                    disabled={mobileRoundIndex === 0}
                    className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary disabled:opacity-10 transition-all active:scale-90"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                </button>
                
                <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em] mb-0.5">Arena Terminal</span>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                        Round {mobileRoundIndex + 1}/{rounds.length}
                    </span>
                </div>

                <button 
                    onClick={() => handleMobileNav("next")}
                    disabled={mobileRoundIndex === rounds.length - 1}
                    className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary disabled:opacity-10 transition-all active:scale-90"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>

            <div className="overflow-x-auto pb-12 custom-scrollbar">
                <div className="flex gap-20 min-w-max items-start px-12">
                    {rounds.map((round: Round, i: number) => (
                        <div 
                            key={round.id} 
                            onClick={(e) => {
                                e.stopPropagation();
                                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                            }}
                            className={`flex flex-col gap-8 transition-all duration-500 cursor-pointer group/round shrink-0
                                ${mobileRoundIndex === i ? 'max-lg:flex' : 'max-lg:hidden'}
                                lg:flex h-[calc(100vh-280px)] lg:h-[800px] w-full lg:w-auto`}
                        >
                            <h2 className="text-[8px] font-black text-foreground/20 group-hover/round:text-primary uppercase tracking-[0.5em] border-b border-foreground/5 pb-2 text-center font-poppins transition-colors shrink-0">
                                ROUND {round.roundNumber}
                            </h2>
                            <div className="flex flex-col gap-16 md:gap-24 lg:gap-32 justify-center flex-1 overflow-y-auto no-scrollbar py-8">
                                {round.matches.map((match: Match) => (
                                    <div 
                                        key={match.id} 
                                        onClick={(e) => onOpenScoring(match, {x: e.clientX, y: e.clientY})}
                                        className="shrink-0 flex justify-center"
                                    >
                                        <MatchCard 
                                            match={match} 
                                            onOpenScoring={() => {}} // Handled by parent container
                                            isAdmin={isAdmin}
                                            isUpdating={updating === match.id}
                                            leaderboard={leaderboard}
                                            showPoints={tournament?.format === "SWISS"}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
