"use client";

import React, { useState, useRef } from "react";
import { Match, Round, LeaderboardEntry } from "../../types";
import MatchCard from "../../components/MatchCard";

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);

    const rounds = tournament?.rounds || [];
    const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        setScrollTop(scrollContainerRef.current.scrollTop);
        setDragDistance(0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const walkX = (e.clientX - startX) * 1.5;
        const walkY = (e.clientY - startY) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
        scrollContainerRef.current.scrollTop = scrollTop - walkY;
        setDragDistance(Math.max(Math.abs(e.clientX - startX), Math.abs(e.clientY - startY)));
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    return (
        <div className="h-full flex flex-col gap-8 px-8 py-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins">
                    Round Table Command
                </h2>
                <div className="flex gap-4">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                        Format: {tournament?.format}
                    </span>
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                        Phases: {rounds.length}
                    </span>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className={`flex-1 min-h-0 overflow-auto custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} pb-8`}
            >
                <div className="flex gap-16 min-w-max items-start">
                    {sortedRounds.map((round: Round) => (
                        <div 
                            key={round.id} 
                            className="flex flex-col gap-8 shrink-0 w-80 md:w-96"
                        >
                            <h2 className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.5em] border-b border-foreground/5 pb-2 text-center font-poppins shrink-0">
                                ROUND {round.roundNumber}
                            </h2>
                            <div className="flex flex-col gap-12 py-4">
                                {round.matches.map((match: Match) => (
                                    <div 
                                        key={match.id} 
                                        onClick={(e) => {
                                            if (dragDistance > 5) return;
                                            onOpenScoring(match, {x: e.clientX, y: e.clientY});
                                            addLog("COMMAND", `SCORING MATCH IN ROUND ${round.roundNumber}`);
                                        }}
                                        className="shrink-0 flex justify-center"
                                    >
                                        <MatchCard 
                                            match={match} 
                                            onOpenScoring={() => {}} 
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
