"use client";

import React from "react";
import { Match, LeaderboardEntry } from "../types";
import DesktopElimination from "./desktop/DesktopElimination";
import DesktopRoundTable from "./desktop/DesktopRoundTable";

interface DesktopViewProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match, pos?: {x: number, y: number}) => void;
    addLog: (action: string, details?: string) => void;
}

export default function DesktopView({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog
}: DesktopViewProps) {
    const isElimination = tournament?.format === "SINGLE_ELIMINATION" || tournament?.format === "DOUBLE_ELIMINATION";

    return (
        <div className="h-full w-full">
            {isElimination ? (
                <DesktopElimination 
                    tournament={tournament}
                    leaderboard={leaderboard}
                    isAdmin={isAdmin}
                    updating={updating}
                    onOpenScoring={onOpenScoring}
                    addLog={addLog}
                />
            ) : (
                <DesktopRoundTable 
                    tournament={tournament}
                    leaderboard={leaderboard}
                    isAdmin={isAdmin}
                    updating={updating}
                    onOpenScoring={onOpenScoring}
                    addLog={addLog}
                />
            )}
        </div>
    );
}
