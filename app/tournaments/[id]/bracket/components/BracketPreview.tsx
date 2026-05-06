"use client";
import { useState, useRef, useEffect } from "react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../../utils/api";

interface RawParticipant {
  id: string; userId: string; seed?: number;
  user: { id: string; username: string; isGuest?: boolean; };
}
interface SlotPlayer { userId: string; name: string; seed: number; isGuest?: boolean; }
interface PreviewMatch { id: string; matchIndex: number; player1: SlotPlayer | null; player2: SlotPlayer | null; }
interface PreviewRound { id: string; roundNumber: number; matches: PreviewMatch[]; }

interface Props {
  tournament: any; isAdmin: boolean; tournamentId: string;
  currentUserId?: string;
  onRefresh: () => void; addLog: (action: string, details?: string) => void;
}

function sorted(ps: RawParticipant[]) {
  return [...ps].sort((a, b) => {
    if (a.seed == null && b.seed == null) return 0;
    if (a.seed == null) return 1; if (b.seed == null) return -1;
    return a.seed - b.seed;
  });
}

function computeAllRounds(ps: RawParticipant[], format: string): PreviewRound[] {
  const s = sorted(ps); const n = s.length;
  const isElim = format === "SINGLE_ELIMINATION" || format === "DOUBLE_ELIMINATION";
  
  if (!isElim) {
    // For Swiss/Round Robin, we just show 1 round of pairings for now
    const matches: PreviewMatch[] = Array.from({ length: Math.ceil(n / 2) }, (_, i) => ({
      id: `preview-0-${i}`,
      matchIndex: i,
      player1: s[i * 2] ? { userId: s[i * 2].userId, name: s[i * 2].user.username, seed: s[i * 2].seed ?? i * 2 + 1, isGuest: s[i * 2].user.isGuest } : null,
      player2: s[i * 2 + 1] ? { userId: s[i * 2 + 1].userId, name: s[i * 2 + 1].user.username, seed: s[i * 2 + 1].seed ?? i * 2 + 2, isGuest: s[i * 2 + 1].user.isGuest } : null,
    }));
    return [{ id: "preview-round-1", roundNumber: 1, matches }];
  }

  // Elimination rounds
  const rounds: PreviewRound[] = [];
  const powerOf2 = Math.pow(2, Math.ceil(Math.log2(n || 2)));
  const totalRounds = Math.log2(powerOf2);
  
  let currentMatchCount = powerOf2 / 2;
  
  for (let r = 1; r <= totalRounds; r++) {
    const matches: PreviewMatch[] = [];
    for (let m = 0; m < currentMatchCount; m++) {
      let p1 = null;
      let p2 = null;
      
      if (r === 1) {
        // Round 1 seating
        const p1Idx = m;
        const p2Idx = n - 1 - m; // Simplified seeding for preview
        if (s[p1Idx]) p1 = { userId: s[p1Idx].userId, name: s[p1Idx].user.username, seed: s[p1Idx].seed ?? p1Idx + 1, isGuest: s[p1Idx].user.isGuest };
        if (p2Idx > p1Idx && s[p2Idx]) p2 = { userId: s[p2Idx].userId, name: s[p2Idx].user.username, seed: s[p2Idx].seed ?? p2Idx + 1, isGuest: s[p2Idx].user.isGuest };
      }
      
      matches.push({
        id: `preview-${r}-${m}`,
        matchIndex: m,
        player1: p1,
        player2: p2
      });
    }
    rounds.push({ id: `preview-round-${r}`, roundNumber: r, matches });
    currentMatchCount /= 2;
  }

  // If double elimination, we'd add losers rounds here, but keeping it simpler for now
  // to avoid making the code too massive. We can add them if the user requests.

  return rounds;
}

// ── Searchable picker ────────────────────────────────────────────────────────
function PlayerPicker({ participants, excludeId, onSelect, onClose }: {
  participants: RawParticipant[]; excludeId: string;
  onSelect: (p: RawParticipant) => void; onClose: () => void;
}) {
  const [q, setQ] = useState(""); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const opts = participants.filter(p =>
    p.userId !== excludeId && p.user.username.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="absolute z-[100] top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-primary/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-3 border-b border-white/5 bg-black/20">
        <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search combatant..."
          className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50 rounded-lg font-poppins" />
      </div>
      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {opts.length === 0
          ? <div className="py-10 text-center text-[10px] text-neutral-600 uppercase tracking-[0.3em] font-black">No results found</div>
          : opts.map(p => (
            <button key={p.userId} onClick={() => { onSelect(p); onClose(); }}
              className="w-full px-5 py-3 text-left flex items-center gap-4 hover:bg-primary/10 transition-all group border-b border-white/5 last:border-0">
              <span className="text-[10px] font-black text-primary/40 w-6 font-mono">#{p.seed ?? "?"}</span>
              <div className="flex-1 flex flex-col">
                <span className="text-xs font-black text-neutral-300 group-hover:text-primary uppercase tracking-tight transition-colors">{p.user.username}</span>
                {p.user.isGuest && <span className="text-[7px] text-neutral-600 font-black uppercase tracking-widest">Guest Unit</span>}
              </div>
            </button>
          ))
        }
      </div>
    </div>
  );
}

