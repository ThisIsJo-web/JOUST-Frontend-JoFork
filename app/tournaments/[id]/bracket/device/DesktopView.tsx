"use client";

import React from "react";
import { Match, LeaderboardEntry } from "../types";
import EliminationLayout from "../Formats/EliminationLayout";
import DesktopRoundTable from "./desktop/DesktopRoundTable";

interface DesktopViewProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match, pos?: {x: number, y: number}) => void;
    addLog: (action: string, details?: string) => void;
    viewMode: "CARD" | "BRACKET";
}

export default function DesktopView({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog,
    viewMode
}: DesktopViewProps) {
    const fs = tournament?.format?.system;
    const isElimination = fs === "SINGLE_ELIMINATION" || fs === "DOUBLE_ELIMINATION" || fs === "HYBRID";

    return (
        <div className="h-full w-full">
            {isElimination && viewMode === "BRACKET" ? (
                <EliminationLayout 
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
