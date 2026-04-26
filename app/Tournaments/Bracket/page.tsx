"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../utils/api";
import { Match, Round, LeaderboardEntry } from "./types";
import MatchCard from "./components/MatchCard";

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

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scoringNote, setScoringNote] = useState("");

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
        setIsAdmin(meData.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER"));
      }

      const tRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!));
      if (tRes.ok) {
        const tData = await tRes.json();
        setTournament(tData);
        addLog(`ARENA LOADED`, `${tData.name} STATUS: ${tData.status}`);
      }

      const lRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId!));
      if (lRes.ok) {
        const lData = await lRes.json();
        setLeaderboard(lData);
      }
    } catch (error) {
      addLog("ERROR", "SYNC FAILED");
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

  const handleScoreMatch = async (winnerId: string | null) => {
    if (!isAdmin || !scoringMatch || updating) return;

    const matchId = scoringMatch.id;
    setUpdating(matchId);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.MATCHES.SUBMIT(matchId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: winnerId || undefined }),
      });

      if (res.ok) {
        addLog(`MATCH SCORED`, `TERMINAL UPDATE RECEIVED`);
        setScoringMatch(null);
        setScoringNote("");
        await fetchTournamentData();
      }
    } catch (error) {
      addLog("ERROR", "UPLINK LOST DURING SCORING");
    } finally {
      setUpdating(null);
    }
  };

  const getRoundLabel = (format: string, roundNum: number, totalRounds: number) => {
    if (format === "SWISS") return `PHASE ${roundNum}`;
    if (roundNum === totalRounds) return "CHAMPIONSHIP";
    if (roundNum === totalRounds - 1) return "SEMI-FINALS";
    return `ROUND ${roundNum}`;
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

  const grandChampion = tournament?.status === "COMPLETED" && leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-foreground/5 pb-12">
            <div>
                <button 
                    onClick={() => router.back()}
                    className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins mb-4 hover:opacity-70 transition-all flex items-center gap-2"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                    EXIT ARENA
                </button>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none">
                    {tournament?.name} <span className="text-foreground/10">/ TERMINAL</span>
                </h1>
            </div>
            
            <div className="flex items-center gap-6 p-6 bg-foreground/5 rounded-[2rem] border border-foreground/5">
                <button 
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 transition-all font-poppins"
                >
                    Standings
                </button>
                <div className="h-10 w-[1px] bg-foreground/10" />
                <div className="flex flex-col">
                    <span className="text-[9px] text-foreground/40 font-black uppercase tracking-widest font-poppins mb-1">Format</span>
                    <span className="text-xs font-black text-primary uppercase tracking-tighter">{tournament?.format.replace("_", " ")}</span>
                </div>
                <div className="h-10 w-[1px] bg-foreground/10" />
                <div className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border ${isAdmin ? 'bg-primary/5 text-primary border-primary/20' : 'bg-foreground/5 text-foreground/40 border-foreground/5'}`}>
                    {isAdmin ? "ADMIN" : "VIEWER"}
                </div>
            </div>
        </div>

        <main className="flex-1 overflow-x-auto no-scrollbar pb-12">
            <div className="flex gap-20 min-w-max items-center">
                {tournament?.rounds?.map((round: Round) => (
                    <div key={round.id} className="flex flex-col gap-10">
                        <h2 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] border-b border-foreground/5 pb-4 text-center font-poppins">
                            {getRoundLabel(tournament.format, round.roundNumber, tournament.rounds.length)}
                        </h2>
                        <div className="flex flex-col gap-10 justify-center h-full">
                            {round.matches.map((match) => (
                                <MatchCard 
                                    key={match.id} 
                                    match={match} 
                                    onOpenScoring={() => setScoringMatch(match)} 
                                    isAdmin={isAdmin}
                                    isUpdating={updating === match.id}
                                    leaderboard={leaderboard}
                                    showPoints={tournament?.format === "SWISS"}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                
                {/* Champion Section */}
                <div className="flex flex-col gap-10">
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] border-b border-foreground/5 pb-4 text-center font-poppins">
                        Champion
                    </h2>
                    <div className="flex flex-col justify-center h-full">
                        <div className={`w-64 p-12 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all duration-700 shadow-2xl ${grandChampion ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-foreground/5 border border-dashed border-foreground/10'}`}>
                            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${grandChampion ? 'border-white/40 text-white shadow-xl' : 'border-foreground/10 text-foreground/10'}`}>
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-poppins ${grandChampion ? 'text-white/60' : 'text-foreground/20'}`}>The Ultimate Winner</span>
                                <span className={`text-2xl font-black uppercase tracking-tighter font-poppins leading-tight ${grandChampion ? 'text-white' : 'text-foreground/10'}`}>
                                    {grandChampion?.username || "AWAITING..."}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer className="mt-12">
            <div className="bg-foreground/5 border border-foreground/5 p-10 rounded-[3rem]">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 border-b border-foreground/10 pb-4 font-poppins">Terminal Logs</h3>
                <div className="bg-background rounded-2xl p-6 h-48 overflow-y-auto no-scrollbar font-mono text-[11px] border border-foreground/5">
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
        </footer>
      </div>

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-background border border-foreground/5 rounded-[3rem] p-10 md:p-16 shadow-2xl relative">
                <button onClick={() => setIsLeaderboardOpen(false)} className="absolute top-10 right-10 text-foreground/40 hover:text-primary transition-all font-black text-xl font-poppins">✕</button>
                <div className="mb-12">
                    <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2 block">Live Standings</span>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter font-poppins">Tournament Ranking</h2>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] border-b border-foreground/5">
                                <th className="py-6 pr-6">RANK</th>
                                <th className="py-6 px-6">COMBATANT</th>
                                <th className="py-6 px-6 text-center">PTS</th>
                                <th className="py-6 px-6 text-center">W-D-L</th>
                                <th className="py-6 pl-6 text-right">RATIO</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-black text-foreground uppercase">
                            {leaderboard.map((entry) => (
                                <tr key={entry.userId} className="border-b border-foreground/5 hover:bg-foreground/5 transition-all group">
                                    <td className="py-6 pr-6 text-primary font-poppins text-lg">#{entry.rank.toString().padStart(2, '0')}</td>
                                    <td className="py-6 px-6 text-xl tracking-tighter font-poppins">{entry.username}</td>
                                    <td className="py-6 px-6 text-center text-primary font-poppins text-lg">{entry.points}</td>
                                    <td className="py-6 px-6 text-center text-foreground/40 font-poppins">{entry.wins}-{entry.draws || 0}-{entry.losses}</td>
                                    <td className="py-6 pl-6 text-right text-foreground/60 font-poppins">{(entry.matchWinPct * 100).toFixed(0)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Scoring Modal */}
      {scoringMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-md bg-background border border-primary/50 rounded-[3rem] p-12 shadow-2xl relative">
            <button onClick={() => setScoringMatch(null)} className="absolute top-10 right-10 text-foreground/20 hover:text-white transition-all font-black text-xl font-poppins">✕</button>
            <div className="mb-10 text-center">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] font-poppins mb-4 block">Manual Override</span>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-poppins">Score Combat</h2>
            </div>

            <div className="space-y-6">
                <button 
                  onClick={() => handleScoreMatch(scoringMatch.player1?.id || null)}
                  className="w-full py-6 bg-foreground/5 border border-foreground/10 hover:border-primary text-foreground rounded-2xl transition-all group px-8 flex justify-between items-center"
                >
                  <span className="font-black uppercase tracking-widest font-poppins">{scoringMatch.player1?.username}</span>
                  <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest">VICTORY</span>
                </button>

                <button 
                  onClick={() => handleScoreMatch(null)}
                  className="w-full py-6 bg-foreground/5 border border-foreground/10 hover:border-foreground/40 text-foreground/40 rounded-2xl transition-all group px-8 flex justify-between items-center"
                >
                  <span className="font-black uppercase tracking-widest font-poppins">STALEMATE</span>
                  <span className="text-[10px] font-black text-foreground/20 opacity-0 group-hover:opacity-100 uppercase tracking-widest">DRAW</span>
                </button>

                <button 
                  onClick={() => handleScoreMatch(scoringMatch.player2?.id || null)}
                  className="w-full py-6 bg-foreground/5 border border-foreground/10 hover:border-primary text-foreground rounded-2xl transition-all group px-8 flex justify-between items-center"
                >
                  <span className="font-black uppercase tracking-widest font-poppins">{scoringMatch.player2?.username}</span>
                  <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest">VICTORY</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BracketViewPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
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
