"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../utils/api";
import { Tournament } from "../types";

export default function ManageTournaments() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [user, setUser] = useState<{ roles: string[], sub: string } | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [message, setMessage] = useState("");

    // Create Form State
    const [name, setName] = useState("");
    const [format, setFormat] = useState("SINGLE_ELIMINATION");
    const [maxPlayers, setMaxPlayers] = useState(16);
    const [prizePool, setPrizePool] = useState<number | "">("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [startNow, setStartNow] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            try {
                const [userRes, tourneyRes] = await Promise.all([
                    authenticatedFetch(API_ENDPOINTS.AUTH.ME),
                    authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE)
                ]);

                if (userRes.ok) {
                    const userData = await userRes.json();
                    const isAuthorized = userData.roles?.some((role: string) => role === "ADMIN" || role === "ORGANIZER");
                    if (!isAuthorized) {
                        router.push("/Tournaments");
                        return;
                    }
                    setUser(userData);
                } else {
                    router.push("/Auth");
                    return;
                }

                if (tourneyRes.ok) {
                    setTournaments(await tourneyRes.json());
                }
            } catch (error) {
                console.error("Initialization failed:", error);
            } finally {
                setLoading(false);
            }
        };
        checkAuthAndFetch();
    }, [router]);

    const handleCreateTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        if (!user) return;
        try {
            const response = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    format,
                    maxPlayers: Number(maxPlayers),
                    prizePool: prizePool === "" ? null : Number(prizePool),
                    isPrivate,
                    startNow,
                    createdById: user.sub,
                }),
            });
            if (response.ok) {
                setMessage("Arena Initialized Successfully");
                setShowCreateForm(false);
                // Reset form
                setName("");
                setFormat("SINGLE_ELIMINATION");
                setMaxPlayers(16);
                setPrizePool("");
                setIsPrivate(false);
                setStartNow(false);
                // Refresh list
                const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE);
                if (res.ok) setTournaments(await res.json());
            } else {
                const data = await response.json();
                setMessage(`Error: ${data.message || "Failed to create"}`);
            }
        } catch (error) {
            setMessage("Error: Connection Failed");
        }
    };

    const handleCompleteTournament = async (id: string) => {
        try {
            const response = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(id), { method: "PATCH" });
            if (response.ok) {
                setMessage("Tournament Finalized");
                const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE);
                if (res.ok) setTournaments(await res.json());
            }
        } catch (error) {
            setMessage("Error: Update Failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Opening Management Console</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
            <Navbar />
            
            <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-foreground/5 pb-12">
                    <div>
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2 block">Management Terminal</span>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground font-poppins">Manage Tournaments</h1>
                    </div>
                    <div className="flex gap-4">
                        {user?.roles?.includes("ADMIN") && (
                            <button 
                                onClick={() => router.push("/Tournaments/Manage/Organizers")}
                                className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all font-poppins bg-foreground/5 border border-foreground/10 text-foreground hover:bg-foreground/10 hover:border-foreground/20"
                            >
                                Manage Organizers
                            </button>
                        )}
                        <button 
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all font-poppins ${
                                showCreateForm ? 'bg-foreground/5 text-foreground hover:bg-foreground/10' : 'bg-primary text-white hover:brightness-110 shadow-xl shadow-primary/20'
                            }`}
                        >
                            {showCreateForm ? "Discard Changes" : "New Tournament"}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-center font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                        {message}
                    </div>
                )}

                {showCreateForm && (
                    <div className="mb-12 bg-foreground/5 border border-primary/20 p-8 md:p-12 rounded-[2.5rem] animate-in fade-in zoom-in duration-500">
                        <form onSubmit={handleCreateTournament} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 font-poppins">Arena Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="E.G. PRO LEAGUE" className="w-full h-14 bg-background border border-foreground/10 px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 font-poppins">Combat Format</label>
                                <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full h-14 bg-background border border-foreground/10 px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none">
                                    <option value="SINGLE_ELIMINATION">SINGLE ELIMINATION</option>
                                    <option value="DOUBLE_ELIMINATION">DOUBLE ELIMINATION</option>
                                    <option value="SWISS">SWISS</option>
                                    <option value="ROUND_ROBIN">ROUND ROBIN</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 font-poppins">Max Capacity</label>
                                <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} className="w-full h-14 bg-background border border-foreground/10 px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 font-poppins">Prize Pool (₱)</label>
                                <input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value === "" ? "" : Number(e.target.value))} placeholder="OPTIONAL" className="w-full h-14 bg-background border border-foreground/10 px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all rounded-xl" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-6 h-6 accent-primary bg-background border-foreground/10 rounded-lg" />
                                    <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest font-poppins group-hover:text-primary transition-colors">Private Arena</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={startNow} onChange={(e) => setStartNow(e.target.checked)} className="w-6 h-6 accent-green-500 bg-background border-foreground/10 rounded-lg" />
                                    <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest font-poppins group-hover:text-green-500 transition-colors">Start Now (Open Registration)</span>
                                </label>
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">Initialize Arena</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40 font-poppins mb-8">Active Deployments</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {tournaments.map((t) => (
                            <div key={t.id} className="bg-foreground/5 border border-foreground/5 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-primary/20">
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary border border-primary/10">
                                        {t.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground font-poppins">{t.name}</h3>
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t.format.replace("_", " ")} · {t.maxPlayers} PLAYERS · {t.status}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {t.status !== "COMPLETED" && (
                                        <button 
                                            onClick={() => handleCompleteTournament(t.id)}
                                            className="flex-1 md:w-40 py-4 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-xl font-poppins"
                                        >
                                            Complete
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => router.push(`/Tournaments/Manage/ControlRoom?id=${t.id}`)}
                                        className="flex-1 md:w-40 py-4 bg-foreground/10 text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all rounded-xl font-poppins"
                                    >
                                        Control Room
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}