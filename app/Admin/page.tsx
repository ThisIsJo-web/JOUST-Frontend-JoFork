"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../utils/api";
import StatCard from "./components/StatCard";
import UserTable, { AdminUser } from "./components/UserTable";
import TournamentTable, { AdminTournament } from "./components/TournamentTable";

interface Stats {
  totalUsers: number; registeredUsers: number; guestUsers: number;
  totalTournaments: number; activeTournaments: number; completedTournaments: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, registeredUsers: 0, guestUsers: 0, totalTournaments: 0, activeTournaments: 0, completedTournaments: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
        if (!meRes.ok) { router.push("/Auth"); return; }
        const me = await safeJson(meRes);
        if (!me?.roles?.includes("ADMIN")) { router.push("/"); return; }

        const [usersRes, tourneyRes] = await Promise.all([
          authenticatedFetch(API_ENDPOINTS.AUTH.USERS),
          authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE),
        ]);
        const usersData: AdminUser[]       = (await safeJson(usersRes))  ?? [];
        const tourneyData: AdminTournament[] = (await safeJson(tourneyRes)) ?? [];

        setUsers(usersData);
        setTournaments(tourneyData);
        const guests = usersData.filter(u => u.isGuest).length;
        setStats({
          totalUsers: usersData.length,
          registeredUsers: usersData.length - guests,
          guestUsers: guests,
          totalTournaments: tourneyData.length,
          activeTournaments: tourneyData.filter(t => t.status === "ONGOING" || t.status === "OPEN").length,
          completedTournaments: tourneyData.filter(t => t.status === "COMPLETED").length,
        });
      } catch (err) {
        console.error("Dashboard init error", err);
        setErrorMsg("Failed to load dashboard telemetry.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);

  const handleForceComplete = async (id: string) => {
    if (!confirm("Force complete this tournament? This cannot be undone.")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(id), { method: "PATCH" });
    if (res.ok) {
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, status: "COMPLETED" } : t));
      setStats(prev => ({ ...prev, activeTournaments: prev.activeTournaments - 1, completedTournaments: prev.completedTournaments + 1 }));
    } else {
      alert("Failed to force complete tournament.");
    }
  };

  const handleRoleToggle = async (userId: string, currentRoles: string[], roleToToggle: string) => {
    const newRoles = currentRoles.includes(roleToToggle)
      ? currentRoles.filter(r => r !== roleToToggle)
      : [...currentRoles, roleToToggle];
    const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ROLES(userId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles: newRoles }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => (u.id === userId || u.sub === userId) ? { ...u, roles: newRoles } : u));
    } else {
      alert("Failed to update user roles.");
    }
  };

  if (isLoading) return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black uppercase tracking-widest animate-pulse">Initializing Admin Uplink...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground p-6 md:p-12 font-poppins selection:bg-primary/30">
      <header className="mb-12 border-b border-primary/20 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            Admin <span className="text-primary">Terminal</span>
          </h1>
          <p className="text-neutral-400 mt-2 font-mono text-sm uppercase tracking-widest">System Overview &amp; Tactical Control</p>
        </div>
        {errorMsg && <p className="text-red-500 font-bold uppercase tracking-widest text-sm bg-red-500/10 px-4 py-2 border border-red-500/50">{errorMsg}</p>}
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        <StatCard title="Total Players"      value={stats.totalUsers}           subtitle={`${stats.registeredUsers} Reg / ${stats.guestUsers} Guests`} />
        <StatCard title="Total Events"       value={stats.totalTournaments} />
        <StatCard title="Active Operations"  value={stats.activeTournaments}    color="text-amber-400" />
        <StatCard title="Completed"          value={stats.completedTournaments} color="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <UserTable       users={users}             onRoleToggle={handleRoleToggle} />
        <TournamentTable tournaments={tournaments} onForceComplete={handleForceComplete} />
      </div>
    </div>
  );
}
