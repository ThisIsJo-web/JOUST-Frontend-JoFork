import Link from "next/link";
import { Tournament } from "../../tournaments/types";
import HomeFrame from "./HomeFrame";
import SectionHeader from "./SectionHeader";

interface TournamentPreviewProps {
  tournaments: Tournament[];
}

/**
 * TournamentPreview - Showcases upcoming engagements in a premium grid.
 * Refactored as a Server Component for instant performance.
 */
export default function TournamentPreview({ tournaments = [] }: TournamentPreviewProps) {
  if (tournaments.length === 0) return null;

  // Sorting logic for the featured display
  const sorted = [...tournaments].sort((a, b) => {
    if (a.status === "OPEN" && b.status !== "OPEN") return -1;
    if (a.status !== "OPEN" && b.status === "OPEN") return 1;
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    return dateA - dateB;
  });

  const featured = sorted[0];
  const others = sorted.slice(1, 4);

  return (
    <HomeFrame className="py-24">
      <div className="max-w-7xl mx-auto px-8">
        <SectionHeader 
          title="Tournaments" 
          subtitle="Join the most anticipated competitions of the season. High stakes, intense play, and leaderboard glory await." 
          centered
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Featured Large Entry */}
          <div className="lg:col-span-8 group">
            <Link href={`/tournaments/${featured.id}`} className="block relative aspect-[16/9] bg-background overflow-hidden border border-foreground/5 group-hover:border-primary/40 transition-all duration-500">
              {/* Background Decoration */}
              <div className="absolute inset-0 z-0 flex items-center justify-center text-foreground/5 text-9xl font-black select-none">
                FEATURED
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
              
              <div className="absolute bottom-0 left-0 p-10 z-20 space-y-6 w-full">
                <div className="flex items-center gap-4 font-poppins">
                  <span className={`text-[10px] px-4 py-1.5 font-black uppercase tracking-[0.2em] shadow-lg ${
                    featured.status === "OPEN" ? "bg-gradient-primary text-background" : "bg-foreground/10 text-foreground"
                  }`}>
                    {featured.status}
                  </span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                    {featured.date ? new Date(featured.date).toLocaleDateString() : "TBD"}
                  </span>
                </div>
                
                <h4 className="text-3xl md:text-6xl font-black tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors leading-none font-poppins">
                  {featured.name}
                </h4>

                <div className="flex items-center gap-8 pt-2 font-poppins">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Prize Pool</span>
                    <span className="text-xl font-black text-primary-light drop-shadow-[0_0_10px_var(--color-primary-glow)]">{featured.prizePool ? `$${featured.prizePool}` : "GLORY"}</span>
                  </div>
                  <div className="w-px h-10 bg-foreground/10" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Format</span>
                    <span className="text-xl font-black text-foreground">{featured.format.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              {/* Interaction Overlay */}
              <div className="absolute top-8 right-8 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-primary text-background p-4 flex items-center justify-center font-black text-xs">
                  JOIN NOW →
                </div>
              </div>
            </Link>
          </div>

          {/* List of Other Entries */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-2">Upcoming Tournaments</h5>
            {others.map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="group block bg-foreground/[0.02] border border-foreground/5 hover:border-primary/40 transition-all p-6">
                <div className="flex gap-6 items-center">
                  <div className="h-20 w-20 flex-none bg-background border border-foreground/5 relative overflow-hidden flex items-center justify-center text-foreground/5 font-black text-xs">
                    LOGO
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                        {t.status}
                      </span>
                    </div>
                    <h5 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors truncate leading-tight font-poppins">
                      {t.name}
                    </h5>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest font-questrial">
                      {t.date ? new Date(t.date).toLocaleDateString() : "Date TBD"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            
            {others.length === 0 && (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-foreground/10 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">More tournaments soon.</p>
              </div>
            )}
            
            <Link href="/tournaments" className="group mt-auto py-5 flex items-center justify-center border border-foreground/10 hover:border-primary/40 hover:bg-primary/5 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 group-hover:text-primary">
                View All Tournaments
              </span>
            </Link>
          </div>
        </div>
      </div>
    </HomeFrame>
  );
}
