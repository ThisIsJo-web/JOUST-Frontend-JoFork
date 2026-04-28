"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Match, Round, LeaderboardEntry } from "../types";
import MatchCard from "../components/MatchCard";

interface EliminationLayoutProps {
    tournament: any;
    leaderboard: LeaderboardEntry[];
    isAdmin: boolean;
    updating: string | null;
    onOpenScoring: (match: Match) => void;
}

type Tab = "WINNERS" | "LOSERS" | "GRAND_FINAL";

export default function EliminationLayout({
    tournament,
    leaderboard,
    isAdmin,
    updating,
    onOpenScoring
}: EliminationLayoutProps) {
    const isDoubleElim = tournament.format === "DOUBLE_ELIMINATION";
    const [activeTab, setActiveTab] = useState<Tab>("WINNERS");
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const winnersRef = useRef<HTMLDivElement>(null);
    const losersRef = useRef<HTMLDivElement>(null);
    const grandFinalRef = useRef<HTMLDivElement>(null);

    // Zoom state
    const [zoom, setZoom] = useState(0.8);

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
    const internalCanvasHeight = Math.max(1000, maxMatches * 220);

    const grandChampion = tournament?.status === "COMPLETED" && leaderboard.length > 0 ? leaderboard[0] : null;

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
            setZoom(1.2); // Zoom in when navigating to tracked player match
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }, 100);
            setTrackIndex(idx);
        }
    };

    const handleMatchClick = (match: Match) => {
        setZoom(1.2); // Zoom in when clicking a match
        onOpenScoring(match);
        setTimeout(() => {
            document.getElementById(`match-${match.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 100);
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
        const refMap = { "WINNERS": winnersRef, "LOSERS": losersRef, "GRAND_FINAL": grandFinalRef };
        const target = refMap[tab].current;
        if (target && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const left = target.offsetLeft - 48;
            container.scrollTo({ left, behavior: 'smooth' });
            setActiveTab(tab);
        }
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current || !isDoubleElim || isDragging) return;
        const container = scrollContainerRef.current;
        const scrollCenter = container.scrollLeft + container.offsetWidth / 2;
        const scrollRight = container.scrollLeft + container.offsetWidth;
        const isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 100;

        const winnersPos = winnersRef.current ? winnersRef.current.offsetLeft : 0;
        const losersPos = losersRef.current ? losersRef.current.offsetLeft : 0;
        const grandFinalPos = grandFinalRef.current ? grandFinalRef.current.offsetLeft : 0;

        if (grandFinalRef.current && (scrollRight >= grandFinalPos + 20 || isAtEnd)) {
            setActiveTab("GRAND_FINAL");
        } else if (losersRef.current && scrollCenter >= losersPos) {
            setActiveTab("LOSERS");
        } else {
            setActiveTab("WINNERS");
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setStartY(e.pageY - scrollContainerRef.current.offsetTop);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        setScrollTop(scrollContainerRef.current.scrollTop);
        setDragDistance(0);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const y = e.pageY - scrollContainerRef.current.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
        scrollContainerRef.current.scrollTop = scrollTop - walkY;
        setDragDistance(Math.max(Math.abs(x - startX), Math.abs(y - startY)));
    };

    const renderRound = (round: Round, totalInGroup: number) => {
        const matchCount = round.matches.length;
        const h = internalCanvasHeight;

        return (
            <div key={round.id} className="flex flex-col gap-8 shrink-0 w-80 md:w-96 relative" style={{ height: `${h}px` }}>
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
                                    handleMatchClick(match);
                                }} 
                                className="shrink-0"
                            >
                                <MatchCard 
                                    match={match} 
                                    onOpenScoring={() => handleMatchClick(match)} 
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
        <div className="flex flex-col gap-8 shrink-0 w-80 md:w-96" style={{ height: `${internalCanvasHeight}px` }}>
            <h2 className="text-[8px] font-black text-primary uppercase tracking-[0.5em] border-b border-white/5 pb-2 text-center font-poppins shrink-0">
                Champion
            </h2>
            <div className="flex flex-col justify-center flex-1 items-center">
                <div className={`w-72 p-16 flex flex-col items-center justify-center gap-8 transition-all duration-700 shadow-2xl ${grandChampion ? 'bg-primary text-white border-primary' : 'bg-foreground/5 border border-dashed border-foreground/10'}`}>
                    <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${grandChampion ? 'border-white/40 text-white' : 'border-foreground/10 text-foreground/10'}`}>
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-poppins ${grandChampion ? 'text-white/60' : 'text-foreground/20'}`}>The Ultimate Winner</span>
                        <span className={`text-3xl font-black uppercase tracking-tighter font-poppins leading-tight ${grandChampion ? 'text-white' : 'text-foreground/10'}`}>
                            {grandChampion?.guestName || grandChampion?.username || "AWAITING..."}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const trackedUser = leaderboard.find(u => u.userId === trackedUserId);

    return (
        <div className="space-y-6">
            {/* Player Tracker Overlay */}
            {trackedUserId && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6 animate-in slide-in-from-bottom-12 duration-700">
                    <div className="bg-background/90 backdrop-blur-xl border border-primary/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(82,185,70,0.2)]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black">
                                    {trackedUser?.username?.[0]?.toUpperCase() || "C"}
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] font-poppins">Currently Tracking</p>
                                    <p className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{trackedUser?.guestName || trackedUser?.username}</p>
                                </div>
                            </div>
                            <button onClick={() => setTrackedUserId(null)} className="p-2 text-foreground/20 hover:text-white transition-all text-sm font-black">✕</button>
                        </div>
                        <div className="flex items-center justify-between gap-4 bg-foreground/5 p-1 rounded-2xl border border-white/5">
                            <button onClick={() => navigateToTrackedMatch(Math.max(0, trackIndex - 1))} disabled={trackIndex === 0} className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary disabled:opacity-10 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg></button>
                            <div className="flex flex-col items-center"><span className="text-[10px] font-black text-foreground uppercase tracking-tight">{trackedMatches.length > 0 ? `Match ${trackIndex + 1} of ${trackedMatches.length}` : "No Matches Found"}</span></div>
                            <button onClick={() => navigateToTrackedMatch(Math.min(trackedMatches.length - 1, trackIndex + 1))} disabled={trackIndex === trackedMatches.length - 1 || trackedMatches.length === 0} className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary disabled:opacity-10 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg></button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4">
                <div className="flex flex-wrap items-center gap-4">
                    {isDoubleElim ? (
                        <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-2xl w-fit border border-white/5">
                            <button onClick={() => handleTabClick("WINNERS")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${activeTab === "WINNERS" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground'}`}>Winners</button>
                            <button onClick={() => handleTabClick("LOSERS")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${activeTab === "LOSERS" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground'}`}>Losers</button>
                            <button onClick={() => handleTabClick("GRAND_FINAL")} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${activeTab === "GRAND_FINAL" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground'}`}>Grand Final</button>
                        </div>
                    ) : <div />}
                    <select value={trackedUserId || ""} onChange={(e) => { const id = e.target.value || null; setTrackedUserId(id); if (id) setTimeout(() => navigateToTrackedMatch(0), 100); }} className="bg-foreground/5 text-foreground/40 hover:text-primary border border-white/5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all"><option value="">Track Combatant</option>{leaderboard.map(u => (<option key={u.userId} value={u.userId}>{u.guestName || u.username}</option>))}</select>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-2xl border border-white/5">
                        <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))} className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary hover:bg-primary/10 transition-all font-black text-lg">－</button>
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest px-2">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary hover:bg-primary/10 transition-all font-black text-lg">＋</button>
                        <button onClick={() => setZoom(0.8)} className="px-4 py-2 text-[8px] font-black text-foreground/20 hover:text-primary uppercase tracking-widest transition-all">Reset</button>
                    </div>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`overflow-auto h-[80vh] custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} bg-black/5 rounded-[3rem] border border-white/5`}
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
                    <div ref={winnersRef} className="flex gap-20 items-start">
                        {winnersRounds.map(r => renderRound(r, winnersRounds.length))}
                        {!isDoubleElim && renderChampion()}
                    </div>
                    {isDoubleElim && (
                        <>
                            <div ref={losersRef} className="flex gap-20 items-start border-l border-white/5 pl-20">
                                {losersRounds.map(r => renderRound(r, losersRounds.length))}
                            </div>
                            <div ref={grandFinalRef} className="flex gap-20 items-start border-l border-white/5 pl-20">
                                {grandFinals.map(r => renderRound(r, 1))}
                                {renderChampion()}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 185, 70, 0.3); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 185, 70, 0.5); }
            `}</style>
        </div>
    );
}
