import { Tournament } from "../../../tournaments/types";

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
  const hasFormat = !!tournament.formatId;

  if (tournament.status === "UPCOMING") {
    return (
      <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-8 rounded-[2.5rem] flex items-start gap-4 shadow-xl">
        <div className="p-3 bg-yellow-500/10 rounded-xl">
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </div>
        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.15em] leading-relaxed font-poppins">
          Management interface locked. <span className="text-yellow-500/80">Change status to OPEN</span> to unlock management systems.
        </p>
      </div>
    );
  }

  if (tournament.status !== "OPEN") return null;

  if (!hasFormat) return (
    <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-10 rounded-[2.5rem] opacity-20 grayscale blur-[2px] pointer-events-none transition-all duration-700">
      <div className="text-center py-20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Select Format to Enable Deployment</p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-12 transition-all duration-700`}>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/60 border-b border-white/[0.05] pb-6 font-poppins">Participant Management</h3>

      {/* Add Guest */}
      <div className="space-y-4">
        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Add Guest Participant</p>
        <div className="flex gap-3">
          <input placeholder="GUEST USERNAME" value={guestUsername} onChange={e => setGuestUsername(e.target.value)} className={`flex-1 ${inputCls} bg-transparent border-white/10`} />
          <button onClick={onAddGuest} className="w-12 h-12 bg-primary text-white font-black text-2xl hover:brightness-110 active:scale-90 transition-all rounded-xl shadow-lg shadow-primary/20">+</button>
        </div>
      </div>

      {/* Invite Player */}
      <div className="space-y-4">
        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Invite Registered User</p>
        <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className={`w-full ${inputCls} bg-transparent border-white/10 uppercase font-black text-[10px] tracking-widest`}>
          <option value="" className="bg-background">SELECT USER</option>
          {available.map(u => (
            <option key={u.id} value={u.id} className="bg-background text-foreground">{((u as any).username || "Unknown").toUpperCase()}</option>
          ))}
        </select>
        <button onClick={onInvitePlayer} className="w-full h-14 bg-white/5 text-foreground/60 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-white/10 hover:text-foreground transition-all font-poppins border border-white/5">
          Add Participant
        </button>
      </div>

      {/* Batch Add Guests */}
      {remaining > 0 && (
        <div className="space-y-6 pt-8 border-t border-white/[0.05]">
          <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">Bulk Guest Creation</p>
          <div className="flex gap-3">
            <input type="number" min="1" max={remaining} placeholder="COUNT" value={batchGuestCount} onChange={e => setBatchGuestCount(e.target.value === "" ? "" : Number(e.target.value))} className={`w-28 ${inputCls} bg-transparent border-white/10`} />
            <button onClick={onBatchAddGuests} className="flex-1 h-12 bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all rounded-xl">Generate Guests</button>
          </div>
          <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.3em] text-right font-poppins">Remaining Slots: {remaining}</p>
        </div>
      )}
    </div>
  );
}
