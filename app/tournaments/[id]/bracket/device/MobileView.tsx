"use client";

import React from "react";
import { Match, LeaderboardEntry } from "../types";
import MobileCombatFeed from "./mobile/MobileCombatFeed";
import MobileBracketTree from "./mobile/MobileBracketTree";

interface MobileViewProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match) => void;
    addLog: (action: string, details?: string) => void;
}

export default function MobileView({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog
}: MobileViewProps) {
    const isElimination = tournament?.format === "SINGLE_ELIMINATION" || tournament?.format === "DOUBLE_ELIMINATION";
    const [viewMode, setViewMode] = React.useState<"FEED" | "BRACKET">("FEED");
    const [trackedUserId, setTrackedUserId] = React.useState<string | null>(null);
    const [activePhase, setActivePhase] = React.useState<number>(0);

    return (
        <div className="h-full w-full overflow-hidden relative">
            {isElimination && viewMode === "BRACKET" ? (
                <div className="h-full w-full overflow-auto">
                    <MobileBracketTree 
                        tournament={tournament}
                        leaderboard={leaderboard}
                        isAdmin={isAdmin}
                        updating={updating}
                        onOpenScoring={onOpenScoring}
                        addLog={addLog}
                        trackedUserId={trackedUserId}
                        setTrackedUserId={setTrackedUserId}
                    />
                </div>
            ) : (
                <MobileCombatFeed 
                    tournament={tournament}
                    leaderboard={leaderboard}
                    isAdmin={isAdmin}
                    updating={updating}
                    onOpenScoring={onOpenScoring}
                    addLog={addLog}
                    trackedUserId={trackedUserId}
                    setTrackedUserId={setTrackedUserId}
                    activePhase={activePhase}
                    setActivePhase={setActivePhase}
                />
            )}

            {/* View Toggle for Elimination Formats */}
            {isElimination && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex bg-black/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl">
                    <button 
                        onClick={() => {
                            setViewMode("FEED");
                            addLog("NAV_COMMAND", "SWITCHED TO COMBAT FEED");
                        }}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === "FEED" ? 'bg-primary text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Feed
                    </button>
                    <button 
                        onClick={() => {
                            setViewMode("BRACKET");
                            addLog("NAV_COMMAND", "SWITCHED TO TACTICAL TREE");
                        }}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === "BRACKET" ? 'bg-primary text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Bracket
                    </button>
                </div>
            )}
        </div>
    );
}
