"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../utils/api";
import { Tournament } from "../../types";
import ControlRoomHeader from "./components/ControlRoomHeader";
import RosterPanel from "./components/RosterPanel";
import SpecsPanel from "./components/SpecsPanel";
import FormatRulesPanel from "./components/FormatRulesPanel";
import DeploymentPanel from "./components/DeploymentPanel";

const randomGuestName = () => `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

function ControlRoomContent() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [allUsers, setAllUsers]     = useState<{ id: string; username: string }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState("");

  const [isEditing, setIsEditing]           = useState(false);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [formatConfig, setFormatConfig]     = useState<any>({});
  const [formatDefinitions, setFormatDefinitions] = useState<any[]>([]);
  const [editState, setEditState] = useState({ name: "", format: "", maxPlayers: 0, prizePool: "" as number | "", isPrivate: false });

  const [guestUsername, setGuestUsername]     = useState("");
  const [batchGuestCount, setBatchGuestCount] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId]   = useState("");

  useEffect(() => {
    if (!tournamentId) { router.push("/tournaments/manage"); return; }
    fetchData();
    fetchFormatDefinitions();
  }, [tournamentId]);

  const fetchFormatDefinitions = async () => {
    const res = await authenticatedFetch(API_ENDPOINTS.FORMATS.DETAILS);
    if (res.ok) { const data = await safeJson(res); setFormatDefinitions(data?.formats ?? []); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const meRes = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
      if (!meRes.ok) { router.push("/auth"); return; }
      const me = await safeJson(meRes);
      if (!me?.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER")) { router.push("/tournaments"); return; }

      const usersRes = await authenticatedFetch(API_ENDPOINTS.AUTH.REGISTERED_USERS);
      if (usersRes.ok) setAllUsers(await safeJson(usersRes) ?? []);

      const tRes = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!));
      if (tRes.ok) {
        const t = await safeJson(tRes);
        setTournament(t);
        setEditState({ name: t.name, format: t.format, maxPlayers: t.maxPlayers, prizePool: t.prizePool || "", isPrivate: t.isPrivate || false });
        setFormatConfig(t.formatConfig || {});
      } else { setMessage("Tournament not found"); }
    } catch { setMessage("Failed to load data"); }
    finally { setLoading(false); }
  };

  const handleUpdateTournament = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.GET_ONE(tournamentId!), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editState, maxPlayers: Number(editState.maxPlayers), prizePool: editState.prizePool === "" ? null : Number(editState.prizePool), formatConfig }),
    });
    if (res.ok) { setMessage("Arena Specs Updated"); setIsEditing(false); setIsEditingRules(false); fetchData(); }
    else { setMessage("Update failed"); }
  };

  const handleAddGuest = async () => {
    if (!guestUsername || !tournament || tournament.participants.length >= tournament.maxPlayers) {
      setMessage("Arena at maximum capacity"); return;
    }
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: guestUsername }),
    });
    const data = await safeJson(res);
    if (res.ok) { setMessage("Guest Registered"); setGuestUsername(""); fetchData(); }
    else { setMessage(data?.message || "Guest failed"); }
  };

  const handleBatchAddGuests = async () => {
    if (!tournament || !batchGuestCount || Number(batchGuestCount) <= 0) return;
    const countToAdd = Math.min(Number(batchGuestCount), tournament.maxPlayers - tournament.participants.length);
    if (countToAdd <= 0) { setMessage("Arena at maximum capacity"); return; }
    if (!confirm(`Initialize bulk deployment of ${countToAdd} guests?`)) return;
    setLoading(true);
    for (let i = 0; i < countToAdd; i++) {
      await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN_GUEST(tournamentId!), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: randomGuestName() }),
      });
    }
    setBatchGuestCount(""); await fetchData();
  };

  const handleJoin = async (userId: string) => {
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId!), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }),
    });
    const data = await safeJson(res);
    if (res.ok) { setMessage("Combatant Registered"); fetchData(); }
    else { setMessage(data?.message || "Registration failed"); }
  };

  const handleReorder = async (activeUserId: string, newIndex: number) => {
    if (!tournament) return;
    const oldIndex = tournament.participants.findIndex(p => p.userId === activeUserId);
    if (oldIndex === -1 || oldIndex === newIndex) return;

    // Optimistic UI update could go here, but for simplicity we'll just wait for the backend
    setLoading(true);

    const newParticipants = [...tournament.participants];
    const [moved] = newParticipants.splice(oldIndex, 1);
    newParticipants.splice(newIndex, 0, moved);

    // Update all seeds from 1 to N
    try {
      for (let i = 0; i < newParticipants.length; i++) {
        const p = newParticipants[i];
        if (p.seed !== i + 1) {
          await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.UPDATE_SEED(tournamentId!, p.userId), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seed: i + 1 }),
          });
        }
      }
      await fetchData();
    } catch (e) {
      setMessage("Failed to reorder roster");
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveParticipant = async (userId: string) => {
    if (!confirm("Remove this combatant from the roster?")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.LEAVE(tournamentId!), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setMessage("Combatant Removed");
      fetchData();
    } else {
      const data = await safeJson(res);
      setMessage(data?.message || "Removal failed");
    }
  };

  const handleOpenRegistration = async () => {
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.UPDATE_STATUS(tournamentId!), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "OPEN" }),
    });
    if (res.ok) { setMessage("Registration opened!"); fetchData(); }
    else { const d = await safeJson(res); setMessage(d?.message || "Failed to open arena"); }
  };

  const handleStartTournament = async () => {
    if (!confirm("Initiate combat sequence?")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.START(tournamentId!), { method: "POST" });
    if (res.ok) { setMessage("Combat initiated!"); fetchData(); }
    else { setMessage("Activation failed"); }
  };

  if (loading) return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Terminal</p>
      </div>
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-background font-black uppercase tracking-widest">Arena Offline</div>
  );

  return (
    <div className="min-h-screen w-full bg-background font-questrial overflow-x-hidden">
      <div className="w-full px-4 md:px-12 py-12 max-w-[1600px] mx-auto">
        <ControlRoomHeader
          tournament={tournament}
          tournamentId={tournamentId!}
          onBack={() => router.push("/tournaments/manage")}
          onViewBracket={() => router.push(`/tournaments/${tournamentId}/bracket`)}
          onOpenArena={handleOpenRegistration}
          onStartTournament={handleStartTournament}
        />

        {message && (
          <div className="mb-12 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-center font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <RosterPanel 
            tournament={tournament} 
            onReorder={handleReorder} 
            onRemove={handleRemoveParticipant} 
          />

          <div className="lg:col-span-4 space-y-8">
            <SpecsPanel
              tournament={tournament}
              tournamentId={tournamentId!}
              isEditing={isEditing}
              editState={editState}
              onToggleEdit={() => setIsEditing(v => !v)}
              onEditChange={(field, value) => setEditState(prev => ({ ...prev, [field]: value }))}
              onSubmit={handleUpdateTournament}
              onOpenRegistration={handleOpenRegistration}
              onStartTournament={handleStartTournament}
              fetchData={fetchData}
              setMessage={setMessage}
            />
            <FormatRulesPanel
              tournament={tournament}
              formatDefinitions={formatDefinitions}
              isEditing={isEditingRules}
              formatConfig={formatConfig}
              onToggleEdit={() => setIsEditingRules(true)}
              onDiscard={() => { setIsEditingRules(false); setFormatConfig(tournament.formatConfig || {}); }}
              onRuleChange={(key, value) => setFormatConfig((prev: any) => ({ ...prev, [key]: value === "" ? null : Number(value) }))}
              onSave={handleUpdateTournament}
            />
            <DeploymentPanel
              tournament={tournament}
              allUsers={allUsers}
              guestUsername={guestUsername}
              setGuestUsername={setGuestUsername}
              batchGuestCount={batchGuestCount}
              setBatchGuestCount={setBatchGuestCount}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              onAddGuest={handleAddGuest}
              onBatchAddGuests={handleBatchAddGuests}
              onInvitePlayer={() => selectedUserId && handleJoin(selectedUserId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ControlRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse font-poppins">Syncing Terminal</p>
        </div>
      </div>
    }>
      <ControlRoomContent />
    </Suspense>
  );
}