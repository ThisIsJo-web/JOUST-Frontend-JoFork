"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";
import { Tournament } from "../types";
import CreateTournamentForm from "./components/CreateTournamentForm";
import TournamentRow from "./components/TournamentRow";

export default function ManageTournaments() {
  const router = useRouter();
  const [loading, setLoading]               = useState(true);
  const [tournaments, setTournaments]       = useState<Tournament[]>([]);
  const [user, setUser]                     = useState<{ roles: string[]; id: string; sub?: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage]               = useState("");

  const refresh = async () => {
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE);
    const data = await safeJson(res);
    if (Array.isArray(data)) setTournaments(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [userRes, tourneyRes] = await Promise.all([
          authenticatedFetch(API_ENDPOINTS.AUTH.ME),
          authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE),
        ]);
        if (userRes.ok) {
          const userData = await safeJson(userRes);
          if (!userData?.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER")) {
            router.push("/tournaments"); return;
          }
          setUser(userData);
        } else {
          router.push("/auth"); return;
        }
        const data = await safeJson(tourneyRes);
        if (Array.isArray(data)) setTournaments(data);
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleComplete = async (id: string) => {
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(id), { method: "PATCH" });
    if (res.ok) { setMessage("Tournament Finalized"); await refresh(); }
    else { setMessage("Error: Update Failed"); }
  };

  const handleFormSuccess = async (msg: string) => {
    setMessage(msg);
    setShowCreateForm(false);
    await refresh();
    setTimeout(() => setMessage(""), 4000);
  };

  const userId = user?.sub || user?.id || "";
  const isAuthorized = user?.roles?.some(r => r === "ADMIN" || r === "ORGANIZER");

  if (loading) return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Opening Management Console</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
      <Navbar />
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-foreground/5 pb-12">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2 block">Management Terminal</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground font-poppins">Manage Tournaments</h1>
          </div>
          <div className="flex gap-4">
            {user?.roles?.includes("ADMIN") && (
              <button onClick={() => router.push("/tournaments/manage/organizers")} className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest font-poppins bg-foreground/5 border border-foreground/10 text-foreground hover:bg-foreground/10">
                Manage Organizers
              </button>
            )}
            <button onClick={() => setShowCreateForm(v => !v)} className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest font-poppins transition-all ${showCreateForm ? "bg-foreground/5 text-foreground" : "bg-primary text-white hover:brightness-110 shadow-xl shadow-primary/20"}`}>
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
          <CreateTournamentForm
            userId={userId}
            onSuccess={handleFormSuccess}
            onDiscard={() => setShowCreateForm(false)}
          />
        )}

        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40 font-poppins mb-8">Active Deployments</h2>
          <div className="grid grid-cols-1 gap-4">
            {tournaments.map(t => (
              <TournamentRow
                key={t.id}
                tournament={t}
                onComplete={handleComplete}
                onCopyLink={msg => { setMessage(msg); setTimeout(() => setMessage(""), 3000); }}
                onControlRoom={id => router.push(`/tournaments/${id}/manage`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}