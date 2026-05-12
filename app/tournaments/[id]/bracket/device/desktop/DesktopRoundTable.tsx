"use client";

import React, { useState, useRef } from "react";
import { Match, Round, LeaderboardEntry } from "../../types";
import MatchCard from "../../../../../components/tournaments/bracket/MatchCard";

interface DesktopRoundTableProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match, pos?: {x: number, y: number}) => void;
    addLog: (action: string, details?: string) => void;
}

export default function DesktopRoundTable({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog
}: DesktopRoundTableProps) {
    const rounds: Round[] = tournament?.rounds || [];
    const sortedRounds: Round[] = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
    
    // Default to the latest ongoing round or the last round
    const initialRound = sortedRounds.find(r => r.matches.some((m: Match) => m.status !== 'COMPLETED'))?.roundNumber 
                       || sortedRounds[sortedRounds.length - 1]?.roundNumber 
                       || 1;
    
    const [activeRound, setActiveRound] = useState<number>(initialRound);

    const currentRound: Round | undefined = sortedRounds.find(r => r.roundNumber === activeRound);

    return (
        <div className="h-full flex flex-col bg-neutral-950/20">
            {/* Phase Tabs - Floating at top */}
            <div className="flex gap-px overflow-x-auto no-scrollbar bg-white/5 border-b border-white/5">
                {sortedRounds.map((round) => (
                    <button
                        key={round.id}
                        onClick={() => setActiveRound(round.roundNumber)}
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all min-w-[140px] border-r border-white/5 relative group ${
                            activeRound === round.roundNumber
                            ? "bg-primary text-background"
                            : "bg-transparent text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
                        }`}
                    >
                        {(() => {
                            const n = round.roundNumber;
                            const fs = tournament?.format?.system;
                            if (n >= 200) return "Grand Finals";
                            if (n >= 101) return `Losers Round ${n - 100}`;
                            if (fs === "DOUBLE_ELIMINATION") return `Winners Round ${n}`;
                            return `Round ${n}`;
                        })()}
                        {activeRound === round.roundNumber && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/40" />
                        )}
                    </button>
                ))}
                <div className="flex-1 border-white/5" />
                <div className="px-6 flex items-center">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest italic">
                        {(tournament?.format?.system === "HYBRID" ? "TOP CUT" : (tournament?.format?.system?.replace("_", " ") || "UNKNOWN"))} ANALYTICS
                    </span>
                </div>
            </div>

            {/* Active Round Matches */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
                {currentRound ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 py-4">
                        {currentRound.matches.map((match: Match, i: number) => (
                            <div 
                                key={match.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="mb-3 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">
                                        Engagement {(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    {match.isBye && (
                                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic">
                                            Auto-Advance
                                        </span>
                                    )}
                                </div>
                                <div 
                                    onClick={(e) => {
                                        onOpenScoring(match, {x: e.clientX, y: e.clientY});
                                        addLog("COMMAND", `SCORING MATCH IN PHASE ${activeRound}`);
                                    }}
                                    className="cursor-pointer [&>div]:w-full"
                                >
                                    <MatchCard 
                                        match={match} 
                                        onOpenScoring={() => {}} 
                                        isAdmin={isAdmin}
                                        isUpdating={updating === match.id}
                                        leaderboard={leaderboard}
                                        showPoints={tournament?.format?.system === "SWISS"}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-neutral-800 rounded-[2.5rem]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 italic animate-pulse">
                            Awaiting round data...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
