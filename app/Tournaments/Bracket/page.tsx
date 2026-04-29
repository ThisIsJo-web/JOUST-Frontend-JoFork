"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../utils/api";
import { Match, Round, LeaderboardEntry } from "./types";
import EliminationLayout from "./Formats/EliminationLayout";
import RoundTableLayout from "./Formats/RoundTableLayout";
import DesktopView from "./device/DesktopView";
import MobileView from "./device/MobileView";

function BracketViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tournamentId = searchParams.get("id");

  const [tournament, setTournament] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [logs, setLogs] = useState<{id: string, action: string, details?: string, timestamp: string}[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [guestUsername, setGuestUsername] = useState("");
  const [batchGuestCount, setBatchGuestCount] = useState<string | number>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scoringPosition, setScoringPosition] = useState<{x: number, y: number} | null>(null);
  const [scoringNote, setScoringNote] = useState("");
  const [maximizedPanel, setMaximizedPanel] = useState<"TERMINAL" | "STANDINGS" | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentData();
    } else {
      router.push("/Tournaments");
    }
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (meRes.ok) {
        const meData = await meRes.json();
        const isAuth = meData.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER");
        setIsAdmin(isAuth);
        
        if (isAuth) {
          const usersRes = await authenticatedFetch(API_ENDPOINTS.AUTH.REGISTERED_USERS);
          if (usersRes.ok) setAllUsers(await usersRes.json());
        }
      }

      const tRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!));
      if (tRes.ok) {
        const tData = await tRes.json();
        setTournament(tData);
        addLog(`ARENA LOADED`, `${tData.name.toUpperCase()} STATUS: ${tData.status}`);
      }

      const lRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId!));
      if (lRes.ok) {
        const lData = await lRes.json();
        setLeaderboard(lData);
      }
    } catch (error) {
      addLog("ERROR", "UPLINK CONNECTION FAILED");
    } finally {
      setLoading(false);
    }
  };

  const addLog = (action: string, details?: string) => {
    const newLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      action,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleStartTournament = async () => {
      if (!confirm("Initiate Combat? This will generate the final bracket and lock registration.")) return;
      try {
          const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.START(tournamentId!), { method: "POST" });
          if (res.ok) {
              addLog("ARENA START", "COMBAT INITIATED");
              fetchTournamentData();
          } else {
              const err = await res.json();
              addLog("ERROR", err.message || "START FAILED");
          }
      } catch (error) {
          addLog("ERROR", "UPLINK FAILED");
      }
  };

  const handleJoin = async (userId: string) => {
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId!), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        addLog("REGISTRATION", "COMBATANT SECURED");
        fetchTournamentData();
        return true;
      } else {
        const err = await res.json();
        addLog("ERROR", err.message || "UPLINK REJECTED");
        return false;
      }
    } catch (error) {
      addLog("ERROR", "UPLINK CONNECTION LOST");
      return false;
    }
  };

  const handleAddGuest = async () => {
    if (!guestUsername) return;
    if (tournament && tournament.participants.length >= tournament.maxPlayers) {
      addLog("ERROR", "ARENA CAPACITY EXCEEDED");
      return;
    }

    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: guestUsername }),
      });
      if (res.ok) {
        addLog("REGISTRATION", "GUEST UNIT DEPLOYED");
        setGuestUsername("");
        fetchTournamentData();
      } else {
        const err = await res.json();
        addLog("ERROR", err.message || "DEPLOYMENT FAILED");
      }
    } catch (error) {
      addLog("ERROR", "UPLINK CONNECTION LOST");
    }
  };

  const handleBatchAddGuests = async () => {
    if (!tournament || !batchGuestCount || Number(batchGuestCount) <= 0) return;
    const remaining = tournament.maxPlayers - tournament.participants.length;
    const countToAdd = Math.min(Number(batchGuestCount), remaining);
    
    if (countToAdd <= 0) {
      addLog("ERROR", "ARENA AT CAPACITY");
      return;
    }

    if (!confirm(`Initialize bulk deployment of ${countToAdd} guests?`)) return;

    addLog("BATCH_INIT", `SUMMONING ${countToAdd} COMBATANTS...`);
    
    try {
      const prefixes = ["NEON", "CYBER", "VOLT", "NULL", "VOID", "HEX", "CODE", "DARK", "SHADOW", "GLITCH"];
      const suffixes = ["WRAITH", "RUNNER", "PUNK", "GHOST", "BLADE", "SOUL", "CORE", "SHARD", "WAVE", "NET"];
      
      for (let i = 0; i < countToAdd; i++) {
        const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${suffixes[Math.floor(Math.random() * suffixes.length)]}_${Math.floor(1000 + Math.random() * 9000)}`;
        await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestName: randomName }),
        });
      }
      setBatchGuestCount("");
      await fetchTournamentData();
    } catch (error) {
      addLog("ERROR", "BULK UPLINK ERROR");
      await fetchTournamentData();
    }
  };

  const handleScoreMatch = async (winnerId: string | null) => {
    if (!isAdmin || !scoringMatch || updating) return;

    const matchId = scoringMatch.id;
    const p1Name = scoringMatch.player1?.guestName || scoringMatch.player1?.username || "TBD";
    const p2Name = scoringMatch.player2?.guestName || scoringMatch.player2?.username || "TBD";
    const winnerName = winnerId === scoringMatch.player1?.id ? p1Name : winnerId === scoringMatch.player2?.id ? p2Name : null;

    setUpdating(matchId);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.MATCHES.SUBMIT(matchId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: winnerId || undefined }),
      });

      if (res.ok) {
        addLog(`MATCH COMPLETED`, winnerName ? `${winnerName.toUpperCase()} DEFEATED OPPONENT` : `MATCH ENDED IN DRAW: ${p1Name} VS ${p2Name}`);
        setScoringMatch(null);
        setScoringPosition(null);
        setScoringNote("");
        await fetchTournamentData();
      } else {
        const err = await res.json();
        addLog("ERROR", err.message || "SUBMISSION REJECTED");
      }
    } catch (error) {
      addLog("ERROR", "UPLINK LOST DURING SCORING");
    } finally {
      setUpdating(null);
    }
  };

  const openScoring = (match: Match, pos?: {x: number, y: number}) => {
    setScoringMatch(match);
    if (pos) setScoringPosition(pos);
  };

  if (loading && !tournament) {
    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Brackets</p>
            </div>
        </div>
    );
  }

  const isElimination = tournament?.format === "SINGLE_ELIMINATION" || tournament?.format === "DOUBLE_ELIMINATION";

  return (
    <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-8 py-12 mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-foreground/5 pb-8">
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/40 transition-all group"
                    title="EXIT TERMINAL"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none flex items-center gap-4">
                        {tournament?.name}
                        <span className="text-foreground/10 font-thin">/</span>
                        <span className="text-primary text-xl md:text-2xl">{tournament?.format.replace("_", " ")}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${isAdmin ? 'text-primary/60' : 'text-foreground/20'}`}>
                            {isAdmin ? "SYSTEM ADMINISTRATOR" : "AUTHORIZED VIEWER"}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-foreground/10" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/20">ARENA TERMINAL v2.0</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                {isAdmin && tournament?.status === "OPEN" && (
                    <button 
                        onClick={handleStartTournament}
                        className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 font-poppins"
                    >
                        Initiate Combat
                    </button>
                )}
            </div>
        </div>

        {/* Bracket Area */}
        {/* DO NOT MODIFY THIS HEIGHT WITHOUT EXPLICIT USER INSTRUCTION */}
        <main className="h-[65vh] overflow-hidden">
            {isMobile ? (
                <div className="h-full overflow-y-auto no-scrollbar">
                    <MobileView 
                        tournament={tournament}
                        leaderboard={leaderboard}
                        isAdmin={isAdmin}
                        updating={updating}
                        onOpenScoring={openScoring}
                        addLog={addLog}
                    />
                </div>
            ) : (
                <DesktopView 
                    tournament={tournament}
                    leaderboard={leaderboard}
                    isAdmin={isAdmin}
                    updating={updating}
                    onOpenScoring={openScoring}
                    addLog={addLog}
                />
            )}
        </main>

        <footer className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Terminal Column */}
            <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[3rem] group/panel relative">
                <div className="flex justify-between items-center mb-6 border-b border-foreground/10 pb-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins">Terminal Logs</h3>
                    <button 
                        onClick={() => {
                            setMaximizedPanel("TERMINAL");
                            addLog("UI_COMMAND", "TELEMETRY EXPANDED TO FULLSCREEN");
                        }}
                        className="p-2 hover:bg-primary/10 rounded-lg text-foreground/20 hover:text-primary transition-all"
                        title="MAXIMIZE"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                    </button>
                </div>
                <div className="bg-background rounded-2xl p-6 h-64 overflow-y-auto no-scrollbar font-mono text-[11px] border border-foreground/5">
                    {logs.length === 0 ? (
                        <p className="text-foreground/10 uppercase font-black tracking-widest">NO TELEMETRY RECEIVED</p>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-6 border-b border-foreground/5 pb-3 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                                    <span className="text-foreground/20 shrink-0 font-black">[{log.timestamp}]</span>
                                    <span className="text-primary font-black uppercase tracking-widest">{log.action}</span>
                                    {log.details && <span className="text-foreground/40 tracking-wider truncate">/ {log.details}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Live Standings Column */}
            <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[3rem] group/panel relative">
                <div className="flex justify-between items-center mb-6 border-b border-foreground/10 pb-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins">Live Standings</h3>
                    <button 
                        onClick={() => {
                            setMaximizedPanel("STANDINGS");
                            addLog("UI_COMMAND", "STANDINGS EXPANDED TO FULLSCREEN");
                        }}
                        className="p-2 hover:bg-primary/10 rounded-lg text-foreground/20 hover:text-primary transition-all"
                        title="MAXIMIZE"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                    </button>
                </div>
                <div className="bg-background rounded-2xl overflow-hidden h-64 border border-foreground/5">
                    <div className="h-full overflow-y-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] border-b border-foreground/5 sticky top-0 bg-background z-10">
                                    <th className="py-4 px-6">RANK</th>
                                    <th className="py-4 px-2">COMBATANT</th>
                                    <th className="py-4 px-6 text-center">PTS</th>
                                    <th className="py-4 px-6 text-right">RATIO</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-black text-foreground uppercase">
                                {leaderboard.map((entry) => (
                                    <tr key={entry.userId} className="border-b border-foreground/5 hover:bg-foreground/5 transition-all">
                                        <td className="py-4 px-6 text-primary">#{entry.rank.toString().padStart(2, '0')}</td>
                                        <td className="py-4 px-2 truncate max-w-[120px]">{entry.guestName || entry.username}</td>
                                        <td className="py-4 px-6 text-center">{entry.points}</td>
                                        <td className="py-4 px-6 text-right text-foreground/40">{(entry.matchWinPct * 100).toFixed(0)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tactical Deployment (Third Column if OPEN) */}
            {isAdmin && tournament?.status === "OPEN" && (
                <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[3rem] space-y-8 lg:col-span-2">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins border-b border-foreground/10 pb-4">Tactical Deployment</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Summon Guest */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Summon Guest</p>
                            <div className="flex gap-2">
                                <input placeholder="COMBATANT NAME" value={guestUsername} onChange={e => setGuestUsername(e.target.value)} className="flex-1 h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                                <button onClick={handleAddGuest} className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary font-black text-xl hover:bg-primary hover:text-white transition-all rounded-xl">+</button>
                            </div>
                        </div>

                        {/* Invite Player */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Invite Player</p>
                            <div className="flex flex-col gap-2">
                                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none">
                                    <option value="">SELECT PLAYER</option>
                                    {allUsers.filter(u => !tournament.participants.some((p: any) => p.userId === u.id)).map(u => (
                                        <option key={u.id} value={u.id}>{(u.username || (u as any).guestName || "Unknown User").toUpperCase()}</option>
                                    ))}
                                </select>
                                <button onClick={() => selectedUserId && handleJoin(selectedUserId)} className="w-full h-12 bg-foreground/10 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-foreground hover:text-background transition-all font-poppins">Authorize</button>
                            </div>
                        </div>

                        {/* Batch Summon */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Batch Summon Guests</p>
                            <div className="flex gap-2">
                                <input type="number" min="1" max={tournament.maxPlayers - tournament.participants.length} placeholder="COUNT" value={batchGuestCount} onChange={e => setBatchGuestCount(e.target.value)} className="w-24 h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                                <button onClick={handleBatchAddGuests} className="flex-1 h-12 bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all rounded-xl">Summon</button>
                            </div>
                            <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest text-right">MAX: {tournament.maxPlayers - tournament.participants.length}</p>
                        </div>
                    </div>
                </div>
            )}
        </footer>
      </div>

      {/* Maximized Panel Modal */}
      {maximizedPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="w-full max-w-6xl bg-background border border-primary/20 rounded-[3rem] flex flex-col h-[85vh] shadow-2xl relative overflow-hidden">
                <button 
                    onClick={() => setMaximizedPanel(null)} 
                    className="absolute top-10 right-10 w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/20 hover:text-white transition-all font-black text-xl font-poppins z-50"
                >
                    ✕
                </button>
                
                <div className="p-12 pb-6 shrink-0">
                    <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2 block">Full Screen View</span>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter font-poppins">
                        {maximizedPanel === "TERMINAL" ? "Terminal Telemetry" : "Combat Standings"}
                    </h2>
                </div>

                {maximizedPanel === "TERMINAL" ? (
                    <div className="px-12 pb-12 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-foreground/5 border border-white/5 rounded-[2rem] p-8 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="font-mono text-sm space-y-6">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex gap-8 border-b border-white/5 pb-4 last:border-0">
                                        <span className="text-foreground/20 shrink-0 font-black">[{log.timestamp}]</span>
                                        <span className="text-primary font-black uppercase tracking-widest">{log.action}</span>
                                        {log.details && <span className="text-foreground/40 tracking-wider">/ {log.details}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-12 pb-12 flex-1 overflow-hidden flex flex-col">
                         <div className="bg-foreground/5 border border-white/5 rounded-[2rem] flex-1 overflow-hidden flex flex-col">
                            {/* Sticky Header */}
                            <div className="px-8 bg-[#161616] border-b border-white/10 shrink-0">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">
                                            <th className="py-6 px-8 w-32">RANK</th>
                                            <th className="py-6 px-4">COMBATANT</th>
                                            <th className="py-6 px-8 text-center w-48">POINTS</th>
                                            <th className="py-6 px-8 text-center w-48">W-D-L</th>
                                            <th className="py-6 px-8 text-right w-48">WIN RATIO</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-8">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="text-lg font-black text-foreground uppercase">
                                        {leaderboard.map((entry) => (
                                            <tr key={entry.userId} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                                <td className="py-8 px-8 text-primary font-poppins text-2xl w-32">#{entry.rank.toString().padStart(2, '0')}</td>
                                                <td className="py-8 px-4 font-poppins tracking-tighter text-2xl">{entry.guestName || entry.username}</td>
                                                <td className="py-8 px-8 text-center font-poppins text-2xl w-48">{entry.points}</td>
                                                <td className="py-8 px-8 text-center text-foreground/40 font-poppins text-2xl w-48">{entry.wins}-{entry.draws || 0}-{entry.losses}</td>
                                                <td className="py-8 px-8 text-right text-foreground/60 font-poppins text-2xl w-48">{(entry.matchWinPct * 100).toFixed(0)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Scoring Console (Full-Height Right Drawer for Desktop, Full-Screen for Mobile) */}
      {scoringMatch && (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center lg:justify-end animate-in fade-in duration-300 pointer-events-none"
        >
          {/* Backdrop close listener */}
          <div className="absolute inset-0 pointer-events-auto" onClick={() => { setScoringMatch(null); setScoringPosition(null); }} />
          
          <div 
            className="w-full max-w-md lg:max-w-sm h-fit lg:h-screen bg-[#111] border-primary/20 lg:border-l lg:shadow-[-50px_0_100px_rgba(0,0,0,0.9)] p-8 lg:p-12 relative flex flex-col justify-center animate-in slide-in-from-right duration-500 lg:rounded-none rounded-[3rem] pointer-events-auto"
          >
            <button onClick={() => { setScoringMatch(null); setScoringPosition(null); }} className="absolute top-8 right-8 text-foreground/20 hover:text-white transition-all font-black text-xl font-poppins">✕</button>
            
            <div className="mb-10 text-center lg:text-left">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] font-poppins mb-4 block">Manual Override</span>
                <h2 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-tight font-poppins">Combat Results</h2>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-2">Update status for uplink telemetry</p>
            </div>

            <div className="space-y-4">
                <button 
                  onClick={() => handleScoreMatch(scoringMatch.player1?.id || null)}
                  disabled={!scoringMatch.player1}
                  className={`w-full py-6 bg-foreground/5 border border-white/5 hover:border-primary text-foreground rounded-2xl transition-all group px-8 flex justify-between items-center ${!scoringMatch.player1 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                >
                  <span className="font-black uppercase tracking-widest font-poppins text-xs lg:text-sm">{scoringMatch.player1?.username || (scoringMatch.player1 as any)?.guestName || "TBD"}</span>
                  <span className="text-[9px] font-black text-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-all">WINNER</span>
                </button>

                <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[8px] font-black text-foreground/10 uppercase tracking-widest">VS</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <button 
                  onClick={() => handleScoreMatch(scoringMatch.player2?.id || null)}
                  disabled={!scoringMatch.player2}
                  className={`w-full py-6 bg-foreground/5 border border-white/5 hover:border-primary text-foreground rounded-2xl transition-all group px-8 flex justify-between items-center ${!scoringMatch.player2 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                >
                  <span className="font-black uppercase tracking-widest font-poppins text-xs lg:text-sm">{scoringMatch.player2?.username || (scoringMatch.player2 as any)?.guestName || "TBD"}</span>
                  <span className="text-[9px] font-black text-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-all">WINNER</span>
                </button>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <button 
                      onClick={() => handleScoreMatch(null)}
                      className="w-full py-4 bg-transparent border border-dashed border-white/5 hover:border-foreground/20 text-foreground/20 hover:text-foreground/40 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                      Clear Results / Draw
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(82, 185, 70, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(82, 185, 70, 0.4);
        }
      `}</style>
    </div>
  );
}

export default function BracketViewPage() {
  return (
    <Suspense fallback={
        <div className="h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Initializing Terminal</p>
            </div>
        </div>
    }>
      <BracketViewContent />
    </Suspense>
  );
}
