"use client";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Tournament } from "../../tournaments/types";

type SortField = "name" | "date" | "status" | "prizePool";
type SortOrder = "asc" | "desc";

interface TournamentDirectoryProps {
    tournaments: Tournament[];
}

export default function TournamentDirectory({ tournaments }: TournamentDirectoryProps) {
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const sortedTournaments = useMemo(() => {
        return [...tournaments].sort((a, b) => {
            let valA: any = a[sortField];
            let valB: any = b[sortField];

            if (sortField === "date") {
                valA = a.date ? new Date(a.date).getTime() : 0;
                valB = b.date ? new Date(b.date).getTime() : 0;
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [tournaments, sortField, sortOrder]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    return (
        <section className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-8 border-white pb-8">
                <div className="space-y-1">
                    <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none font-poppins italic">
                        DIRECTORY
                    </h2>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                        {tournaments.length} ACTIVE TOURNAMENTS FOUND
                    </p>
                </div>

                {/* Sorting UI */}
                <div className="flex flex-wrap gap-3">
                    {(["name", "date", "status", "prizePool"] as SortField[]).map(field => (
                        <button
                            key={field}
                            onClick={() => toggleSort(field)}
                            className={`px-5 py-2.5 border-2 font-black text-[9px] uppercase tracking-widest transition-all ${
                                sortField === field ? "bg-white text-black border-white" : "border-white/20 text-white/40 hover:border-white hover:text-white"
                            }`}
                        >
                            {field === "prizePool" ? "PRIZE" : field} {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sortedTournaments.map((t, idx) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-black border-2 border-white/10 hover:border-primary hover:bg-primary/5 hover:shadow-[12px_12px_0px_0px_#52B946] transition-all overflow-hidden"
                    >
                        <Link href={`/tournaments/${t.id}`} className="flex flex-col h-full">
                            <div className="h-32 w-full overflow-hidden border-b-2 border-white/10 group-hover:border-primary transition-colors bg-black">
                                <img 
                                    src={t.image || `/placeholder.jpg`} 
                                    alt={t.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100"
                                />
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                                        t.status === "OPEN" ? "text-primary" : "text-white/20"
                                    }`}>
                                        {t.status}
                                    </span>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none font-poppins group-hover:text-primary transition-colors italic">
                                        {t.name}
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">DATE</span>
                                        <span className="text-xs font-black text-white">{t.date ? new Date(t.date).toLocaleDateString() : "TBD"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">PRIZE</span>
                                        <span className="text-lg font-black text-primary">${t.prizePool || "0"}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
