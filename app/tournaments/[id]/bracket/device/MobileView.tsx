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
    viewMode: "CARD" | "BRACKET";
}

export default function MobileView({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog,
    viewMode
}: MobileViewProps) {
    const fs = tournament?.format?.system;
    const isElimination = fs === "SINGLE_ELIMINATION" || fs === "DOUBLE_ELIMINATION" || fs === "HYBRID";
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
        </div>
    );
}
