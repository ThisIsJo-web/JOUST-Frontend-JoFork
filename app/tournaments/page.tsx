"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../utils/api";
import { Tournament } from "./types";
import FeaturedCard from "./components/FeaturedCard";
import TournamentCard from "./components/TournamentCard";
import TournamentSelectionList from "./components/TournamentSelectionList";

import Link from "next/link";
import { CardSkeleton, FeaturedSkeleton } from "./components/Skeleton";

export default function TournamentPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [user, setUser] = useState<{ roles: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string>("");
    const [activeIndex, setActiveIndex] = useState(0);
    const mobileScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchTournaments(), fetchUser()]);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
            if (res.ok) {
                const data = await safeJson(res);
                if (data) setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const fetchTournaments = async () => {
        try {
            const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE);
            if (res.ok) {
                const data = await safeJson(res);
                const activeTournaments = Array.isArray(data) ? data.filter((t: Tournament) => t.status !== "COMPLETED") : [];
                setTournaments(activeTournaments);
                if (activeTournaments.length > 0) {
                    setActiveId(activeTournaments[0].id);
                }
            } else {
                console.error("Failed to fetch tournaments:", res.status, res.statusText);
            }
        } catch (error) {
            console.error("Failed to fetch tournaments:", error);
        }
    };

    const isAuthorized = user?.roles?.some(role => role === "ADMIN" || role === "ORGANIZER");

    const active = tournaments.find(t => t.id === activeId) || tournaments[0];

    const handleScroll = () => {
        if (mobileScrollRef.current) {
            const index = Math.round(mobileScrollRef.current.scrollLeft / mobileScrollRef.current.clientWidth);
            if (index !== activeIndex && index >= 0 && index < tournaments.length) {
                setActiveIndex(index);
            }
        }
    };

    if (loading && tournaments.length === 0) {
        return (
            <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
                <Navbar />
                <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
                    <div className="mb-24">
                        <div className="hidden lg:flex flex-row gap-12">
                            <div className="w-full lg:w-[75%]">
                                <FeaturedSkeleton isMain={true} />
                            </div>
                            <div className="w-full lg:w-[25%] flex flex-col gap-6">
                                <div className="h-4 w-24 bg-primary/20 rounded-full mb-2" />
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 w-full bg-foreground/5 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                        <div className="lg:hidden">
                            <FeaturedSkeleton />
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="h-8 w-64 bg-foreground/10 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (tournaments.length === 0) {
        return (
            <div className="min-h-screen w-full bg-background font-questrial">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-4 font-poppins">No Tournaments Found</h2>
                    <p className="text-foreground/40 max-w-md mx-auto mb-12">There are no tournaments at the moment. Check back soon for upcoming events.</p>
                    
                    {isAuthorized && (
                        <Link 
                            href="/tournaments/manage" 
                            className="group flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 font-poppins"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Tournaments
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
            <Navbar />
            
            <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
                {isAuthorized && (
                    <div className="mb-12 flex justify-end">
                        <Link 
                            href="/tournaments/manage" 
                            className="group flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 font-poppins"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Tournaments
                        </Link>
                    </div>
                )}

                <div className="mb-24">
                    <div className="hidden lg:flex flex-row gap-12">
                        <div className="w-full lg:w-[75%] transition-all duration-500">
                            <FeaturedCard tournament={active} isMain={true} />
                        </div>

                        <div className="w-full lg:w-[25%] flex flex-col gap-6">
                            <div className="flex items-center gap-4 px-2">
                                <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins">Featured</h2>
                                <div className="h-[2px] flex-1 bg-primary/20"></div>
                            </div>
                            <TournamentSelectionList 
                                tournaments={tournaments.slice(0, 5)} 
                                activeId={activeId} 
                                onSelect={setActiveId} 
                            />
                        </div>
                    </div>

                    <div className="lg:hidden space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins">Featured Events</h2>
                            <div className="flex gap-2.5">
                                {tournaments.slice(0, 5).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1.5 transition-all duration-300 rounded-full ${activeIndex === i ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'}`} 
                                    />
                                ))}
                            </div>
                        </div>
                        <div 
                            ref={mobileScrollRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4 touch-auto"
                        >
                            {tournaments.slice(0, 5).map((t) => (
                                <div key={t.id} className="min-w-full snap-start snap-always px-1">
                                    <FeaturedCard tournament={t} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-12 pb-12">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1">
                            <h2 className="text-3xl font-black uppercase tracking-tighter font-poppins text-foreground whitespace-nowrap">All Tournaments</h2>
                            <div className="h-[1px] flex-1 bg-foreground/10"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {tournaments.map((t) => (
                            <TournamentCard key={t.id} tournament={t} />
                        ))}
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}