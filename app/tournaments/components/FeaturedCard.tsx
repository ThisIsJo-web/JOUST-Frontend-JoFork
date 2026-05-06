import Link from "next/link";
import Image from "next/image";
import { Tournament } from "../types";

interface FeaturedCardProps {
    tournament: Tournament;
    isMain?: boolean;
}

export default function FeaturedCard({ tournament: t, isMain = false }: FeaturedCardProps) {
    const imageSrc = t.image || "/placeholder.jpg";
    const accentColor = t.color || "bg-primary";
    const description = t.description || "The premier competitive event of the season. High stakes, elite players, and a massive prize pool. Join the best in the arena.";

    return (
        <div className={`bg-foreground/5 border border-foreground/5 flex flex-col md:flex-row h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 ${isMain ? 'min-h-[500px] lg:min-h-[700px]' : ''}`}>
            {/* Left Side: Image Section */}
            <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto overflow-hidden">
                <Image 
                    src={imageSrc} 
                    alt={t.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover transition-all duration-700 hover:scale-105" 
                    priority={isMain}
                />
                <div className={`absolute top-0 left-0 w-full h-2 ${accentColor} z-10`} />
            </div>
            
            {/* Right Side: Content Area */}
            <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-background border-l border-foreground/5">
                <div className="space-y-6 md:space-y-8">
                    <span className={`inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.3em] text-white uppercase rounded-md ${accentColor} font-poppins`}>
                        Featured Arena Event
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-foreground font-poppins">
                        {t.name}
                    </h1>
                    <p className="text-base md:text-lg text-foreground/60 leading-relaxed max-w-lg font-questrial">
                        {description}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4 md:pt-6">
                        <Link 
                            href={`/tournaments/${t.id}`}
                            className={`${accentColor} text-white px-8 md:px-10 py-3 md:py-4 text-sm font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all rounded-xl font-poppins shadow-lg shadow-primary/20 text-center`}
                        >
                            REGISTER NOW
                        </Link>
                        <Link 
                            href={`/tournaments/${t.id}`}
                            className="bg-foreground/5 text-foreground px-8 md:px-10 py-3 md:py-4 text-sm font-black uppercase tracking-widest hover:bg-foreground/10 transition-all rounded-xl font-poppins text-center"
                        >
                            VIEW RULES
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}