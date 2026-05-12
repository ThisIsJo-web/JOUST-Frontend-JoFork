"use client";

import React, { useState, useMemo } from "react";
import { Match, Round, LeaderboardEntry } from "../../types";
import MatchCard from "../../../../../components/tournaments/bracket/MatchCard";

interface MobileCombatFeedProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match) => void;
    addLog: (action: string, details?: string) => void;
    trackedUserId: string | null;
    setTrackedUserId: (id: string | null) => void;
    activePhase: number;
    setActivePhase: (idx: number) => void;
}

export default function MobileCombatFeed({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog,
    trackedUserId,
    setTrackedUserId,
    activePhase,
    setActivePhase
}: MobileCombatFeedProps) {

    const rounds = tournament?.rounds || [];
    const sortedRounds = useMemo(() => {
        return [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
    }, [rounds]);

    const activeRound = sortedRounds[activePhase];

    const getRoundLabel = (round: Round) => {
        const num = round.roundNumber;
        const fs = tournament?.format?.system;
        if (num >= 200) return "Grand Finals";
        if (num >= 101) return `Losers Round ${num - 100}`;
        if (fs === "DOUBLE_ELIMINATION") return `Winners Round ${num}`;
        return `Round ${num}`;
    };

    const [trackIndex, setTrackIndex] = useState(0);

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

    const navigateToTrackedMatch = (idx: number, idOverride?: string) => {
        const id = idOverride || trackedUserId;
        if (!id) return;
        
        const match = trackedMatches[idx];
        if (!match) return;

        // Find which phase this match is in
        const phaseIdx = sortedRounds.findIndex((r: Round) => r.matches.some((m: Match) => m.id === match.id));
        if (phaseIdx !== -1 && phaseIdx !== activePhase) {
            setActivePhase(phaseIdx);
        }

        // Scroll the match into view
        setTimeout(() => {
            const element = document.getElementById(`match-mobile-${match.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                setTrackIndex(idx);
            }
        }, 150);
    };

    const handleTrackParticipant = (id: string | null) => {
        setTrackedUserId(id);
        if (id) {
            const user = leaderboard.find(u => u.userId === id);
            addLog("TRACKING", `MONITORING: ${user?.username}`);
            // Reset index and auto-scroll
            setTrackIndex(0);
            setTimeout(() => navigateToTrackedMatch(0, id), 200);
        }
    };

    const handlePhaseChange = (idx: number) => {
        setActivePhase(idx);
        const round = sortedRounds[idx];
        if (round) {
            addLog("PHASE_SHIFT", `NAVIGATED TO ${getRoundLabel(round).toUpperCase()}`);
        }
    };

    const getChampionDisplay = () => {
        if (tournament?.winner) return tournament.winner.username || tournament.winner.guestName;
        if (tournament?.winnerName) return tournament.winnerName;

        // Fallback to searching rounds if status is completed
        if (tournament?.status === "COMPLETED") {
            const allMatches = sortedRounds.flatMap(r => r.matches);
            const finalMatch = allMatches.find(m => !m.nextMatchId && m.status === 'COMPLETED');
            if (finalMatch) {
                return finalMatch.winner?.username || finalMatch.winner?.guestName || finalMatch.winnerName || "Unknown Champion";
            }
        }

        return leaderboard.length > 0 ? leaderboard[0]?.username : "AWAITING RESULTS";
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden relative">
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
                                className="w-10 h-10 rounded-xl bg-[#1B1B1B]/20 flex items-center justify-center text-white disabled:opacity-20 active:scale-90 transition-all"
                            >
                                ←
                            </button>
                            <span className="text-[9px] font-black text-white w-12 text-center">{trackIndex + 1} / {trackedMatches.length}</span>
                            <button 
                                onClick={() => navigateToTrackedMatch(Math.min(trackedMatches.length - 1, trackIndex + 1))}
                                disabled={trackIndex === trackedMatches.length - 1}
                                className="w-10 h-10 rounded-xl bg-[#1B1B1B]/20 flex items-center justify-center text-white disabled:opacity-20 active:scale-90 transition-all"
                            >
                                →
                            </button>
                            <button onClick={() => setTrackedUserId(null)} className="ml-2 w-8 h-8 flex items-center justify-center text-white/40 font-black text-xs">✕</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Tactical Header */}
            <div className="bg-background/95 backdrop-blur-md px-4 pt-4 pb-2 space-y-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <select 
                        value={trackedUserId || ""} 
                        onChange={(e) => handleTrackParticipant(e.target.value || null)}
                        className="flex-1 bg-foreground/5 text-foreground/60 border border-white/5 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none"
                    >
                        <option value="">Search Participant</option>
                        {leaderboard.map(u => (
                            <option key={u.userId} value={u.userId}>{u.username}</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => {
                            addLog("NAV_COMMAND", "SCROLL TO LEADERBOARD");
                            // In a horizontal view, we might not need this, but keeping it for context
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

            {/* Match List - Horizontal Scroll */}
            <div className="flex flex-col gap-4 px-4 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins">
                        {activeRound ? getRoundLabel(activeRound) : "No Data"}
                    </h2>
                    <span className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">
                        {activeRound?.matches.length || 0} Matchups
                    </span>
                </div>

                <div className="grid grid-flow-col grid-rows-2 gap-x-4 gap-y-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8">
                    {activeRound?.matches.map((match: Match, i: number) => (
                        <div key={match.id} id={`match-mobile-${match.id}`} className="shrink-0 w-[42vw] snap-start flex flex-col gap-2 [&>div]:w-full">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">#{i+1}</span>
                            </div>
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
                    
                    {/* Champion Section at end of scroll - spanning both rows */}
                    {activePhase === sortedRounds.length - 1 && (
                        <div className="row-span-2 shrink-0 w-[80vw] snap-center flex flex-col justify-center items-center gap-4 bg-primary/5 rounded-3xl border border-dashed border-primary/20 p-6">
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Tournament Champion</span>
                            <div className={`w-full py-8 flex flex-col items-center justify-center gap-4 rounded-2xl ${tournament?.status === "COMPLETED" ? 'bg-primary text-white' : 'bg-white/5 border border-white/10'}`}>
                                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
                                </div>
                                <span className="text-base font-black uppercase tracking-tighter">
                                    {getChampionDisplay()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
