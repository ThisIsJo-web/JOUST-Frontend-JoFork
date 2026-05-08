"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch, safeJson, API_ENDPOINTS } from "../../utils/api";
import DevPanel from "../components/DevPanel";

export default function DevPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTournaments();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (!res.ok) { router.push("/auth"); return; }
      const me = await safeJson(res);
      if (!me?.roles?.includes("ADMIN")) { router.push("/"); return; }
    } catch (e) {
      router.push("/");
    }
  };

  const fetchTournaments = async () => {
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE);
      if (res.ok) {
        setTournaments(await safeJson(res) || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-primary font-black uppercase tracking-widest animate-pulse">Loading Developer Panel...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground p-8 md:p-12">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
        <div>
           <button 
              onClick={() => router.push("/admin")}
              className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 hover:opacity-70 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
              Back to Admin
            </button>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Developer <span className="text-primary">Panel</span></h1>
          <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mt-2">System management and diagnostic tools</p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto">
        <DevPanel tournaments={tournaments} onRefresh={fetchTournaments} />
      </main>
    </div>
  );
}
