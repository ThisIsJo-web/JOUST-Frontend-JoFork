import Image from "next/image";
import { Tournament } from "../types";

interface TournamentSelectionListProps {
    tournaments: Tournament[];
    activeId: string;
    onSelect: (id: string) => void;
}

export default function TournamentSelectionList({ tournaments, activeId, onSelect }: TournamentSelectionListProps) {
    return (
        <div className="flex flex-col gap-4">
            {tournaments.map((t) => {
                const accentColor = t.color || "bg-primary";
                const imageSrc = t.image || "/placeholder.jpg";
                
                return (
                    <button
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`group relative flex items-center gap-6 p-6 transition-all duration-500 text-left rounded-3xl border
                            ${activeId === t.id 
                                ? 'bg-foreground/5 border-primary/50 translate-x-2' 
                                : 'bg-transparent border-foreground/5 opacity-50 hover:opacity-100 hover:bg-foreground/5'
                            }`}
                    >
                        <div className={`relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-2xl transition-transform duration-500 group-hover:scale-110`}>
                            <Image 
                                src={imageSrc} 
                                alt="" 
                                fill 
                                className="object-cover" 
                            />
                            <div className={`absolute left-0 top-0 w-1 h-full ${accentColor}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-sm font-black uppercase tracking-widest leading-none transition-colors font-poppins ${activeId === t.id ? 'text-primary' : 'text-foreground'}`}>
                                {t.name}
                            </h3>
                            <p className="text-[10px] font-bold text-foreground/40 mt-2 uppercase font-questrial">
                                {t.format.replace("_", " ")}
                            </p>
                        </div>
                        {activeId === t.id && (
                            <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full ${accentColor}`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}