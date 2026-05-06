import { Tournament } from "../../../types";

const inputCls = "h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl";

interface Props {
  tournament: Tournament;
  allUsers: { id: string; username: string }[];
  guestUsername: string;
  setGuestUsername: (v: string) => void;
  batchGuestCount: number | "";
  setBatchGuestCount: (v: number | "") => void;
  selectedUserId: string;
  setSelectedUserId: (v: string) => void;
  onAddGuest: () => void;
  onBatchAddGuests: () => void;
  onInvitePlayer: () => void;
}

export default function DeploymentPanel({ tournament, allUsers, guestUsername, setGuestUsername, batchGuestCount, setBatchGuestCount, selectedUserId, setSelectedUserId, onAddGuest, onBatchAddGuests, onInvitePlayer }: Props) {
  const available = allUsers.filter(u => !tournament.participants.some(p => p.userId === u.id));
  const remaining = tournament.maxPlayers - tournament.participants.length;

  if (tournament.status === "UPCOMING") {
    return (
      <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-[2.5rem] flex items-start gap-3">
        <svg className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        <p className="text-[9px] text-yellow-500/70 font-black uppercase tracking-widest leading-relaxed">
          Change status to OPEN above to unlock Deployment Tools and allow players to join.
        </p>
      </div>
    );
  }

  if (tournament.status !== "OPEN") return null;

  return (
    <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[2.5rem] space-y-8">
      <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b border-foreground/10 pb-4 font-poppins">Deployment Tools</h3>

      {/* Summon Guest */}
      <div className="space-y-4">
        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Summon Guest</p>
        <div className="flex gap-2">
          <input placeholder="ARENA NAME" value={guestUsername} onChange={e => setGuestUsername(e.target.value)} className={`flex-1 ${inputCls}`} />
          <button onClick={onAddGuest} className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary font-black text-xl hover:bg-primary hover:text-white transition-all rounded-xl">+</button>
        </div>
      </div>

      {/* Invite Player */}
      <div className="space-y-4">
        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Invite Player</p>
        <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className={`w-full ${inputCls}`}>
          <option value="">SELECT PLAYER</option>
          {available.map(u => (
            <option key={u.id} value={u.id}>{((u as any).username || (u as any).guestName || "Unknown").toUpperCase()}</option>
          ))}
        </select>
        <button onClick={onInvitePlayer} className="w-full py-4 bg-foreground/10 text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-foreground hover:text-background transition-all font-poppins">
          Invite Player
        </button>
      </div>

      {/* Batch Summon */}
      {remaining > 0 && (
        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Batch Summon Guests</p>
          <div className="flex gap-2">
            <input type="number" min="1" max={remaining} placeholder="NUMBER" value={batchGuestCount} onChange={e => setBatchGuestCount(e.target.value === "" ? "" : Number(e.target.value))} className={`w-24 ${inputCls}`} />
            <button onClick={onBatchAddGuests} className="flex-1 h-12 bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all rounded-xl">Add Guests</button>
          </div>
          <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest text-right">Max allowed: {remaining}</p>
        </div>
      )}
    </div>
  );
}