// ── Participant Row ─────────────────────────────────────────────────────────
function PreviewParticipantRow({ player, seed, participants, isAdmin, onSwap, isRound1, onOpenChange, currentUserId }: {
  player: SlotPlayer | null; seed: number; participants: RawParticipant[];
  isAdmin: boolean; onSwap: (fromId: string, toId: string) => void; isRound1: boolean;
  onOpenChange?: (open: boolean) => void; currentUserId?: string;
}) {
  const [open, setOpen] = useState(false); const wrap = useRef<HTMLDivElement>(null);
  const isMe = player && currentUserId === player.userId;
  useEffect(() => {
    onOpenChange?.(open);
    if (!open) return;
    const fn = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const canEdit = isAdmin && player && isRound1;

  return (
    <div ref={wrap} className={`relative flex-1 flex flex-col ${open ? "z-[100]" : "z-0"}`}>
      <button 
        onClick={() => canEdit && setOpen(v => !v)}
        className={`w-full px-6 py-5 flex justify-between items-center transition-all border-l-2 ${
          open ? "border-primary bg-primary/5" : isMe ? "border-primary bg-primary/5 shadow-[inset_0_0_20px_rgba(82,185,70,0.1)]" : "border-transparent"
        } ${canEdit ? "hover:bg-white/5" : "cursor-default"} ${!player ? "opacity-30" : ""}`}
      >
        <div className="flex items-center gap-4">
           <span className={`text-primary font-black font-mono text-[10px] w-6 shrink-0 ${isMe ? "animate-pulse" : "opacity-40"}`}>{player?.seed ?? seed}</span>
           <span className={`text-sm font-black uppercase tracking-widest font-poppins ${player ? (isMe ? "text-primary drop-shadow-[0_0_8px_rgba(82,185,70,0.5)]" : "text-white") : "text-neutral-700"}`}>
             {player?.name ?? "TBD"} {isMe && "(YOU)"}
           </span>
        </div>
        {canEdit && (
          <div className={`transition-all ${open ? "rotate-180 text-primary" : "text-neutral-700"}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </div>
        )}
      </button>
      {open && <PlayerPicker participants={participants} excludeId={player!.userId} onSelect={p => onSwap(player!.userId, p.userId)} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ── Match Card ──────────────────────────────────────────────────────────────
function PreviewMatchCard({ match, participants, isAdmin, onSwap, isRound1, onOpenChange, currentUserId }: {
  match: PreviewMatch; participants: RawParticipant[];
  isAdmin: boolean; onSwap: (a: string, b: string) => void; isRound1: boolean;
  onOpenChange?: (open: boolean) => void; currentUserId?: string;
}) {
  const [row1Open, setRow1Open] = useState(false);
  const [row2Open, setRow2Open] = useState(false);
  const anyOpen = row1Open || row2Open;

  useEffect(() => {
    onOpenChange?.(anyOpen);
  }, [anyOpen]);

  return (
    <div className={`w-80 lg:w-96 flex flex-col shadow-2xl border border-white/5 relative group ${anyOpen ? "z-[200]" : "z-0"}`}
         style={{ background: "linear-gradient(180deg, #2A2A2A 0%, #222222 100%)" }}>
      <PreviewParticipantRow player={match.player1} seed={match.matchIndex * 2 + 1} participants={participants} isAdmin={isAdmin} onSwap={onSwap} isRound1={isRound1} onOpenChange={setRow1Open} currentUserId={currentUserId} />
      <div className="h-[1px] bg-white/5 w-full" />
      <PreviewParticipantRow player={match.player2} seed={match.matchIndex * 2 + 2} participants={participants} isAdmin={isAdmin} onSwap={onSwap} isRound1={isRound1} onOpenChange={setRow2Open} currentUserId={currentUserId} />
    </div>
  );
}

// ── Match Wrapper (for absolute positioning & stacking) ──────────────────────
function MatchWrapper({ match, participants, isAdmin, onSwap, isRound1, topPos, currentUserId }: {
  match: PreviewMatch; participants: RawParticipant[]; isAdmin: boolean;
  onSwap: (a: string, b: string) => void; isRound1: boolean; topPos: number;
  currentUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div 
      style={{ 
        top: `${topPos}px`, 
        position: 'absolute', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: open ? 500 : 1
      }}
    >
      <PreviewMatchCard 
        match={match} 
        participants={participants} 
        isAdmin={isAdmin} 
        onSwap={onSwap} 
        isRound1={isRound1}
        onOpenChange={setOpen}
        currentUserId={currentUserId}
      />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function BracketPreview({ tournament, isAdmin, currentUserId, tournamentId, onRefresh, addLog }: Props) {
  const [swapping, setSwapping] = useState(false);
  const [zoom, setZoom] = useState(0.8);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const participants: RawParticipant[] = tournament?.participants ?? [];
  const format: string = tournament?.format ?? "SINGLE_ELIMINATION";
  const rounds = computeAllRounds(participants, format);
  const isElimination = format === "SINGLE_ELIMINATION" || format === "DOUBLE_ELIMINATION";

  const maxMatchesInRound = Math.max(...rounds.map(r => r.matches.length));
  const canvasHeight = Math.max(800, maxMatchesInRound * 220);

  const handleSwap = async (fromId: string, toId: string) => {
    if (!isAdmin || swapping) return;
    const fromP = participants.find(p => p.userId === fromId);
    const toP = participants.find(p => p.userId === toId);
    if (!fromP || !toP) return;
    const s = sorted(participants);
    const fromSeed = fromP.seed ?? (s.findIndex(p => p.userId === fromId) + 1);
    const toSeed = toP.seed ?? (s.findIndex(p => p.userId === toId) + 1);
    setSwapping(true);
    try {
      await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.UPDATE_SEED(tournamentId, fromId), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seed: toSeed }),
      });
      await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.UPDATE_SEED(tournamentId, toId), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seed: fromSeed }),
      });
      addLog("SEED SWAP", `${fromP.user.username.toUpperCase()} ↔ ${toP.user.username.toUpperCase()}`);
      onRefresh();
    } catch { addLog("ERROR", "SEED SWAP FAILED"); }
    finally { setSwapping(false); }
  };

  return (
    <div className="space-y-6">
      {/* Tool bar */}
      <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isElimination ? "bg-primary shadow-[0_0_8px_#52b946]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest font-poppins">
            {format.replace(/_/g, " ")} PREVIEW · {participants.length} UNITS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
             <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg font-black">-</button>
             <span className="text-[9px] font-black text-neutral-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg font-black">+</button>
          </div>
        </div>
      </div>

      {/* Canvas / List Area */}
      <div 
        ref={scrollContainerRef}
        className={`h-[75vh] overflow-auto custom-scrollbar bg-black/40 rounded-[2.5rem] border border-white/5 relative ${!isElimination ? 'p-12' : ''}`}
      >
        {!isElimination ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col gap-4">
               <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins">Initial Pairings (Round 1)</h2>
               <p className="text-neutral-500 text-xs font-questrial italic">In Swiss format, subsequent pairings are determined by win/loss records after each round completes.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {rounds[0]?.matches.map((match, i) => (
                <div key={match.id} className="relative z-10 space-y-3">
                  <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] font-poppins">Match {(i + 1).toString().padStart(2, '0')}</span>
                  <PreviewMatchCard
                    match={match}
                    participants={participants}
                    isAdmin={isAdmin}
                    onSwap={handleSwap}
                    isRound1={true}
                    currentUserId={currentUserId}
                  />
                </div>
              ))}
            </div>

            {participants.length % 2 !== 0 && (
              <div className="p-8 bg-amber-400/5 border border-amber-400/20 rounded-3xl flex items-center gap-6">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-black">!</div>
                <div>
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest font-poppins">Odd Participant Count</p>
                  <p className="text-neutral-400 text-xs font-questrial">The final combatant will receive a BYE for Round 1.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: 'max-content',
              height: `${canvasHeight}px`
            }}
            className="p-20 flex gap-24 items-start"
          >
            {rounds.map((round, rIndex) => (
              <div key={round.id} className="relative h-full w-80 lg:w-96 flex flex-col items-center shrink-0"
                   style={{ zIndex: (rounds.length - rIndex) * 10 }}>
                 <h2 className="text-[8px] font-black text-primary/40 uppercase tracking-[0.5em] border-b border-white/5 pb-2 mb-8 w-full text-center font-poppins">
                    {round.roundNumber === rounds.length ? "CHAMPIONSHIP" : `ROUND ${round.roundNumber}`}
                 </h2>
                 <div className="relative flex-1 w-full">
                    {round.matches.map((match, i) => {
                      const matchCount = round.matches.length;
                      const topPos = (canvasHeight / (matchCount + 1)) * (i + 1) - 60;
                      return (
                        <MatchWrapper
                          key={match.id}
                          match={match}
                          participants={participants}
                          isAdmin={isAdmin}
                          onSwap={handleSwap}
                          isRound1={round.roundNumber === 1}
                          topPos={topPos}
                          currentUserId={currentUserId}
                        />
                      );
                    })}
                 </div>
              </div>
            ))}

            {isElimination && (
              <div className="h-full w-80 lg:w-96 flex flex-col items-center shrink-0">
                 <h2 className="text-[8px] font-black text-primary uppercase tracking-[0.5em] border-b border-white/5 pb-2 mb-8 w-full text-center font-poppins">
                    CHAMPION
                 </h2>
                 <div className="flex flex-col justify-center h-full items-center">
                    <div className="w-64 h-64 border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
                      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/10">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
                      </div>
                      <span className="text-[9px] font-black text-neutral-800 uppercase tracking-widest font-poppins">Awaiting Victor</span>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82,185,70,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82,185,70,0.4); }
      `}</style>
    </div>
  );
}
