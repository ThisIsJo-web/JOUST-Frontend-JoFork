"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../utils/api";
import { Match, LeaderboardEntry } from "./types";
import DesktopView from "./device/DesktopView";
import MobileView from "./device/MobileView";
import ScoringDrawer from "./components/ScoringDrawer";
import MaximizedModal from "./components/MaximizedModal";
import TerminalLogs from "./components/TerminalLogs";
import LiveStandings from "./components/LiveStandings";
import DeploymentFooter from "./components/DeploymentFooter";
import BracketPreview from "./components/BracketPreview";

const randomGuestName = () => `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

interface LogEntry { id: string; action: string; details?: string; timestamp: string; }

function BracketViewContent() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament]     = useState<any | null>(null);
  const [leaderboard, setLeaderboard]   = useState<LeaderboardEntry[]>([]);
  const [logs, setLogs]                 = useState<LogEntry[]>([]);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [currentUser, setCurrentUser]   = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState<string | null>(null);
  const [allUsers, setAllUsers]         = useState<any[]>([]);
  const [guestUsername, setGuestUsername]     = useState("");
  const [selectedUserId, setSelectedUserId]   = useState("");
  const [scoringMatch, setScoringMatch]       = useState<Match | null>(null);
  const [maximizedPanel, setMaximizedPanel]   = useState<"TERMINAL" | "STANDINGS" | null>(null);
  const [isMobile, setIsMobile]               = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (tournamentId) fetchTournamentData();
    else router.push("/tournaments");
  }, [tournamentId]);

  const addLog = (action: string, details?: string) =>
    setLogs(prev => [{ id: Math.random().toString(36).slice(7), timestamp: new Date().toLocaleTimeString(), action, details }, ...prev]);

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (meRes.ok) {
        const me = await safeJson(meRes);
        setCurrentUser(me);
        const auth = me?.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER");
        setIsAdmin(auth);
        if (auth) {
          const usersRes = await authenticatedFetch(API_ENDPOINTS.AUTH.REGISTERED_USERS);
          if (usersRes.ok) setAllUsers(await safeJson(usersRes) ?? []);
        }
      }
      const tRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!));
      if (tRes.ok) {
        const t = await safeJson(tRes);
        setTournament(t);
        addLog("TOURNAMENT DATA READY", `${t.name.toUpperCase()} STATUS: ${t.status}`);
      }
      const lRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId!));
      if (lRes.ok) setLeaderboard(await safeJson(lRes) ?? []);
    } catch { addLog("ERROR", "UPLINK CONNECTION FAILED"); }
    finally { setLoading(false); }
  };

  const handleStartTournament = async () => {
    if (!confirm("Initiate Combat? This locks registration and generates the final bracket.")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.START(tournamentId!), { method: "POST" });
    const data = await safeJson(res);
    if (res.ok) { addLog("TOURNAMENT STARTED", "MATCHES INITIALIZED"); fetchTournamentData(); }
    else { addLog("ERROR", data?.message || "START FAILED"); }
  };

  const handleJoin = async (userId: string) => {
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId!), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    const data = await safeJson(res);
    if (res.ok) { addLog("REGISTRATION", "COMBATANT SECURED"); fetchTournamentData(); return true; }
    addLog("ERROR", data?.message || "UPLINK REJECTED"); return false;
  };

  const handleAddGuest = async () => {
    if (!guestUsername || tournament?.participants.length >= tournament?.maxPlayers) { addLog("ERROR", "MAX CAPACITY REACHED"); return; }
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: guestUsername }) });
    const data = await safeJson(res);
    if (res.ok) { addLog("REGISTRATION", "GUEST UNIT DEPLOYED"); setGuestUsername(""); fetchTournamentData(); }
    else { addLog("ERROR", data?.message || "DEPLOYMENT FAILED"); }
  };


  const handleScoreMatch = async (winnerId: string | null) => {
    if (!isAdmin || !scoringMatch || updating) return;
    const matchId = scoringMatch.id;
    const p1Name = scoringMatch.player1?.username || "TBD";
    const p2Name = scoringMatch.player2?.username || "TBD";
    const winnerName = winnerId === scoringMatch.player1?.id ? p1Name : winnerId === scoringMatch.player2?.id ? p2Name : null;
    setUpdating(matchId);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.MATCHES.SUBMIT(matchId), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ winnerId: winnerId || undefined }) });
      const data = await safeJson(res);
      if (res.ok) {
        addLog("MATCH COMPLETED", winnerName ? `${winnerName.toUpperCase()} DEFEATED OPPONENT` : `DRAW: ${p1Name} VS ${p2Name}`);
        setScoringMatch(null); await fetchTournamentData();
      } else { addLog("ERROR", data?.message || "SUBMISSION REJECTED"); }
    } catch { addLog("ERROR", "UPLINK LOST DURING SCORING"); }
    finally { setUpdating(null); }
  };

  if (loading && !tournament) return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Brackets</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background font-questrial flex flex-col overflow-x-hidden">
      <div className="w-full px-4 md:px-8 py-12 mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-foreground/5 pb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none flex items-center gap-4">
                {tournament?.name}
                <span className="text-foreground/10 font-thin">/</span>
                <span className="text-primary text-xl md:text-2xl">{tournament?.format.replace("_", " ")}</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${isAdmin ? "text-primary/60" : "text-foreground/20"}`}>
                  {isAdmin ? "SYSTEM ADMINISTRATOR" : "AUTHORIZED VIEWER"}
                </span>
                <div className="w-1 h-1 rounded-full bg-foreground/10" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground/20">TOURNAMENT CONTROLLER v2.0</span>
              </div>
            </div>
          </div>
          {isAdmin && tournament?.status === "OPEN" && (
            <button onClick={handleStartTournament} className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 font-poppins">
              Initiate Combat
            </button>
          )}
        </div>

        {/* Bracket Area */}
        <main className={tournament?.status === "ONGOING" || tournament?.status === "COMPLETED" ? "h-[65vh] overflow-hidden" : "min-h-[40vh]"}
        >
          {tournament?.status === "ONGOING" || tournament?.status === "COMPLETED" ? (
            isMobile ? (
              <div className="h-full overflow-y-auto no-scrollbar">
                <MobileView tournament={tournament} leaderboard={leaderboard} isAdmin={isAdmin} updating={updating} onOpenScoring={(m) => setScoringMatch(m)} addLog={addLog} />
              </div>
            ) : (
              <DesktopView tournament={tournament} leaderboard={leaderboard} isAdmin={isAdmin} updating={updating} onOpenScoring={(m) => setScoringMatch(m)} addLog={addLog} />
            )
          ) : (
            <BracketPreview 
              tournament={tournament} 
              isAdmin={isAdmin} 
              currentUserId={currentUser?.sub || currentUser?.id}
              tournamentId={tournamentId} 
              onRefresh={fetchTournamentData}
              addLog={addLog}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TerminalLogs logs={logs} onMaximize={() => { setMaximizedPanel("TERMINAL"); addLog("UI_COMMAND", "TELEMETRY EXPANDED"); }} />
          <LiveStandings leaderboard={leaderboard} onMaximize={() => { setMaximizedPanel("STANDINGS"); addLog("UI_COMMAND", "STANDINGS EXPANDED"); }} />
          {isAdmin && tournament?.status === "OPEN" && (
            <DeploymentFooter
              tournament={tournament}
              allUsers={allUsers}
              guestUsername={guestUsername}
              setGuestUsername={setGuestUsername}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              onAddGuest={handleAddGuest}
              onJoin={handleJoin}
            />
          )}
        </footer>
      </div>

      <MaximizedModal panel={maximizedPanel} logs={logs} leaderboard={leaderboard} onClose={() => setMaximizedPanel(null)} />
      <ScoringDrawer match={scoringMatch} onClose={() => setScoringMatch(null)} onScore={handleScoreMatch} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82,185,70,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82,185,70,0.4); }
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
