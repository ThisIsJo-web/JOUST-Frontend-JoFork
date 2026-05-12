"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";
import { Tournament } from "../types";
import ManagerLayout from "../../components/manage/ManagerLayout";
import ManagerTournamentTable from "../../components/tournaments/manage/ManagerTournamentTable";

export default function ManageTournaments() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [message, setMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const refresh = async () => {
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE);
    const data = await safeJson(res);
    if (Array.isArray(data)) setTournaments(data);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (!meRes.ok) { router.push("/auth"); return; }
      const me = await safeJson(meRes);
      const roles = me?.roles || [];
      if (!roles.includes("ADMIN") && !roles.includes("ORGANIZER")) {
        setIsAuthorized(false);
        router.push("/");
        return;
      }
      setIsAuthorized(true);
      await refresh();
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleComplete = async (id: string) => {
    if (!confirm("Finalize this tournament? All guest data will be scrubbed and status set to COMPLETED.")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(id), { method: "PATCH" });
    if (res.ok) { 
      setMessage("TOURNAMENT_FINALIZED"); 
      await refresh(); 
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (isAuthorized === false) return null;

  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
        <div className="text-primary font-black uppercase tracking-[0.5em] animate-pulse">Syncing Organizer Clearance...</div>
      </div>
    );
  }

  return (
    <ManagerLayout breadcrumbs={[{ label: "TOURNAMENTS" }]}>
      <div className="space-y-10">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div className="flex items-center gap-6">
            <span className="text-primary text-4xl font-black select-none tracking-tighter">//</span>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              JOUST <span className="text-white/20">TOURNAMENT SYSTEM</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              className="px-10 py-4 bg-white/5 border border-white/10 text-white/40 font-black text-[11px] uppercase tracking-[0.3em] rounded-[4px] hover:bg-white/10 transition-all"
              onClick={() => alert("Templates Slide-over coming soon...")}
            >
              TEMPLATES
            </button>
            <Link 
              href="/tournaments/create"
              className="px-10 py-4 bg-primary text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-[4px] hover:brightness-110 transition-all shadow-xl shadow-primary/20"
            >
              CREATE NEW +
            </Link>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-[4px] text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
            {message}
          </div>
        )}

        <ManagerTournamentTable 
          tournaments={tournaments} 
          onComplete={handleComplete} 
        />
      </div>
    </ManagerLayout>
  );
}