import { Tournament } from "../../../tournaments/types";

interface Props {
  tournament: Tournament;
  tournamentId: string;
  onBack: () => void;
  onOpenArena: () => void;
  onStartTournament: () => void;
  onViewBracket: () => void;
}

export default function ControlRoomHeader({ tournament, tournamentId, onBack, onOpenArena, onStartTournament, onViewBracket }: Props) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 pb-12 border-b border-white/[0.05]">
      <div className="space-y-6">
        <button onClick={onBack} className="group text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins hover:opacity-70 transition-all flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7"/></svg>
          </div>
          Back to Terminal
        </button>
        
        <div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-foreground font-poppins leading-[0.8] mb-6">{tournament.name}</h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] px-4 py-2 rounded-xl">
              <div className={`w-2 h-2 rounded-full animate-pulse ${tournament.status === 'COMPLETED' ? 'bg-foreground/20' : 'bg-primary shadow-[0_0_10px_rgba(82,185,70,0.5)]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{tournament.status}</span>
            </div>
            <span className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.3em] font-poppins">
              {tournament.format.replace("_", " ")} <span className="mx-2">/</span> ₱{tournament.prizePool?.toLocaleString() || "0"} POOL
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full lg:w-auto">
        <button onClick={onViewBracket} className="flex-1 lg:px-12 py-5 bg-white/[0.03] border border-white/[0.1] text-foreground font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white/[0.08] transition-all font-poppins">
          Brackets
        </button>
        {tournament.status === "UPCOMING" && (
          <button onClick={onOpenArena} className="flex-1 lg:px-12 py-5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-blue-600/20 font-poppins">
            Authorize Arena
          </button>
        )}
        {tournament.status === "OPEN" && (
          <button onClick={onStartTournament} className="flex-1 lg:px-12 py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 font-poppins">
            Initiate Combat
          </button>
        )}
      </div>
    </div>
  );
}
