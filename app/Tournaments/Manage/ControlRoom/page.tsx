"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../../utils/api";
import { Tournament } from "../../types";

function ControlRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("id");

  const [user, setUser] = useState<{ id: string; sub: string; roles: string[] } | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [allUsers, setAllUsers] = useState<{ id: string; username: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editFormat, setEditFormat] = useState("");
  const [editMaxPlayers, setEditMaxPlayers] = useState(0);
  const [editPrizePool, setEditPrizePool] = useState<number | "">("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);

  const [guestUsername, setGuestUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    } else {
      router.push("/Tournaments/Manage");
    }
  }, [tournamentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData);
        if (meData.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER")) {
          const usersRes = await authenticatedFetch(API_ENDPOINTS.AUTH.USERS);
          if (usersRes.ok) setAllUsers(await usersRes.json());
        } else {
            router.push("/Tournaments");
            return;
        }
      } else {
        router.push("/Auth");
        return;
      }

      const tRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!));
      if (tRes.ok) {
        const tData = await tRes.json();
        setTournament(tData);
        setEditName(tData.name);
        setEditFormat(tData.format);
        setEditMaxPlayers(tData.maxPlayers);
        setEditPrizePool(tData.prizePool || "");
        setEditIsPrivate(tData.isPrivate || false);
      } else {
        setMessage("Tournament not found");
      }
    } catch (error) {
      setMessage("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          format: editFormat,
          maxPlayers: Number(editMaxPlayers),
          prizePool: editPrizePool === "" ? null : Number(editPrizePool),
          isPrivate: editIsPrivate,
        }),
      });
      if (res.ok) {
        setMessage("Arena Specs Updated");
        setIsEditing(false);
        fetchData();
      }
    } catch (error) {
      setMessage("Update failed");
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
        setMessage("Combatant Registered");
        fetchData();
        return true;
      } else {
        const err = await res.json();
        setMessage(err.message || "Registration failed");
        return false;
      }
    } catch (error) {
      setMessage("Connection error");
      return false;
    }
  };

  const handleAddGuest = async () => {
    if (!guestUsername) return;
    if (tournament && tournament.participants.length >= tournament.maxPlayers) {
      setMessage("Arena at maximum capacity");
      return;
    }

    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: guestUsername }),
      });
      if (res.ok) {
        setMessage("Guest Registered");
        setGuestUsername("");
        fetchData();
      } else {
        const err = await res.json();
        setMessage(err.message || "Guest failed");
      }
    } catch (error) {
      setMessage("Guest registration error");
    }
  };

  const handleFillWithGuests = async () => {
    if (!tournament) return;
    const remaining = tournament.maxPlayers - tournament.participants.length;
    if (remaining <= 0) return;

    if (!confirm(`Initialize bulk deployment of ${remaining} combatants?`)) return;

    setLoading(true);
    setMessage(`Deploying ${remaining} guests...`);
    
    try {
      for (let i = 0; i < remaining; i++) {
        const guestName = `Guest ${tournament.participants.length + i + 1}`;
        await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestName }),
        });
      }
      await fetchData();
    } catch (error) {
      setMessage("Bulk deployment encountered errors");
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    if (!confirm("Initiate combat sequence?")) return;
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.START(tournamentId!), { method: "POST" });
      if (res.ok) {
        setMessage("Combat initiated!");
        fetchData();
      }
    } catch (error) {
      setMessage("Activation failed");
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Terminal</p>
            </div>
        </div>
    );
  }

  if (!tournament) return <div className="min-h-screen flex items-center justify-center text-white bg-background font-black uppercase tracking-widest">Arena Offline</div>;

  return (
    <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
      <Navbar />
      
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
        {/* Navigation & Status Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-foreground/5 pb-12">
            <div>
                <button 
                    onClick={() => router.push("/Tournaments/Manage")}
                    className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins mb-4 hover:opacity-70 transition-all flex items-center gap-2"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
                    Back to Console
                </button>
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none">{tournament.name}</h1>
                <div className="flex items-center gap-4 mt-6">
                    <span className="bg-primary text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-md">{tournament.status}</span>
                    <span className="text-foreground/40 text-[10px] font-black uppercase tracking-widest font-poppins">
                        {tournament.format.replace("_", " ")} · ₱{tournament.prizePool?.toLocaleString() || "0"} POOL
                    </span>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button 
                    onClick={() => router.push(`/Tournaments/Bracket?id=${tournamentId}`)}
                    className="flex-1 md:px-12 py-5 border-2 border-primary text-primary font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all font-poppins"
                >
                    Brackets
                </button>
                {tournament.status === "OPEN" && (
                    <button 
                        onClick={handleStartTournament}
                        className="flex-1 md:px-12 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 font-poppins"
                    >
                        Initiate Combat
                    </button>
                )}
            </div>
        </div>

        {message && (
            <div className="mb-12 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-center font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                {message}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Combatant Roster */}
            <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center gap-6 mb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground font-poppins">
                        Arena Roster <span className="text-foreground/20 ml-2">[{tournament.participants.length}/{tournament.maxPlayers}]</span>
                    </h2>
                    <div className="h-[1px] flex-1 bg-foreground/10"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.participants.length === 0 ? (
                        <div className="col-span-full py-20 border border-dashed border-foreground/10 rounded-[2.5rem] flex items-center justify-center text-foreground/20 font-black uppercase text-sm tracking-widest">
                            No combatants deployed
                        </div>
                    ) : (
                        tournament.participants.map((p, idx) => (
                            <div key={p.id} className="bg-foreground/5 border border-foreground/5 p-6 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <span className="text-primary font-black text-[10px] font-poppins w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                                    <span className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{p.user.username || p.user.guestName}</span>
                                </div>
                                <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">#{p.user.id.slice(0,6)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Technical Specs & Management */}
            <div className="lg:col-span-4 space-y-8">
                {/* Arena Specifications */}
                <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[2.5rem]">
                    <div className="flex justify-between items-center mb-8 border-b border-foreground/10 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground font-poppins">Technical Specs</h3>
                        <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest font-poppins">
                            {isEditing ? "Discard" : "Modify"}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateTournament} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Arena Name</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Combat Format</label>
                                <select value={editFormat} onChange={e => setEditFormat(e.target.value)} className="w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none">
                                    <option value="SINGLE_ELIMINATION">SINGLE ELIMINATION</option>
                                    <option value="SWISS">SWISS</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Capacity</label>
                                    <input type="number" value={editMaxPlayers} onChange={e => setEditMaxPlayers(Number(e.target.value))} className="w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Prize (₱)</label>
                                    <input type="number" value={editPrizePool} onChange={e => setEditPrizePool(e.target.value === "" ? "" : Number(e.target.value))} className="w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all font-poppins">Commit Specs</button>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins">Format</p>
                                <p className="text-xs font-black text-foreground uppercase tracking-tight">{tournament.format.replace("_"," ")}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins">Capacity</p>
                                <p className="text-xs font-black text-foreground uppercase tracking-tight">{tournament.maxPlayers} MAX</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins">Privacy</p>
                                <p className="text-xs font-black text-foreground uppercase tracking-tight">{tournament.isPrivate ? "RESTRICTED" : "OPEN"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins">Status</p>
                                <p className="text-xs font-black text-primary uppercase tracking-tight">{tournament.status}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tactical Management */}
                {tournament.status === "OPEN" && (
                    <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[2.5rem] space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b border-foreground/10 pb-4 font-poppins">Deployment Tools</h3>
                        
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Summon Guest</p>
                            <div className="flex gap-2">
                                <input placeholder="ARENA NAME" value={guestUsername} onChange={e => setGuestUsername(e.target.value)} className="flex-1 h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                                <button onClick={handleAddGuest} className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary font-black text-xl hover:bg-primary hover:text-white transition-all rounded-xl">+</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Invite Authorized User</p>
                            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none">
                                <option value="">SELECT PLAYER</option>
                                {allUsers.filter(u => !tournament.participants.some(p => p.userId === u.id)).map(u => (
                                    <option key={u.id} value={u.id}>{(u.username || (u as any).guestName || "Unknown User").toUpperCase()}</option>
                                ))}
                             </select>

                            <button onClick={() => selectedUserId && handleJoin(selectedUserId)} className="w-full py-4 bg-foreground/10 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-foreground hover:text-background transition-all font-poppins">Send Invitation</button>
                        </div>

                        {tournament.participants.length < tournament.maxPlayers && (
                            <button 
                                onClick={handleFillWithGuests}
                                className="w-full py-4 border border-foreground/10 text-foreground/40 hover:text-primary hover:border-primary font-black text-[9px] uppercase tracking-[0.2em] rounded-xl transition-all font-poppins"
                            >
                                Bulk Deployment ({tournament.maxPlayers - tournament.participants.length} Slots)
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default function ControlRoomPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Terminal</p>
            </div>
        </div>
    }>
      <ControlRoomContent />
    </Suspense>
  );
}