import { Tournament } from "../../../types";

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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-foreground/5 pb-12">
      <div>
        <button onClick={onBack} className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins mb-4 hover:opacity-70 transition-all flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg>
          Back to Console
        </button>
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-foreground font-poppins leading-none">{tournament.name}</h1>
        <div className="flex items-center gap-4 mt-6">
          <span className="bg-primary text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-md">{tournament.status}</span>
          <span className="text-foreground/40 text-[10px] font-black uppercase tracking-widest font-poppins">
            {tournament.format.replace("_", " ")} · ₱{tournament.prizePool?.toLocaleString() || "0"} POOL
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full md:w-auto">
        <button onClick={onViewBracket} className="flex-1 md:px-12 py-5 border-2 border-primary text-primary font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all font-poppins">
          Brackets
        </button>
        {tournament.status === "UPCOMING" && (
          <button onClick={onOpenArena} className="flex-1 md:px-12 py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-blue-600/20 font-poppins">
            Open Arena
          </button>
        )}
        {tournament.status === "OPEN" && (
          <>
            <button onClick={onStartTournament} className="flex-1 md:px-12 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 font-poppins">
              Initiate Combat
            </button>
          </>
        )}
      </div>
    </div>
  );
}
