"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";
import { Tournament } from "../types";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import BracketPreview from "../../components/tournaments/bracket/BracketPreview";

interface TournamentLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
  omw: number;
  oomw: number;
}

function TournamentViewContent() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [user, setUser] = useState<{ sub: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<"DETAILS" | "PLAYERS" | "LEADERBOARD" | "BRACKET">("DETAILS");
  const [tournamentLeaderboard, setTournamentLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    } else {
      router.push("/tournaments");
    }
  }, [tournamentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, tRes] = await Promise.all([
        authenticatedFetch(API_ENDPOINTS.AUTH.ME),
        authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!))
      ]);
      
      if (meRes.ok) {
        const data = await safeJson(meRes);
        if (data) setUser(data);
      }
      if (tRes.ok) {
        const data = await safeJson(tRes);
        if (data) setTournament(data);
      }
      
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
        router.push("/auth");
        return;
    }
    setJoining(true);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId!), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: (user as any).id || (user as any).sub }),
      });
      if (res.ok) {
        router.push(`/tournaments/${tournamentId}/lobby`);
      } else {
        const err = await safeJson(res) || { message: "Join failed" };
        alert(err.message || "Join failed");
      }
    } catch (error) {
      alert("Connection error");
    } finally {
      setJoining(false);
    }
  };

  const fetchTournamentLeaderboard = async () => {
    if (!tournamentId) return;
    setLeaderboardLoading(true);
    setLeaderboardError("");
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId));
      if (!res.ok) {
        const err = await safeJson(res);
        setLeaderboardError(err?.message || `Failed to fetch leaderboard (${res.status})`);
        setTournamentLeaderboard([]);
        return;
      }
      const data = await safeJson(res);
      setTournamentLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Tournament leaderboard fetch failed:", error);
      setLeaderboardError("Connection error: Unable to load leaderboard");
      setTournamentLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "LEADERBOARD" && tournamentId && tournamentLeaderboard.length === 0) {
      fetchTournamentLeaderboard();
    }
  }, [activeTab, tournamentId]);

  if (loading && !tournament) {
    return (
      <div className="min-h-screen w-full bg-[#1B1B1B] font-questrial overflow-x-hidden">
        <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <div className="h-[400px] md:h-[600px] bg-white/5 rounded-[3rem]" />
              <div className="space-y-4">
                <div className="h-4 w-40 bg-white/10 rounded-md" />
                <div className="h-12 w-full bg-white/10 rounded-xl" />
                <div className="h-20 w-full bg-white/5 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white/5 rounded-3xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="h-64 bg-white/5 rounded-[2.5rem]" />
              <div className="h-96 bg-white/5 rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center text-white font-black uppercase tracking-widest">Tournament Not Found</div>;

  const myId = user?.sub || (user as any)?.id;
  const isJoined = tournament.participants.some(p => p.userId === myId);
  const isFull = tournament.participants.length >= tournament.maxPlayers;
  const registrationOpen = tournament.status === "OPEN" || tournament.status === "UPCOMING";
  const canJoin = registrationOpen && !isJoined && !isFull && !!user;

  const formatExplanations: Record<string, string> = {
    SINGLE_ELIMINATION: "Loss results in immediate disqualification. High-stakes, high-precision competition.",
    DOUBLE_ELIMINATION: "Features a secondary bracket for losers. Two losses required for elimination.",
    SWISS: "Fixed number of rounds. Matches players with similar records. No one is eliminated early.",
    ROUND_ROBIN: "Every participant plays every other participant. Final ranking based on overall record."
  };

  const tabs = [
    { id: "DETAILS", label: "Overview" },
    { id: "PLAYERS", label: `Players (${tournament.participants.length})` },
    { id: "LEADERBOARD", label: "Leaderboard" },
    { id: "BRACKET", label: tournament.status === "COMPLETED" ? "Final Results" : "Bracket" }
  ];

  return (
    <div className="min-h-screen w-full bg-[#1B1B1B] text-white font-poppins selection:bg-primary selection:text-black overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-32 flex flex-col gap-16">
        
        <div className="flex flex-wrap gap-4 border-b border-white/5 pb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-2 ${
                activeTab === tab.id 
                  ? "bg-primary border-primary text-black" 
                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "DETAILS" && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20"
            >
              <div className="lg:col-span-7 flex flex-col gap-12">
                <div className="relative group border-2 border-white/5 overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <Image 
                      src={tournament.image || "/placeholder.jpg"} 
                      alt={tournament.name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="absolute top-6 left-6 flex flex-col items-start gap-4 z-20">
                    <div className="relative">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-primary text-black font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl cursor-help peer"
                      >
                        {(typeof tournament.format === 'object' ? tournament.format?.system : "UNKNOWN")?.replace("_", " ") || "UNKNOWN"}
                      </motion.div>
                      
                      <div className="absolute top-full left-0 mt-4 opacity-0 peer-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
                        <div className="bg-[#1B1B1B] p-6 border border-primary/40 w-64 shadow-[0_0_40px_rgba(82,185,70,0.2)]">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 italic">TOURNAMENT FORMAT</p>
                          <p className="text-[11px] text-white/80 leading-relaxed font-light italic">
                            {formatExplanations[typeof tournament.format === 'object' ? tournament.format?.system : ""] || "Standard tournament protocol."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className="h-[2px] w-12 bg-primary" />
                      <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.6em]">OVERVIEW</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                      {tournament.name}
                    </h1>
                  </div>
                  <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light italic">
                    {tournament.description || "Join the sector's elite in this high-stakes engagement. Success requires absolute precision and strategic dominance."}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-8">
                <div className="h-48">
                  {canJoin ? (
                    <motion.button 
                      onClick={handleJoin}
                      disabled={joining}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-full border-2 border-primary bg-primary/5 text-primary font-black text-sm uppercase tracking-[0.6em] transition-all hover:bg-primary hover:text-black hover:shadow-[0_0_50px_rgba(82,185,70,0.3)] flex items-center justify-center group relative overflow-hidden"
                    >
                      <span className="relative z-10">{joining ? "JOINING..." : "JOIN TOURNAMENT"}</span>
                      <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                  ) : isJoined ? (
                    <Link 
                      href={`/tournaments/${tournamentId}/lobby`}
                      className="w-full h-full bg-white text-black text-center font-black text-sm uppercase tracking-[0.6em] hover:bg-primary transition-all shadow-xl flex items-center justify-center italic"
                    >
                      GO TO TOURNAMENT
                    </Link>
                  ) : (
                    <div className="w-full h-full border-2 border-white/5 bg-[#1B1B1B] text-white/20 text-center font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center">
                      {tournament.status === "COMPLETED" ? "TOURNAMENT FINISHED" : "REGISTRATION CLOSED"}
                    </div>
                  )}
                </div>

                <ExpansionModule 
                  label="Tournament Status"
                  data={[
                    { label: "Status", value: tournament.status },
                    { label: "Enrolled", value: `${tournament.participants.length} / ${tournament.maxPlayers}` }
                  ]}
                />

                <ExpansionModule 
                  label="Event Logistics"
                  data={[
                    { label: "Date", value: tournament.date ? new Date(tournament.date).toLocaleDateString() : "TBD" },
                    { label: "Prize Pool", value: `₱${tournament.prizePool?.toLocaleString() || "0"}` },
                    { label: "Venue", value: tournament.venue || "Global Stadium" }
                  ]}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "PLAYERS" && (
            <motion.div 
              key="players"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-primary" />
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.6em]">PARTICIPANTS</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Tournament Roster</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tournament.participants.map((p: any, idx: number) => (
                  <div 
                    key={p.userId} 
                    className="p-8 border border-white/10 bg-[#1B1B1B] relative group hover:border-primary/40 transition-all"
                  >
                    <div className="absolute top-4 right-4 text-[8px] font-black text-white/10 group-hover:text-primary transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">SEED #{p.seed || idx + 1}</span>
                      <span className="text-xl font-black text-white uppercase tracking-tighter truncate">{p.user.username || p.user.guestName}</span>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-2">
                        {p.user.isGuest ? "GUEST" : "REGISTERED USER"}
                      </span>
                    </div>
                  </div>
                ))}
                {tournament.participants.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 bg-[#1B1B1B]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">No players registered for this tournament</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "LEADERBOARD" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-primary" />
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.6em]">TOURNAMENT LEADERBOARD</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Local Standings</h2>
              </div>

              <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl p-6">
                {leaderboardLoading ? (
                  <div className="flex min-h-[240px] items-center justify-center">
                    <div className="w-16 h-16 border-8 border-white/10 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : leaderboardError ? (
                  <div className="text-center py-16">
                    <p className="text-red-500 text-lg font-black uppercase tracking-[0.2em] mb-6">{leaderboardError}</p>
                    <button
                      onClick={fetchTournamentLeaderboard}
                      className="px-8 py-4 bg-primary text-black font-black uppercase tracking-[0.3em]"
                    >
                      Retry
                    </button>
                  </div>
                ) : tournamentLeaderboard.length === 0 ? (
                  <div className="text-center py-16 text-white/40 uppercase tracking-[0.2em] font-black">
                    No leaderboard data available yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full min-w-[740px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 uppercase text-[10px] tracking-[0.4em] font-black">
                          <th className="py-5 px-4">RANK</th>
                          <th className="py-5 px-4">PLAYER</th>
                          <th className="py-5 px-4 text-center">PTS</th>
                          <th className="py-5 px-4 text-center">W / L / D</th>
                          <th className="py-5 px-4 text-right">WIN %</th>
                          <th className="py-5 px-4 text-right">OMW</th>
                          <th className="py-5 px-4 text-right">OOMW</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {tournamentLeaderboard.map((entry) => (
                          <tr key={entry.userId} className="text-white/90 hover:bg-white/5 transition-colors">
                            <td className="py-5 px-4 font-black">#{entry.rank}</td>
                            <td className="py-5 px-4 font-semibold">{entry.username || "Guest"}</td>
                            <td className="py-5 px-4 text-center font-black">{entry.points}</td>
                            <td className="py-5 px-4 text-center">{entry.wins} / {entry.losses} / {entry.draws}</td>
                            <td className="py-5 px-4 text-right text-primary font-black">{Math.round(entry.matchWinPct * 100)}%</td>
                            <td className="py-5 px-4 text-right">{Math.round(entry.omw * 100)}%</td>
                            <td className="py-5 px-4 text-right">{Math.round(entry.oomw * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "BRACKET" && (
            <motion.div 
              key="bracket"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[600px] flex flex-col bg-[#1B1B1B] p-4 rounded-xl"
            >
               {tournament.status === "ONGOING" || tournament.status === "COMPLETED" ? (
                 <div className="flex-1 bg-[#1B1B1B] border border-white/5 p-8 rounded-3xl">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-12 text-center">Tournament Match History</p>
                    <div className="flex flex-col items-center justify-center gap-8 py-20">
                      <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary animate-pulse">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div className="text-center space-y-4">
                        <p className="text-xl font-black uppercase tracking-tighter text-white">Match History</p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] max-w-sm mx-auto">
                          Detailed match history is available for active and completed tournaments.
                        </p>
                      </div>
                      <Link 
                        href={`/tournaments/${tournamentId}/bracket`}
                        className="px-10 py-4 bg-primary text-black font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl hover:scale-105 transition-all"
                      >
                        VIEW BRACKET
                      </Link>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1">
                   <BracketPreview 
                     tournament={tournament}
                     isAdmin={false}
                     tournamentId={tournamentId}
                     onRefresh={() => {}}
                     addLog={() => {}}
                   />
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ExpansionModule({ label, data }: { label: string, data: { label: string, value: string }[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isHovered && !isExpanded) {
      interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            setIsExpanded(true);
            return 100;
          }
          return prev + 2; 
        });
      }, 20);
    } else if (!isHovered && !isExpanded) {
      setSyncProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, isExpanded]);

  useEffect(() => {
    if (!isHovered && isExpanded) {
      setIsExpanded(false);
      setSyncProgress(0);
    }
  }, [isHovered, isExpanded]);

  useEffect(() => {
    let cycleInterval: any;
    if (!isExpanded) {
      cycleInterval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % data.length);
      }, 3000);
    }
    return () => clearInterval(cycleInterval);
  }, [isExpanded, data.length]);

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsExpanded(!isExpanded);
      }}
      layout
      className={`p-8 border-2 transition-all duration-500 cursor-pointer relative overflow-hidden min-h-[160px] flex flex-col justify-center ${
        isExpanded ? "border-primary bg-primary/10" : "border-white/5 bg-[#1B1B1B] hover:border-white/20"
      }`}
    >
      {!isExpanded && isHovered && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${syncProgress}%` }}
          className="absolute top-0 left-0 h-1 bg-primary shadow-[0_0_15px_rgba(82,185,70,0.5)] z-40" 
        />
      )}

      {!isExpanded && (
        <div className="absolute bottom-6 left-8 flex items-center gap-2 z-20">
          {data.map((_, i) => (
            <motion.div 
              key={i}
              animate={{ 
                width: i === activeIndex ? 24 : 4,
                backgroundColor: i === activeIndex ? "rgba(82, 185, 70, 1)" : "rgba(255, 255, 255, 0.1)"
              }}
              className="h-1 rounded-full transition-all duration-500"
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isExpanded ? "text-primary" : "text-white/20"}`}>
            {label}
          </span>
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.span 
                key="rotation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[8px] font-black text-white/10 uppercase tracking-widest italic"
              >
                {isHovered ? "Syncing..." : "Automatic Rotation"}
              </motion.span>
            ) : (
              <motion.span 
                key="live"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[8px] font-black text-primary uppercase tracking-widest italic flex items-center gap-2"
              >
                <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                Live_Data
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div 
                key="expanded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`grid gap-8 ${data.length > 2 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2"}`}
              >
                {data.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">{item.label}</span>
                    <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">
                      {item.value}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key={activeIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-1"
              >
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{data[activeIndex].label}</span>
                <span className="text-3xl font-black text-white/80 uppercase tracking-tighter italic">
                  {data[activeIndex].value}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function TournamentViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] font-black text-primary uppercase tracking-[1em]"
        >
          Loading
        </motion.div>
      </div>
    }>
      <TournamentViewContent />
    </Suspense>
  );
}
