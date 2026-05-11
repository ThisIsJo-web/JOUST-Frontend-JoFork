"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";
import { Tournament } from "../types";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function TournamentViewContent() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [user, setUser] = useState<{ sub: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

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

  if (loading && !tournament) {
    return (
      <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
        <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <div className="h-[400px] md:h-[600px] bg-foreground/10 rounded-[3rem]" />
              <div className="space-y-4">
                <div className="h-4 w-40 bg-foreground/10 rounded-md" />
                <div className="h-12 w-full bg-foreground/10 rounded-xl" />
                <div className="h-20 w-full bg-foreground/5 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-foreground/5 rounded-3xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="h-64 bg-foreground/5 rounded-[2.5rem]" />
              <div className="h-96 bg-foreground/5 rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-black uppercase tracking-widest">Tournament Not Found</div>;

  // The backend JWT uses `sub` as the user ID, so we check both fields for safety
  const myId = user?.sub || (user as any)?.id;
  const isJoined = tournament.participants.some(p => p.userId === myId);
  const isFull = tournament.participants.length >= tournament.maxPlayers;
  const registrationOpen = tournament.status === "OPEN" || tournament.status === "UPCOMING";
  const canJoin = registrationOpen && !isJoined && !isFull && !!user;

  const formatExplanations: Record<string, string> = {
    SINGLE_ELIMINATION: "Loss results in immediate disqualification. High-stakes, high-precision combat.",
    DOUBLE_ELIMINATION: "Features a secondary bracket for losers. Two losses required for elimination.",
    SWISS: "Fixed number of rounds. Matches players with similar records. No one is eliminated early.",
    ROUND_ROBIN: "Every participant plays every other participant. Final ranking based on overall record."
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white font-poppins selection:bg-primary selection:text-black overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-32 flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* LEFT COLUMN: VISUAL & NARRATIVE */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            {/* Picture Module with Format Overlay */}
            <div className="relative group border-2 border-white/5 overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <Image 
                  src={tournament.image || "/placeholder.jpg"} 
                  alt={tournament.name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              
              {/* Format Tag & Explanation */}
              <div className="absolute top-6 left-6 flex flex-col items-start gap-4 z-20">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 bg-primary text-black font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl cursor-help peer"
                  >
                    {tournament.format.replace("_", " ")}
                  </motion.div>
                  
                  {/* Hover Explanation anchored to the tag */}
                  <div className="absolute top-full left-0 mt-4 opacity-0 peer-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
                    <div className="bg-black/90 backdrop-blur-md p-6 border border-primary/40 w-64 shadow-[0_0_40px_rgba(82,185,70,0.2)]">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 italic">Format_Protocol</p>
                      <p className="text-[11px] text-white/80 leading-relaxed font-light italic">
                        {formatExplanations[tournament.format] || "Standard tournament protocol."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Area with Heavily Stylized Title */}
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-12 bg-primary" />
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.6em]">Briefing_001</span>
                </div>
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none"
                >
                  {tournament.name}
                </motion.h1>
              </div>
              <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light italic">
                {tournament.description || "Join the sector's elite in this high-stakes engagement. Success requires absolute precision and strategic dominance."}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: OPERATIONS */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* TOP: JOIN ACTION */}
            <div className="h-48">
              {canJoin ? (
                <motion.button 
                  onClick={handleJoin}
                  disabled={joining}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-full border-2 border-primary bg-primary/5 text-primary font-black text-sm uppercase tracking-[0.6em] transition-all hover:bg-primary hover:text-black hover:shadow-[0_0_50px_rgba(82,185,70,0.3)] flex items-center justify-center group relative overflow-hidden"
                >
                  <span className="relative z-10">{joining ? "INITIALIZING..." : "JOIN_TOURNAMENT"}</span>
                  <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
              ) : isJoined ? (
                <Link 
                  href={`/tournaments/${tournamentId}/lobby`}
                  className="w-full h-full bg-white text-black text-center font-black text-sm uppercase tracking-[0.6em] hover:bg-primary transition-all shadow-xl flex items-center justify-center italic"
                >
                  ENTER_LOBBY
                </Link>
              ) : (
                <div className="w-full h-full border-2 border-white/5 bg-white/[0.02] text-white/20 text-center font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center">
                  REGISTRATION_CLOSED
                </div>
              )}
            </div>

            {/* MIDDLE: STATUS MODULE (2s Expansion + Cycling) */}
            <ExpansionModule 
              label="Tournament Status"
              status={tournament.status}
              data={[
                { label: "Status", value: tournament.status },
                { label: "Enrolled", value: `${tournament.participants.length} / ${tournament.maxPlayers}` }
              ]}
            />

            {/* BOTTOM: SPECS MODULE (2s Expansion + Cycling) */}
            <ExpansionModule 
              label="Event Logistics"
              status={tournament.status}
              data={[
                { label: "Date", value: tournament.date ? new Date(tournament.date).toLocaleDateString() : "TBD" },
                { label: "Prize Pool", value: `₱${tournament.prizePool?.toLocaleString() || "0"}` },
                { label: "Venue", value: tournament.venue || "Global Stadium" }
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ExpansionModule({ label, data }: { label: string, data: { label: string, value: string }[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Expansion Sync Timer
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

  // Immediate Recoil on Mouse Exit
  useEffect(() => {
    if (!isHovered && isExpanded) {
      // Small delay only for mobile feel? User said "as soon as i stop" so let's be snappy
      setIsExpanded(false);
      setSyncProgress(0);
    }
  }, [isHovered, isExpanded]);

  // Cycling Logic
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
        // Toggle only for mobile/touch (where hover is simulation)
        // Check if it's a touch device or just allow toggle as a backup
        setIsExpanded(!isExpanded);
      }}
      layout
      className={`p-8 border-2 transition-all duration-500 cursor-pointer relative overflow-hidden min-h-[160px] flex flex-col justify-center ${
        isExpanded ? "border-primary bg-primary/10" : "border-white/5 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      {/* 1. Expansion Sync Bar (Top) */}
      {!isExpanded && isHovered && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${syncProgress}%` }}
          className="absolute top-0 left-0 h-1 bg-primary shadow-[0_0_15px_rgba(82,185,70,0.5)] z-40" 
        />
      )}

      {/* 2. Tactical Pagination (Bottom) - Dots to Dashes */}
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
