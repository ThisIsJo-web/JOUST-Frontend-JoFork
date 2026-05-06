"use client";

import React from "react";
import { Match, LeaderboardEntry } from "../types";
import MobileCombatFeed from "./mobile/MobileCombatFeed";

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
    return (
        <div className="h-full w-full">
            <MobileCombatFeed 
                tournament={tournament}
                leaderboard={leaderboard}
                isAdmin={isAdmin}
                updating={updating}
                onOpenScoring={onOpenScoring}
                addLog={addLog}
            />
        </div>
    );
}
