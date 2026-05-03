"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS } from "../utils/api";

interface User {
    id: string;
    sub?: string;
    username: string;
    email: string;
    roles: string[];
    isGuest: boolean;
}

interface Tournament {
    id: string;
    name: string;
    status: string;
    date: string;
    format: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        registeredUsers: 0,
        guestUsers: 0,
        totalTournaments: 0,
        activeTournaments: 0,
        completedTournaments: 0
    });
    const [users, setUsers] = useState<User[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const initDashboard = async () => {
            try {
                // 1. Authenticate and check role
                const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
                if (!meRes.ok) {
                    router.push("/Auth");
                    return;
                }
                const meData = await meRes.json();
                if (!meData.roles?.includes('ADMIN')) {
                    router.push("/"); // Redirect if not admin
                    return;
                }

                // 2. Fetch Dashboard Data
                const [usersRes, tourneyRes] = await Promise.all([
                    authenticatedFetch(API_ENDPOINTS.AUTH.USERS),
                    authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE)
                ]);

                if (usersRes.ok && tourneyRes.ok) {
                    const usersData: User[] = await usersRes.json();
                    const tourneyData: Tournament[] = await tourneyRes.json();

                    setUsers(usersData);
                    setTournaments(tourneyData);

                    // Compute Stats
                    const guests = usersData.filter(u => u.isGuest).length;
                    setStats({
                        totalUsers: usersData.length,
                        registeredUsers: usersData.length - guests,
                        guestUsers: guests,
                        totalTournaments: tourneyData.length,
                        activeTournaments: tourneyData.filter(t => t.status === 'ONGOING' || t.status === 'OPEN').length,
                        completedTournaments: tourneyData.filter(t => t.status === 'COMPLETED').length
                    });
                }
            } catch (err) {
                console.error("Dashboard init error", err);
                setErrorMsg("Failed to load dashboard telemetry.");
            } finally {
                setIsLoading(false);
            }
        };

        initDashboard();
    }, [router]);

    const handleForceComplete = async (id: string) => {
        if (!confirm("Are you sure you want to FORCE COMPLETE this tournament? This cannot be undone.")) return;
        
        try {
            const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(id), {
                method: "PATCH",
            });
            if (res.ok) {
                setTournaments(prev => prev.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t));
                setStats(prev => ({
                    ...prev,
                    activeTournaments: prev.activeTournaments - 1,
                    completedTournaments: prev.completedTournaments + 1
                }));
            } else {
                alert("Failed to force complete tournament.");
            }
        } catch (error) {
            console.error(error);
            alert("Error completing tournament.");
        }
    };

    const handleRoleToggle = async (userId: string, currentRoles: string[], roleToToggle: string) => {
        let newRoles = [...currentRoles];
        if (newRoles.includes(roleToToggle)) {
            newRoles = newRoles.filter(r => r !== roleToToggle);
        } else {
            newRoles.push(roleToToggle);
        }

        try {
            const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ROLES(userId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roles: newRoles })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u => (u.id === userId || u.sub === userId) ? { ...u, roles: newRoles } : u));
            } else {
                alert("Failed to update user roles.");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating roles.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-black uppercase tracking-widest animate-pulse">Initializing Admin Uplink...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-foreground p-6 md:p-12 font-poppins selection:bg-primary/30">
            {/* Header */}
            <header className="mb-12 border-b border-primary/20 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
                        Admin <span className="text-primary">Terminal</span>
                    </h1>
                    <p className="text-neutral-400 mt-2 font-mono text-sm uppercase tracking-widest">
                        System Overview & Tactical Control
                    </p>
                </div>
                {errorMsg && <p className="text-red-500 font-bold uppercase tracking-widest text-sm bg-red-500/10 px-4 py-2 rounded-none border border-red-500/50">{errorMsg}</p>}
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                <StatCard title="Total Players" value={stats.totalUsers} subtitle={`${stats.registeredUsers} Reg / ${stats.guestUsers} Guests`} />
                <StatCard title="Total Events" value={stats.totalTournaments} />
                <StatCard title="Active Operations" value={stats.activeTournaments} color="text-amber-400" />
                <StatCard title="Completed" value={stats.completedTournaments} color="text-primary" />
            </div>

            {/* Main Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                
                {/* Users Control Panel */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6 border-b border-neutral-800 bg-neutral-950/50">
                        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary block"></span>
                            User Registry
                        </h2>
                    </div>
                    <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase tracking-widest sticky top-0 z-10 border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4">Callsign</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Access Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {users.map(u => {
                                    const uId = u.id || u.sub;
                                    if (!uId) return null;
                                    return (
                                    <tr key={uId} className="hover:bg-neutral-800/30 transition-colors group/row">
                                        <td className="px-6 py-4 font-bold">
                                            {u.username}
                                            {u.isGuest && <span className="ml-2 text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-sm uppercase">Guest</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {u.roles?.map(r => (
                                                    <span key={r} className={`text-[10px] px-2 py-0.5 uppercase tracking-widest font-black ${
                                                        r === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                                        r === 'ORGANIZER' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-neutral-800 text-neutral-300'
                                                    }`}>
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                            {!u.isGuest && (
                                                <>
                                                    <button 
                                                        onClick={() => handleRoleToggle(uId, u.roles || [], 'ORGANIZER')}
                                                        className="text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors border border-amber-500/20 px-3 py-1 bg-amber-500/5"
                                                    >
                                                        Toggle Org
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRoleToggle(uId, u.roles || [], 'ADMIN')}
                                                        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors border border-red-500/20 px-3 py-1 bg-red-500/5"
                                                    >
                                                        Toggle Admin
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Tournament Control Panel */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6 border-b border-neutral-800 bg-neutral-950/50">
                        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                            <span className="w-2 h-8 bg-amber-400 block"></span>
                            Operations Log
                        </h2>
                    </div>
                    <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase tracking-widest sticky top-0 z-10 border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4">Designation</th>
                                    <th className="px-6 py-4">State</th>
                                    <th className="px-6 py-4 text-right">Override</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {tournaments.map(t => (
                                    <tr key={t.id} className="hover:bg-neutral-800/30 transition-colors group/row">
                                        <td className="px-6 py-4 font-bold">{t.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest font-black ${
                                                t.status === 'COMPLETED' ? 'text-primary bg-primary/10' :
                                                t.status === 'ONGOING' ? 'text-amber-400 bg-amber-400/10 animate-pulse' :
                                                t.status === 'OPEN' ? 'text-green-400 bg-green-400/10' :
                                                'text-neutral-400 bg-neutral-800'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {t.status !== 'COMPLETED' && (
                                                <button 
                                                    onClick={() => handleForceComplete(t.id)}
                                                    className="opacity-0 group-hover/row:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-neutral-950 border border-primary/50 px-3 py-1"
                                                >
                                                    Force Complete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, color = "text-white" }: { title: string, value: number, subtitle?: string, color?: string }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <h3 className="text-neutral-500 font-mono text-xs uppercase tracking-widest mb-4">{title}</h3>
            <div className="flex items-end gap-3">
                <span className={`text-5xl md:text-6xl font-black tracking-tighter ${color}`}>{value}</span>
                {subtitle && <span className="text-xs text-neutral-500 font-mono pb-2 uppercase">{subtitle}</span>}
            </div>
            {/* Cyberpunk corner accent */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neutral-600/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neutral-600/50"></div>
        </div>
    );
}
