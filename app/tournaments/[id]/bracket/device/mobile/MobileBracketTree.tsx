"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Match, Round, LeaderboardEntry } from "../../types";
import MatchCard from "../../components/MatchCard";

interface MobileBracketTreeProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match) => void;
    addLog: (action: string, details?: string) => void;
    trackedUserId: string | null;
    setTrackedUserId: (id: string | null) => void;
}

export default function MobileBracketTree({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog,
    trackedUserId,
    setTrackedUserId
}: MobileBracketTreeProps) {
    const [zoom, setZoom] = useState(0.5);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const rounds = tournament?.rounds || [];
    const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
    const winnersRounds = sortedRounds.filter(r => r.roundNumber < 100);
    const losersRounds = sortedRounds.filter(r => r.roundNumber >= 100 && r.roundNumber < 200);
    const grandFinals = sortedRounds.filter(r => r.roundNumber >= 200);

    const maxMatches = Math.max(...sortedRounds.map(r => r.matches.length), 1);
    const canvasHeight = Math.max(1200, maxMatches * 180);

    const trackedMatches = useMemo(() => {
        if (!trackedUserId) return [];
        const allMatches: Match[] = [];
        sortedRounds.forEach((r: Round) => {
            r.matches.forEach((m: Match) => {
                if (m.player1?.id === trackedUserId || m.player2?.id === trackedUserId) {
                    allMatches.push(m);
                }
            });
        });
        return allMatches;
    }, [trackedUserId, sortedRounds]);

    const [trackIndex, setTrackIndex] = useState(0);

    const navigateToTrackedMatch = (idx: number) => {
        const match = trackedMatches[idx];
        if (!match) return;

        const element = document.getElementById(`match-mobile-${match.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            setTrackIndex(idx);
        }
    };

    const getRoundLabel = (round: Round) => {
        const num = round.roundNumber;
        if (num >= 200) return "Grand Final";
        if (num >= 100) return `Losers R${num - 100}`;
        return `Round ${num}`;
    };

    return (
        <div className="h-full flex flex-col bg-background relative overflow-hidden">
            {/* Mobile Tracker Overlay */}
            {trackedUserId && trackedMatches.length > 0 && (
                <div className="fixed top-24 left-4 right-4 z-[70] animate-in slide-in-from-top-8 duration-500">
                    <div className="bg-primary/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-black text-xs">
                                {leaderboard.find(u => u.userId === trackedUserId)?.username?.[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-white/60 uppercase tracking-widest leading-none">Tracking</p>
                                <p className="text-[10px] font-black text-white uppercase tracking-tight">{leaderboard.find(u => u.userId === trackedUserId)?.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => navigateToTrackedMatch(Math.max(0, trackIndex - 1))}
                                disabled={trackIndex === 0}
                                className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white disabled:opacity-20"
                            >
                                ←
                            </button>
                            <span className="text-[9px] font-black text-white w-12 text-center">{trackIndex + 1} / {trackedMatches.length}</span>
                            <button 
                                onClick={() => navigateToTrackedMatch(Math.min(trackedMatches.length - 1, trackIndex + 1))}
                                disabled={trackIndex === trackedMatches.length - 1}
                                className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white disabled:opacity-20"
                            >
                                →
                            </button>
                            <button onClick={() => setTrackedUserId(null)} className="ml-2 w-8 h-8 flex items-center justify-center text-white/40 font-black text-xs">✕</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimal Mobile Toolbar */}
            <div className="bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5 shrink-0">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tactical Bracket View</span>
                <div className="flex items-center gap-4">
                    <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-primary font-black">-</button>
                    <span className="text-[8px] font-black text-white w-8 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(1.0, zoom + 0.1))} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-primary font-black">+</button>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-auto no-scrollbar relative"
            >
                <div 
                    style={{ 
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: 'max-content',
                        height: `${canvasHeight}px`
                    }}
                    className="p-10 flex gap-12 items-start"
                >
                    {winnersRounds.map((round) => (
                        <div key={round.id} className="relative h-full w-64 flex flex-col items-center shrink-0">
                             <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] border-b border-white/5 pb-2 mb-8 w-full text-center">
                                {getRoundLabel(round)}
                             </h2>
                             <div className="relative flex-1 w-full">
                                {round.matches.map((match: Match, i: number) => {
                                    const matchCount = round.matches.length;
                                    const topPos = (canvasHeight / (matchCount + 1)) * (i + 1) - 60;
                                    return (
                                        <div 
                                            key={match.id}
                                            id={`match-mobile-${match.id}`}
                                            style={{ top: `${topPos}px`, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                                            onClick={() => onOpenScoring(match)}
                                            className="shrink-0"
                                        >
                                            <MatchCard 
                                                match={match} 
                                                onOpenScoring={() => {}} 
                                                isAdmin={isAdmin}
                                                isUpdating={updating === match.id}
                                                leaderboard={leaderboard}
                                                trackedUserId={trackedUserId}
                                            />
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                    ))}

                    {losersRounds.length > 0 && (
                        <div className="flex gap-12 border-l border-white/5 pl-12">
                            {losersRounds.map((round) => (
                                <div key={round.id} className="relative h-full w-64 flex flex-col items-center shrink-0">
                                     <h2 className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.4em] border-b border-white/5 pb-2 mb-8 w-full text-center">
                                        {getRoundLabel(round)}
                                     </h2>
                                     <div className="relative flex-1 w-full">
                                        {round.matches.map((match: Match, i: number) => {
                                            const matchCount = round.matches.length;
                                            const topPos = (canvasHeight / (matchCount + 1)) * (i + 1) - 60;
                                            return (
                                                <div 
                                                    key={match.id}
                                                    id={`match-mobile-${match.id}`}
                                                    style={{ top: `${topPos}px`, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                                                    onClick={() => onOpenScoring(match)}
                                                    className="shrink-0"
                                                >
                                                    <MatchCard 
                                                        match={match} 
                                                        onOpenScoring={() => {}} 
                                                        isAdmin={isAdmin}
                                                        isUpdating={updating === match.id}
                                                        leaderboard={leaderboard}
                                                        trackedUserId={trackedUserId}
                                                    />
                                                </div>
                                            );
                                        })}
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {grandFinals.map((round) => (
                        <div key={round.id} className="relative h-full w-64 flex flex-col items-center shrink-0 border-l border-white/10 pl-12">
                             <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] border-b border-white/5 pb-2 mb-8 w-full text-center">
                                {getRoundLabel(round)}
                             </h2>
                             <div className="relative flex-1 w-full">
                                {round.matches.map((match: Match, i: number) => {
                                    const matchCount = round.matches.length;
                                    const topPos = (canvasHeight / (matchCount + 1)) * (i + 1) - 60;
                                    return (
                                        <div 
                                            key={match.id}
                                            id={`match-mobile-${match.id}`}
                                            style={{ top: `${topPos}px`, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                                            onClick={() => onOpenScoring(match)}
                                            className="shrink-0"
                                        >
                                            <MatchCard 
                                                match={match} 
                                                onOpenScoring={() => {}} 
                                                isAdmin={isAdmin}
                                                isUpdating={updating === match.id}
                                                leaderboard={leaderboard}
                                                trackedUserId={trackedUserId}
                                            />
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
