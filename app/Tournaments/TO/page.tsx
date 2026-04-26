"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../Assets/navbar";
import { authenticatedFetch, API_ENDPOINTS } from "../../utils/api";

export default function TOSpace() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ roles: string[] } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
                if (res.ok) {
                    const data = await res.json();
                    const isAuthorized = data.roles?.some((role: string) => role === "ADMIN" || role === "ORGANIZER");
                    if (!isAuthorized) {
                        router.push("/Tournaments");
                    } else {
                        setUser(data);
                    }
                } else {
                    router.push("/Auth");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/Tournaments");
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Authorizing Terminal</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
            <Navbar />
            
            <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-6 mb-12">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em] font-poppins mb-2">Management Terminal</span>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground font-poppins">TO SPACE</h1>
                    </div>
                    <div className="h-[1px] flex-1 bg-foreground/10"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Placeholder for TO Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-foreground/5 border border-foreground/5 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20">
                                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground mb-4 font-poppins">Initialize Tournament</h3>
                            <p className="text-foreground/40 max-w-md mx-auto mb-8 font-questrial">Ready to host your next major event? Set the rules, formats, and prize pools here.</p>
                            <button className="px-12 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all rounded-2xl shadow-xl shadow-primary/20 font-poppins">
                                Create Arena
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[2rem]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6 font-poppins">Operator Profile</h3>
                            <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-foreground/5">
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-white">
                                    {user?.roles?.[0]?.[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-foreground uppercase tracking-widest font-poppins">Authorized Agent</p>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase font-questrial">{user?.roles?.join(" · ")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}