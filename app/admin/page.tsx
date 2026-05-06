"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../utils/api";
import StatCard from "./components/StatCard";
import UserRegistry, { AdminUser } from "./components/UserRegistry";
import TournamentTable, { AdminTournament } from "./components/TournamentTable";
import UserModal from "./components/UserModal";
import ConvertGuestModal from "./components/ConvertGuestModal";
import DevPanel from "./components/DevPanel";

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

  // Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null); // null means create mode
  const [guestToConvert, setGuestToConvert] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (!meRes.ok) { router.push("/auth"); return; }
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
      updateStats(usersData, tourneyData);
    } catch (err) {
      console.error("Dashboard error", err);
      setErrorMsg("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (uData: AdminUser[], tData: AdminTournament[]) => {
    const guests = uData.filter(u => u.isGuest).length;
    setStats({
      totalUsers: uData.length,
      registeredUsers: uData.length - guests,
      guestUsers: guests,
      totalTournaments: tData.length,
      activeTournaments: tData.filter(t => t.status === "ONGOING" || t.status === "OPEN").length,
      completedTournaments: tData.filter(t => t.status === "COMPLETED").length,
    });
  };

  const handleForceComplete = async (id: string) => {
    if (!confirm("Force complete this tournament? This cannot be undone.")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(id), { method: "PATCH" });
    if (res.ok) {
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, status: "COMPLETED" } : t));
      setStats(prev => ({ ...prev, activeTournaments: prev.activeTournaments - 1, completedTournaments: prev.completedTournaments + 1 }));
    } else {
      alert("Failed to complete tournament.");
    }
  };

  const handleUserModalSubmit = async (userId: string | null, data: any) => {
    try {
      if (!userId) {
        // CREATE MODE
        const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ADMIN_CREATE_USER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errData = await safeJson(res);
          throw new Error(errData?.message || "User creation failed");
        }
      } else {
        // UPDATE MODE
        const profileData = { username: data.username, email: data.email };
        if (data.password) (profileData as any).password = data.password;

        const [profileRes, rolesRes] = await Promise.all([
          authenticatedFetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE(userId), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          }),
          authenticatedFetch(API_ENDPOINTS.AUTH.ROLES(userId), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roles: data.roles }),
          })
        ]);

        if (!profileRes.ok || !rolesRes.ok) {
          throw new Error("Failed to fully update user profile or roles");
        }
      }
      await fetchData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };



  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user?")) return;
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.AUTH.DELETE_USER(userId), { method: "DELETE" });
      if (res.ok) {
        const updatedUsers = users.filter(u => (u.id !== userId && u.sub !== userId));
        setUsers(updatedUsers);
        updateStats(updatedUsers, tournaments);
      } else {
        const data = await safeJson(res);
        alert(`Deletion failed: ${data?.message || "Unknown error"}`);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleBatchDelete = async (userIds: string[]) => {
    if (!confirm(`Permanently delete ${userIds.length} selected users?`)) return;
    setIsLoading(true);
    try {
      // Execute all deletions in parallel
      const results = await Promise.all(
        userIds.map(id => authenticatedFetch(API_ENDPOINTS.AUTH.DELETE_USER(id), { method: "DELETE" }))
      );
      
      const successCount = results.filter(r => r.ok).length;
      if (successCount < userIds.length) {
        alert(`Batch cleanup partially failed. ${successCount}/${userIds.length} successful.`);
      }
      
      await fetchData();
    } catch (err) {
      alert("Batch operation failed due to network error.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleConvertGuest = async (guestId: string, data: any) => {
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.AUTH.CONVERT_GUEST(guestId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const errData = await safeJson(res);
        alert(`Conversion failed: ${errData?.message || "Check logs"}`);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (isLoading && users.length === 0) return (
    <div className="flex flex-col min-h-screen w-full bg-neutral-950 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black uppercase tracking-widest animate-pulse">Loading Admin Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground font-poppins selection:bg-primary/30 flex flex-col relative overflow-x-hidden">
      
      <div className="p-6 md:p-12 max-w-[1600px] mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
          <div>
            <button 
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 hover:opacity-70 transition-all"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
              Back to Home
            </button>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-neutral-400 mt-2 font-mono text-sm uppercase tracking-widest">System Overview &amp; Control</p>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 flex justify-between items-center">
            <p className="text-red-500 font-bold uppercase tracking-widest text-sm">{errorMsg}</p>
            <button onClick={fetchData} className="text-xs font-black uppercase tracking-widest text-red-500 hover:underline">Retry Connection</button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard title="Total Users"        value={stats.totalUsers}           subtitle={`${stats.registeredUsers} Users / ${stats.guestUsers} Guests`} />
          <StatCard title="Total Tournaments"  value={stats.totalTournaments} />
          <StatCard title="Active"             value={stats.activeTournaments}    color="text-amber-400" />
          <StatCard title="Completed"          value={stats.completedTournaments} color="text-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <UserRegistry       
            users={users}             
            onDelete={handleDeleteUser}
            onBatchDelete={handleBatchDelete}
            onConvert={setGuestToConvert}
            onEdit={(u) => { setUserToEdit(u); setIsUserModalOpen(true); }}
            onCreateClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }}
          />
          <TournamentTable tournaments={tournaments} onForceComplete={handleForceComplete} />
        </div>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => router.push("/admin/dev")}
            className="px-12 py-4 bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-primary hover:border-primary transition-all text-[10px] font-black uppercase tracking-[0.5em] group"
          >
            Access <span className="text-primary group-hover:text-white transition-colors">Dev Terminal</span> 
          </button>
        </div>
      </div>

      <UserModal 
        isOpen={isUserModalOpen}
        user={userToEdit}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleUserModalSubmit}
      />

      <ConvertGuestModal 
        guest={guestToConvert}
        isOpen={!!guestToConvert}
        onClose={() => setGuestToConvert(null)}
        onSubmit={handleConvertGuest}
      />
    </div>
  );
}
