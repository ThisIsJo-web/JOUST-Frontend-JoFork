"use client";
import React from "react";

interface LeaderboardHeroProps {
    count: number;
}

export default function LeaderboardHero({ count }: LeaderboardHeroProps) {
    return (
        <section className="space-y-4 border-b-8 border-white pb-12">
            <h1 className="text-7xl md:text-[140px] font-black text-white uppercase tracking-tighter leading-[0.8] font-poppins italic">
                LEADERBOARD
            </h1>
            <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-6">
                    <div className="h-4 w-32 bg-primary" />
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em] font-poppins">
                        TOP COMPETITORS // ALL REGIONS
                    </p>
                </div>
                <div className="text-primary text-[10px] font-black uppercase tracking-[0.4em] font-poppins">
                    {count} ENTRIES LOADED
                </div>
            </div>
        </section>
    );
}
