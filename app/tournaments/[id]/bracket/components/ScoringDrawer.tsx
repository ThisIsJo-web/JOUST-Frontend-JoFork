import { Match } from "../types";

interface Props {
  match: Match | null;
  onClose: () => void;
  onScore: (winnerId: string | null) => void;
}

export default function ScoringDrawer({ match, onClose, onScore }: Props) {
  if (!match) return null;
  const p1Name = match.player1?.username || "TBD";
  const p2Name = match.player2?.username || "TBD";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center lg:justify-end animate-in fade-in duration-300 pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
      <div className="w-full max-w-md lg:max-w-sm h-fit lg:h-screen bg-[#111] border-primary/20 lg:border-l lg:shadow-[-50px_0_100px_rgba(0,0,0,0.9)] p-8 lg:p-12 relative flex flex-col justify-center animate-in slide-in-from-right duration-500 lg:rounded-none rounded-[3rem] pointer-events-auto">
        <button onClick={onClose} className="absolute top-8 right-8 text-foreground/20 hover:text-white transition-all font-black text-xl font-poppins">✕</button>

        <div className="mb-10 text-center lg:text-left">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] font-poppins mb-4 block">Manual Override</span>
          <h2 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-tight font-poppins">Combat Results</h2>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-2">Update status for uplink telemetry</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onScore(match.player1?.id || null)}
            disabled={!match.player1}
            className={`w-full py-6 bg-foreground/5 border border-white/5 hover:border-primary text-foreground rounded-2xl transition-all group px-8 flex justify-between items-center ${!match.player1 ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
          >
            <span className="font-black uppercase tracking-widest font-poppins text-xs lg:text-sm">{p1Name}</span>
            <span className="text-[9px] font-black text-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-all">WINNER</span>
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[8px] font-black text-foreground/10 uppercase tracking-widest">VS</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <button
            onClick={() => onScore(match.player2?.id || null)}
            disabled={!match.player2}
            className={`w-full py-6 bg-foreground/5 border border-white/5 hover:border-primary text-foreground rounded-2xl transition-all group px-8 flex justify-between items-center ${!match.player2 ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
          >
            <span className="font-black uppercase tracking-widest font-poppins text-xs lg:text-sm">{p2Name}</span>
            <span className="text-[9px] font-black text-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-all">WINNER</span>
          </button>

          <div className="mt-8 pt-8 border-t border-white/5">
            <button onClick={() => onScore(null)} className="w-full py-4 bg-transparent border border-dashed border-white/5 hover:border-foreground/20 text-foreground/20 hover:text-foreground/40 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest">
              Clear Results / Draw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
