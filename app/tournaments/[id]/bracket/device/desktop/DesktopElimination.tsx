"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Match, Round, LeaderboardEntry } from "../../types";
import MatchCard from "../../../../../components/tournaments/bracket/MatchCard";

interface DesktopEliminationProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match, pos?: { x: number, y: number }) => void;
    addLog: (action: string, details?: string) => void;
}

type Tab = "WINNERS" | "LOSERS" | "GRAND_FINAL";

export default function DesktopElimination({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring,
    addLog
}: DesktopEliminationProps) {
    const isDoubleElim = tournament.format === "DOUBLE_ELIMINATION";
    const [activeTab, setActiveTab] = useState<Tab>("WINNERS");

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Zoom state (0.6 default)
    const [zoom, setZoom] = useState(0.6);

    // 2D Draggable state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);

    // Player Tracking state
    const [trackedUserId, setTrackedUserId] = useState<string | null>(null);
    const [trackIndex, setTrackIndex] = useState(0);

    const winnersRounds = tournament?.rounds?.filter((r: Round) => r.roundNumber < 100) || [];
    const losersRounds = tournament?.rounds?.filter((r: Round) => r.roundNumber >= 100 && r.roundNumber < 200) || [];
    const grandFinals = tournament?.rounds?.filter((r: Round) => r.roundNumber >= 200) || [];

    const maxMatches = Math.max(
        ...winnersRounds.map((r: Round) => r.matches.length),
        ...losersRounds.map((r: Round) => r.matches.length),
        1
    );
    const internalCanvasHeight = Math.max(1000, maxMatches * 180);

    // Determine champion name (prioritize snapshots over leaderboard fallback)
    const getChampionDisplay = () => {
        if (tournament?.winner) return tournament.winner.username;
        if (tournament?.winnerName) return tournament.winnerName;

        // Find the final match in the bracket
        const lastGF = grandFinals[grandFinals.length - 1]?.matches[0];
        if (lastGF) return lastGF.winnerName || lastGF.winner?.username;

        const lastWF = winnersRounds[winnersRounds.length - 1]?.matches[0];
        if (lastWF) return lastWF.winnerName || lastWF.winner?.username;

        return tournament?.status === "COMPLETED" && leaderboard.length > 0 ? leaderboard[0]?.username : "AWAITING...";
    };

    const grandChampionName = getChampionDisplay();
    const isCompleted = tournament?.status === "COMPLETED";

    const trackedMatches = useMemo(() => {
        if (!trackedUserId) return [];
        const allMatches: Match[] = [];
        tournament?.rounds?.forEach((r: Round) => {
            r.matches.forEach((m: Match) => {
                if (m.player1?.id === trackedUserId || m.player2?.id === trackedUserId) {
                    allMatches.push(m);
                }
            });
        });
        return allMatches;
    }, [trackedUserId, tournament]);

    const navigateToTrackedMatch = (idx: number) => {
        const match = trackedMatches[idx];
        if (!match) return;
        const element = document.getElementById(`match-${match.id}`);
        if (element && scrollContainerRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            setTrackIndex(idx);
            addLog("NAVIGATION", `CENTERED MATCH ${idx + 1} FOR TRACKED COMBATANT`);
        }
    };

    const handleMatchClick = (match: Match, e?: React.MouseEvent) => {
        onOpenScoring(match, e ? { x: e.clientX, y: e.clientY } : undefined);
    };

    const getRoundLabel = (round: Round, totalRoundsInGroup: number) => {
        const roundNum = round.roundNumber;
        if (isDoubleElim) {
            if (roundNum >= 200) return "GRAND FINAL";
            if (roundNum >= 100) {
                const losersRoundIdx = roundNum - 100;
                if (losersRoundIdx === totalRoundsInGroup) return "LOSERS SEMIFINAL";
                return `LOSERS R${losersRoundIdx}`;
            }
            if (roundNum === totalRoundsInGroup) return "WINNERS FINAL";
            return `WINNERS R${roundNum}`;
        }
        if (roundNum === totalRoundsInGroup) return "CHAMPIONSHIP";
        if (roundNum === totalRoundsInGroup - 1) return "SEMI-FINALS";
        return `ROUND ${roundNum}`;
    };

    const handleTabClick = (tab: Tab) => {
        let targetId = "";
        if (tab === "WINNERS") {
            const firstRound = winnersRounds[0];
            if (firstRound) targetId = `round-${firstRound.id}`;
        } else if (tab === "LOSERS") {
            const firstRound = losersRounds[0];
            if (firstRound) targetId = `round-${firstRound.id}`;
        } else if (tab === "GRAND_FINAL") {
            const firstRound = grandFinals[0];
            if (firstRound) targetId = `round-${firstRound.id}`;
            else targetId = "champion-section";
        }

        const element = document.getElementById(targetId);
        if (element && scrollContainerRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            setActiveTab(tab);
            addLog("VIEWPORT_SHIFT", `FOCUSED ON ${tab.replace("_", " ")} SECTION`);
        }
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current || !isDoubleElim || isDragging) return;
        const container = scrollContainerRef.current;

        const winnersElem = winnersRounds[0] ? document.getElementById(`round-${winnersRounds[0].id}`) : null;
        const losersElem = losersRounds[0] ? document.getElementById(`round-${losersRounds[0].id}`) : null;
        const gfElem = grandFinals[0] ? document.getElementById(`round-${grandFinals[0].id}`) : document.getElementById("champion-section");

        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        const sections = [
            { id: "WINNERS" as Tab, elem: winnersElem },
            { id: "LOSERS" as Tab, elem: losersElem },
            { id: "GRAND_FINAL" as Tab, elem: gfElem }
        ];

        let closestTab: Tab = activeTab;
        let minDistance = Infinity;

        sections.forEach(section => {
            if (section.elem) {
                const rect = section.elem.getBoundingClientRect();
                const dist = Math.abs((rect.left + rect.width / 2) - centerX);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestTab = section.id;
                }
            }
        });

        if (closestTab !== activeTab) {
            setActiveTab(closestTab);
        }
    };

    const handleTabWheel = (e: React.WheelEvent) => {
        if (scrollContainerRef.current) {
            e.preventDefault();
            scrollContainerRef.current.scrollLeft += e.deltaY + e.deltaX;
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        setScrollTop(scrollContainerRef.current.scrollTop);
        setDragDistance(0);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const walkX = (e.clientX - startX) * 1.5;
        const walkY = (e.clientY - startY) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
        scrollContainerRef.current.scrollTop = scrollTop - walkY;
        setDragDistance(Math.max(Math.abs(e.clientX - startX), Math.abs(e.clientY - startY)));
    };

    const renderRound = (round: Round, totalInGroup: number) => {
        const matchCount = round.matches.length;
        const h = internalCanvasHeight;

        return (
            <div key={round.id} id={`round-${round.id}`} className="flex flex-col gap-8 shrink-0 w-64 lg:w-72 relative" style={{ height: `${h}px` }}>
                <h2 className="text-[8px] font-black text-primary/40 uppercase tracking-[0.5em] border-b border-white/5 pb-2 text-center font-poppins shrink-0">
                    {getRoundLabel(round, totalInGroup)}
                </h2>
                <div className="relative flex-1">
                    {round.matches.map((match: Match, i: number) => {
                        const topPos = (h / (matchCount + 1)) * (i + 1) - 50;
                        return (
                            <div
                                id={`match-${match.id}`}
                                key={match.id}
                                style={{ top: `${topPos}px`, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                                onClick={(e) => {
                                    if (dragDistance > 5) return;
                                    e.stopPropagation();
                                    handleMatchClick(match, e);
                                }}
                                className="shrink-0"
                            >
                                <MatchCard
                                    match={match}
                                    onOpenScoring={() => { }}
                                    isAdmin={isAdmin}
                                    isUpdating={updating === match.id}
                                    leaderboard={leaderboard}
                                    showPoints={false}
                                    trackedUserId={trackedUserId}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderChampion = () => (
        <div id="champion-section" className="flex flex-col gap-8 shrink-0 w-96" style={{ height: `${internalCanvasHeight}px` }}>
            <h2 className="text-[8px] font-black text-primary uppercase tracking-[0.5em] border-b border-white/5 pb-2 text-center font-poppins shrink-0">
                Champion
            </h2>
            <div className="flex flex-col justify-center flex-1 items-center py-20">
                <div className={`w-72 p-16 flex flex-col items-center justify-center gap-8 transition-all duration-700 shadow-2xl ${isCompleted ? 'bg-primary text-white border-primary' : 'bg-foreground/5 border border-dashed border-foreground/10'}`}>
                    <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${isCompleted ? 'border-white/40 text-white' : 'border-foreground/10 text-foreground/10'}`}>
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-poppins ${isCompleted ? 'text-white/60' : 'text-foreground/20'}`}>The Ultimate Winner</span>
                        <span className={`text-3xl font-black uppercase tracking-tighter font-poppins leading-tight ${isCompleted ? 'text-white' : 'text-foreground/10'}`}>
                            {grandChampionName}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const trackedUser = leaderboard.find(u => u.userId === trackedUserId);

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Player Tracker Overlay */}
            {trackedUserId && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6 animate-in slide-in-from-bottom-12 duration-700">
                    <div className="bg-background/90 backdrop-blur-xl border border-primary/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black">
                                    {trackedUser?.username?.[0]?.toUpperCase() || "C"}
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-poppins">Currently Tracking</p>
                                    <p className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{trackedUser?.username}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                        addLog("NAV_COMMAND", "SCROLL TO STANDINGS VIEW");
                                    }}
                                    className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                </button>
                                <button onClick={() => setTrackedUserId(null)} className="p-2 text-foreground/20 hover:text-white transition-all text-sm font-black">✕</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 bg-foreground/5 p-1 rounded-2xl border border-white/5">
                            <button onClick={() => navigateToTrackedMatch(Math.max(0, trackIndex - 1))} disabled={trackIndex === 0} className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary disabled:opacity-10 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
                            <div className="flex flex-col items-center"><span className="text-[10px] font-black text-foreground uppercase tracking-tight">{trackedMatches.length > 0 ? `Match ${trackIndex + 1} of ${trackedMatches.length}` : "No Matches Found"}</span></div>
                            <button onClick={() => navigateToTrackedMatch(Math.min(trackedMatches.length - 1, trackIndex + 1))} disabled={trackIndex === trackedMatches.length - 1 || trackedMatches.length === 0} className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary disabled:opacity-10 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                    {isDoubleElim ? (
                        <div onWheel={handleTabWheel} className="flex items-center gap-2 bg-foreground/5 p-1 rounded-2xl w-fit border border-white/5 cursor-ns-resize">
                            <button onClick={() => handleTabClick("WINNERS")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${activeTab === "WINNERS" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground'}`}>Winners</button>
                            <button onClick={() => handleTabClick("LOSERS")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${activeTab === "LOSERS" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground'}`}>Losers</button>
                            <button onClick={() => handleTabClick("GRAND_FINAL")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${activeTab === "GRAND_FINAL" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground'}`}>Grand Final</button>
                        </div>
                    ) : <div />}
                    <select
                        value={trackedUserId || ""}
                        onChange={(e) => {
                            const id = e.target.value || null;
                            setTrackedUserId(id);
                            if (id) {
                                const u = leaderboard.find(user => user.userId === id);
                                addLog("TELEMETRY", `INITIATING TRACKING FOR: ${u?.username}`);
                                navigateToTrackedMatch(0);
                            }
                        }}
                        className="bg-foreground/5 text-foreground/40 hover:text-primary border border-white/5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all"
                    >
                        <option value="">Track Combatant</option>
                        {leaderboard.map(u => (
                            <option key={u.userId} value={u.userId}>{u.username}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-6 bg-foreground/5 p-1.5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 px-2 border-r border-white/5">
                        <button
                            onClick={() => {
                                const newZoom = Math.max(0.2, zoom - 0.1);
                                setZoom(newZoom);
                                addLog("UI_COMMAND", `MAGNIFICATION REDUCED TO ${Math.round(newZoom * 100)}%`);
                            }}
                            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary hover:bg-primary/10 transition-all font-black text-lg active:scale-90"
                        >-</button>
                        <div className="flex flex-col items-center px-2">
                            <span className="text-[10px] font-black text-white leading-none">{Math.round(zoom * 100)}%</span>
                            <span className="text-[6px] font-black text-neutral-500 uppercase tracking-widest mt-1">Scale</span>
                        </div>
                        <button
                            onClick={() => {
                                const newZoom = Math.min(2, zoom + 0.1);
                                setZoom(newZoom);
                                addLog("UI_COMMAND", `MAGNIFICATION INCREASED TO ${Math.round(newZoom * 100)}%`);
                            }}
                            className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary hover:bg-primary/10 transition-all font-black text-lg active:scale-90"
                        >+</button>
                    </div>
                    <button
                        onClick={() => {
                            setZoom(0.6);
                            addLog("UI_COMMAND", "MAGNIFICATION RESET TO OPTIMAL 60%");
                        }}
                        className="px-4 py-2 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-all"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex-1 min-h-0 overflow-auto custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} bg-black/5 rounded-[3rem] border border-white/5`}
            >
                <div
                    ref={canvasRef}
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: 'max-content',
                        height: 'max-content'
                    }}
                    className="flex gap-20 items-start px-12 pt-12 pb-48"
                >
                    {winnersRounds.map((r: any) => renderRound(r, winnersRounds.length))}

                    {isDoubleElim && (
                        <>
                            <div className="flex gap-20 items-start border-l border-white/5 pl-20">
                                {losersRounds.map((r: any) => renderRound(r, losersRounds.length))}
                            </div>
                            <div className="flex gap-20 items-start border-l border-white/5 pl-20">
                                {grandFinals.map((r: any) => renderRound(r, 1))}
                                {renderChampion()}
                            </div>
                        </>
                    )}
                    {!isDoubleElim && renderChampion()}
                </div>
            </div>
        </div>
    );
}
