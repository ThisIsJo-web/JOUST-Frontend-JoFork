import Image from "next/image";
import { Tournament } from "../types";
import Link from "next/link";

interface TournamentCardProps {
    tournament: Tournament;
}

export default function TournamentCard({ tournament: t }: TournamentCardProps) {
    const imageSrc = t.image || "/placeholder.jpg";
    const accentColor = t.color || "bg-primary";
    const description = t.description || `Tournament format: ${t.format.replace("_", " ")}. Max players: ${t.maxPlayers}. Prize pool: ${t.prizePool ? `₱${t.prizePool.toLocaleString()}` : "NO PRIZE"}`;

    return (
        <div className="group bg-foreground/5 border border-foreground/5 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:border-primary/30">
            {/* Top Half: Image */}
            <div className="h-[280px] relative overflow-hidden">
                <Image 
                    src={imageSrc} 
                    alt={t.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute top-0 left-0 w-full h-1 ${accentColor} z-10`} />
            </div>

            {/* Bottom Half: Details */}
            <div className="p-10 flex-1 flex flex-col bg-background border-t border-foreground/5">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-4 block font-poppins">
                    {t.status} Match
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-4 font-poppins line-clamp-1">
                    {t.name}
                </h3>
                <p className="text-sm text-foreground/50 font-questrial line-clamp-2 mb-8">
                    {description}
                </p>
                <Link 
                    href={`/tournaments/${t.id}`}
                    className="mt-auto w-full py-4 border border-foreground/10 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all rounded-2xl font-poppins text-center"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}