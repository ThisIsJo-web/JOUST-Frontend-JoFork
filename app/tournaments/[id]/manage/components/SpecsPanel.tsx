import React, { useState, useEffect } from "react";
import { Tournament } from "../../../types";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../../utils/api";
import CardGameModal from "../../../components/CardGameModal";

const inputCls = "w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none";

interface EditState {
  name: string;
  format: string;
  maxPlayers: number;
  prizePool: number | "";
  isPrivate: boolean;
  cardGameId: string;
}

interface CardGameOption {
  id: string;
  name: string;
  description?: string | null;
}

interface Props {
  tournament: Tournament;
  tournamentId: string;
  isEditing: boolean;
  editState: EditState;
  cardGames: CardGameOption[];
  onToggleEdit: () => void;
  onEditChange: (field: keyof EditState, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenRegistration: () => void;
  onStartTournament: () => void;
  fetchData: () => void;
  setMessage: (msg: string) => void;
  onCardGameAdded: (newGame: CardGameOption) => void;
}

export default function SpecsPanel({ tournament, tournamentId, isEditing, editState, cardGames, onToggleEdit, onEditChange, onSubmit, onOpenRegistration, onStartTournament, fetchData, setMessage, onCardGameAdded }: Props) {
  const stages = ["UPCOMING", "OPEN", "ONGOING", "COMPLETED"];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!tournament.guestCleanupAt) {
      setTimeLeft(null);
      return;
    }
    const interval = setInterval(() => {
      const diff = new Date(tournament.guestCleanupAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        fetchData();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament.guestCleanupAt]);

  const handleCancelCleanup = async () => {
    if (!confirm("Stop automated guest purge? Accounts will be preserved indefinitely.")) return;
    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.CANCEL_CLEANUP(tournamentId), { method: "PATCH" });
    if (res.ok) { setMessage("Cleanup halted."); fetchData(); }
    else { setMessage("Failed to halt cleanup."); }
  };

  const handleStatusChange = async (target: string) => {
    const current = tournament.status;
    if (current === "UPCOMING" && target === "OPEN") {
      if (!confirm("Open registration?")) return;
      onOpenRegistration();
    } else if (current === "OPEN" && target === "ONGOING") {
      if (!confirm("Initiate combat?")) return;
      onStartTournament();
    } else if (current === "ONGOING" && target === "COMPLETED") {
      if (!confirm("Mark as completed?")) return;
      const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.COMPLETE(tournamentId!), { method: "PATCH" });
      const data = await safeJson(res);
      if (res.ok) { setMessage("Tournament completed!"); fetchData(); }
      else { setMessage(data?.message || "Failed"); }
    } else {
      setMessage("Cannot reverse tournament status");
    }
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-8 md:p-10 rounded-[2.5rem] shadow-2xl transition-all duration-500">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/[0.05]">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/60 font-poppins">Technical Specs</h3>
        <button onClick={onToggleEdit} className="text-[10px] font-black uppercase text-primary hover:brightness-110 tracking-widest font-poppins transition-all">
          {isEditing ? "Discard Changes" : "Modify Terminal"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-10">
          {/* Hierarchical Step 1 */}
          <div className="p-6 bg-primary/[0.03] border border-primary/20 rounded-2xl">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] font-poppins ml-1">Terminal Game (Mandatory)</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select 
                    value={editState.cardGameId} 
                    onChange={e => onEditChange("cardGameId", e.target.value)} 
                    className={`${inputCls} !border-primary/20 !bg-transparent focus:!border-primary !text-primary font-black uppercase text-[10px] tracking-widest h-14`}
                  >
                    <option value="" className="bg-background text-foreground/40">Select Core Game</option>
                    {cardGames.map(game => (
                      <option key={game.id} value={game.id} className="bg-background text-foreground">{game.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(true)}
                  className="h-14 w-14 flex items-center justify-center bg-primary text-white rounded-xl hover:brightness-110 active:scale-90 transition-all text-2xl font-light shadow-lg shadow-primary/20"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Locked Section */}
          <div className={`space-y-8 transition-all duration-700 ${!editState.cardGameId ? "opacity-10 grayscale blur-sm pointer-events-none translate-y-4" : "opacity-100 translate-y-0"}`}>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Arena Name</label>
              <input value={editState.name} onChange={e => onEditChange("name", e.target.value)} className={`${inputCls} bg-transparent border-white/10`} />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Format</label>
                <select value={editState.format} onChange={e => onEditChange("format", e.target.value)} className={`${inputCls} bg-transparent border-white/10`}>
                  <option value="SINGLE_ELIMINATION" className="bg-background">SINGLE ELIMINATION</option>
                  <option value="DOUBLE_ELIMINATION" className="bg-background">DOUBLE ELIMINATION</option>
                  <option value="SWISS" className="bg-background">SWISS</option>
                  <option value="ROUND_ROBIN" className="bg-background">ROUND ROBIN</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Capacity</label>
                <input type="number" value={editState.maxPlayers} onChange={e => onEditChange("maxPlayers", Number(e.target.value))} className={`${inputCls} bg-transparent border-white/10`} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Prize (₱)</label>
              <input type="number" value={editState.prizePool} onChange={e => onEditChange("prizePool", e.target.value === "" ? "" : Number(e.target.value))} className={`${inputCls} bg-transparent border-white/10`} />
            </div>

            <div className="space-y-2 pt-4 border-t border-white/[0.05]">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Status Shift</p>
              <select
                value={tournament.status}
                onChange={e => handleStatusChange(e.target.value)}
                className={`${inputCls} !bg-transparent !border-white/10 cursor-pointer`}
              >
                {stages.map(s => {
                  const currentIdx = stages.indexOf(tournament.status);
                  const thisIdx = stages.indexOf(s);
                  const isDisabled = thisIdx < currentIdx || thisIdx > currentIdx + 1;
                  return <option key={s} value={s} disabled={isDisabled}>{s}{s === tournament.status ? " (CURRENT)" : ""}</option>;
                })}
              </select>
            </div>

            <button type="submit" className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
              Commit Terminal Specs
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-y-10 gap-x-6">
          {[
            { label: "Designation", value: tournament.name },
            { label: "Core Game",   value: tournament.cardGame?.name || "NONE SET", highlight: !tournament.cardGame },
            { label: "Format",      value: tournament.format.replace("_", " ") },
            { label: "Capacity",    value: `${tournament.participants.length} / ${tournament.maxPlayers}` },
            { label: "Status",      value: tournament.status, highlight: true },
            { label: "Pool",        value: `₱${tournament.prizePool?.toLocaleString() || "0"}` },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="space-y-1.5">
              <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] font-poppins">{label}</p>
              <p className={`text-[11px] font-black uppercase tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <CardGameModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(newGame) => {
          onCardGameAdded(newGame);
          onEditChange("cardGameId", newGame.id);
        }}
      />

      {timeLeft !== null && timeLeft > 0 && (
        <div className="mt-10 p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] flex flex-col items-center gap-6 animate-pulse">
           <div className="text-center">
             <p className="text-[8px] font-black text-red-500/60 uppercase tracking-[0.3em] font-poppins mb-2">Guest Purge Sequence</p>
             <p className="text-3xl font-black text-red-500 font-mono tracking-tighter">
               {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
             </p>
           </div>
           <button 
             onClick={handleCancelCleanup}
             className="w-full py-4 bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all font-poppins"
           >
             Halt Sequence
           </button>
        </div>
      )}
    </div>
  );
}
