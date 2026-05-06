import { Tournament } from "../../../types";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../../utils/api";

const inputCls = "w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none";

interface EditState {
  name: string;
  format: string;
  maxPlayers: number;
  prizePool: number | "";
  isPrivate: boolean;
}

interface Props {
  tournament: Tournament;
  tournamentId: string;
  isEditing: boolean;
  editState: EditState;
  onToggleEdit: () => void;
  onEditChange: (field: keyof EditState, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenRegistration: () => void;
  onStartTournament: () => void;
  fetchData: () => void;
  setMessage: (msg: string) => void;
}

export default function SpecsPanel({ tournament, tournamentId, isEditing, editState, onToggleEdit, onEditChange, onSubmit, onOpenRegistration, onStartTournament, fetchData, setMessage }: Props) {
  const stages = ["UPCOMING", "OPEN", "ONGOING", "COMPLETED"];

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
    <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8 border-b border-foreground/10 pb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground font-poppins">Technical Specs</h3>
        <button onClick={onToggleEdit} className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest font-poppins">
          {isEditing ? "Discard" : "Modify"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Arena Name</label>
            <input value={editState.name} onChange={e => onEditChange("name", e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Combat Format</label>
            <select value={editState.format} onChange={e => onEditChange("format", e.target.value)} className={inputCls}>
              <option value="SINGLE_ELIMINATION">SINGLE ELIMINATION</option>
              <option value="SWISS">SWISS</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Capacity</label>
              <input type="number" value={editState.maxPlayers} onChange={e => onEditChange("maxPlayers", Number(e.target.value))} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Prize (₱)</label>
              <input type="number" value={editState.prizePool} onChange={e => onEditChange("prizePool", e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Status Management</p>
            <div className="relative">
              <select
                value={tournament.status}
                onChange={e => handleStatusChange(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {stages.map(s => {
                  const currentIdx = stages.indexOf(tournament.status);
                  const thisIdx = stages.indexOf(s);
                  const isDisabled = thisIdx < currentIdx || thisIdx > currentIdx + 1;
                  return <option key={s} value={s} disabled={isDisabled}>{s}{s === tournament.status ? " (CURRENT)" : ""}</option>;
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all font-poppins">Commit Specs</button>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
          {[
            { label: "Format",   value: tournament.format.replace("_", " ") },
            { label: "Capacity", value: `${tournament.maxPlayers} MAX` },
            { label: "Privacy",  value: tournament.isPrivate ? "RESTRICTED" : "OPEN" },
            { label: "Status",   value: tournament.status, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="space-y-1">
              <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins">{label}</p>
              <p className={`text-xs font-black uppercase tracking-tight ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
