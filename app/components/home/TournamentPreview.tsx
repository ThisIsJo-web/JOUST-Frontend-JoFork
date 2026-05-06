"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "../../utils/api";
import { Tournament } from "../../tournaments/types";

export default function TournamentPreview() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.TOURNAMENTS}`);
        if (res.ok) {
          const data = await res.json();
          // Filter only relevant ones for the preview (OPEN, UPCOMING, PENDING)
          const relevant = data.filter((t: Tournament) => 
            t.status === "OPEN" || t.status === "UPCOMING" || t.status === "PENDING"
          );
          setTournaments(relevant);
        }
      } catch (e) {
        console.error("Failed to fetch tournaments for preview", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  if (loading || tournaments.length === 0) return null;

  // Sorting logic to find the "Big Card"
  const sorted = [...tournaments].sort((a, b) => {
    // OPEN tournaments always first
    if (a.status === "OPEN" && b.status !== "OPEN") return -1;
    if (a.status !== "OPEN" && b.status === "OPEN") return 1;
    
    // Then by date (closest first)
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  const featured = sorted[0];
  const others = sorted.slice(1, 4); // Show up to 3 others

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-primary/30"></span>
            Battle Arena
            <span className="h-px w-8 bg-primary/30"></span>
          </h2>
          <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Upcoming <span className="text-primary">Engagements</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Big Featured Card */}
          <div className="lg:col-span-8 group relative overflow-hidden bg-neutral-900 border border-neutral-800">
             <Link href={`/tournaments/${featured.id}`} className="block h-full">
                <div className="aspect-[16/9] w-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                   <div className="absolute inset-0 flex items-center justify-center text-neutral-800 text-9xl font-black italic opacity-20 pointer-events-none uppercase">
                      Featured
                   </div>
                   
                   <div className="absolute bottom-0 left-0 p-8 z-20 space-y-4 w-full">
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] px-3 py-1 font-black uppercase tracking-[0.2em] ${
                            featured.status === "OPEN" ? "bg-primary text-background" : "bg-neutral-800 text-neutral-400"
                         }`}>
                            {featured.status}
                         </span>
                         <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest italic">
                            {featured.date ? new Date(featured.date).toLocaleDateString() : "TBD"}
                         </span>
                      </div>
                      <h4 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white group-hover:text-primary transition-colors leading-none">
                         {featured.name}
                      </h4>
                      <p className="text-sm text-neutral-400 max-w-xl line-clamp-2">
                         {featured.description || "Join the most anticipated tournament of the season. High stakes, intense competition, and glory await."}
                      </p>
                      <div className="pt-4 flex items-center gap-6">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Prize Pool</span>
                            <span className="text-lg font-black text-white italic">{featured.prizePool ? `$${featured.prizePool}` : "GLORY"}</span>
                         </div>
                         <div className="w-px h-8 bg-neutral-800" />
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Format</span>
                            <span className="text-lg font-black text-white italic">{featured.format.replace("_", " ")}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </Link>
          </div>

          {/* Small Side Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             {others.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="group block bg-neutral-900/50 border border-neutral-800 hover:border-primary/30 transition-all">
                   <div className="p-6 flex gap-6 items-center">
                      <div className="h-20 w-20 flex-none bg-neutral-950 border border-neutral-800 relative overflow-hidden flex items-center justify-center text-neutral-800 font-black text-xs italic">
                         LOGO
                      </div>
                      <div className="space-y-1 min-w-0">
                         <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                               {t.status}
                            </span>
                         </div>
                         <h5 className="font-black italic uppercase tracking-tight text-white group-hover:text-primary transition-colors truncate">
                            {t.name}
                         </h5>
                         <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                            {t.date ? new Date(t.date).toLocaleDateString() : "Date TBD"}
                         </p>
                      </div>
                   </div>
                </Link>
             ))}
             {others.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-800 opacity-50">
                   <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 italic">More engagements coming soon.</p>
                </div>
             )}
             <Link href="/tournaments" className="mt-auto py-4 text-center border border-neutral-800 hover:bg-neutral-900 transition-all text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-white">
                View All Events
             </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
