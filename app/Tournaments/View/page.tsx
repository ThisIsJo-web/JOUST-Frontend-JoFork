"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../utils/api";
import { Tournament } from "../types";
import Image from "next/image";
import Link from "next/link";

function TournamentViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("id");

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [user, setUser] = useState<{ sub: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    } else {
      router.push("/Tournaments");
    }
  }, [tournamentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, tRes] = await Promise.all([
        authenticatedFetch(API_ENDPOINTS.AUTH.ME),
        authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!))
      ]);
      
      if (meRes.ok) setUser(await meRes.json());
      if (tRes.ok) setTournament(await tRes.json());
      
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
        router.push("/Auth");
        return;
    }
    setJoining(true);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId!), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.sub }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
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
        <Navbar />
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

  if (!tournament) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-black uppercase tracking-widest">Arena Not Found</div>;

  // The backend JWT uses `sub` as the user ID, so we check both fields for safety
  const myId = user?.sub || (user as any)?.id;
  const isJoined = tournament.participants.some(p => p.userId === myId);
  const isFull = tournament.participants.length >= tournament.maxPlayers;
  const registrationOpen = tournament.status === "OPEN" || tournament.status === "UPCOMING";
  const canJoin = registrationOpen && !isJoined && !isFull && !!user;

  return (
    <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Tournament Identity */}
            <div className="lg:col-span-8 space-y-12">
                <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden group">
                    <Image 
                        src={tournament.image || "/placeholder.jpg"} 
                        alt={tournament.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12">
                        <span className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.3em] text-white uppercase rounded-md bg-primary font-poppins mb-6">
                            {tournament.status} Event
                        </span>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white font-poppins leading-[0.8] mb-8">{tournament.name}</h1>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground font-poppins">Event Intelligence</h2>
                        <div className="h-[1px] flex-1 bg-foreground/10"></div>
                    </div>
                    <p className="text-xl text-foreground/60 leading-relaxed font-questrial max-w-3xl">
                        {tournament.description || "The arena is set for an epic showdown. Join combatants from across the sector in this high-stakes tournament. Strategic coordination and precision are required for victory."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SpecBox label="Combat Format" value={tournament.format.replace("_", " ")} color="text-primary" />
                    <SpecBox label="Prize Pool" value={`₱${tournament.prizePool?.toLocaleString() || "0"}`} color="text-primary" />
                    <SpecBox label="Max Capacity" value={`${tournament.maxPlayers} Players`} color="text-primary" />
                </div>
            </div>

            {/* Right: Actions & Roster */}
            <div className="lg:col-span-4 space-y-8">
                {/* Participation Card */}
                <div className="bg-foreground/5 border border-foreground/5 p-10 rounded-[2.5rem] space-y-8">
                    {canJoin ? (
                        <button 
                            onClick={handleJoin}
                            disabled={joining}
                            className="w-full py-6 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 font-poppins"
                        >
                            {joining ? "DEPLOYING..." : "JOIN ARENA"}
                        </button>
                    ) : (
                        <div className="w-full py-6 bg-foreground/10 text-foreground/40 text-center font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl font-poppins">
                            {isJoined ? "YOU ARE ENLISTED" : isFull ? "ARENA CAPACITY REACHED" : `STATUS: ${tournament.status}`}
                        </div>
                    )}

                    <Link 
                        href={`/Tournaments/Bracket?id=${tournamentId}`}
                        className="w-full flex items-center justify-center py-6 border border-foreground/10 text-foreground font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-foreground hover:text-background transition-all font-poppins"
                    >
                        VIEW BRACKETS
                    </Link>
                </div>

                {/* Live Roster */}
                <div className="bg-foreground/5 border border-foreground/5 p-10 rounded-[2.5rem] space-y-8">
                    <div className="flex justify-between items-center border-b border-foreground/10 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground font-poppins">Live Roster</h3>
                        <span className="text-[10px] font-black text-primary font-poppins">{tournament.participants.length} / {tournament.maxPlayers}</span>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                        {tournament.participants.map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-4 group">
                                <span className="text-primary font-black text-[10px] font-poppins opacity-40 group-hover:opacity-100 transition-opacity">{(idx + 1).toString().padStart(2, '0')}</span>
                                <span className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{p.user.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function SpecBox({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-8 bg-foreground/5 border border-foreground/5 rounded-3xl space-y-2">
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest font-poppins">{label}</p>
            <p className={`text-xl font-black uppercase tracking-tighter font-poppins ${color}`}>{value}</p>
        </div>
    );
}

export default function TournamentViewPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Entering Terminal</p>
            </div>
        </div>
    }>
      <TournamentViewContent />
    </Suspense>
  );
}
