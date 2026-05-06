import { Tournament } from "../../types";

interface Props {
  tournament: Tournament;
  onComplete: (id: string) => void;
  onCopyLink: (message: string) => void;
  onControlRoom: (id: string) => void;
}

export default function TournamentRow({ tournament: t, onComplete, onCopyLink, onControlRoom }: Props) {
  const handleCopy = () => {
    const link = `${window.location.origin}/tournaments/${t.id}?invite=${t.inviteToken}`;
    navigator.clipboard.writeText(link);
    onCopyLink("Link Copied to Clipboard");
  };

  return (
    <div className="bg-foreground/5 border border-foreground/5 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-primary/20">
      <div className="flex items-center gap-6 flex-1 w-full">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary border border-primary/10">
          {t.name[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground font-poppins">{t.name}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t.format.replace("_", " ")} · {t.maxPlayers} PLAYERS</p>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
              t.status === "UPCOMING" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              t.status === "OPEN"     ? "bg-primary/10 text-primary border border-primary/20" :
                                        "bg-foreground/10 text-foreground/40 border border-foreground/20"
            }`}>{t.status}</span>
            {t.status === "UPCOMING" && t.date && (
              <span className="text-[8px] font-black text-blue-400/60 uppercase tracking-widest">
                Scheduled: {new Date(t.date).toLocaleString()}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Invite Link:</span>
            <button onClick={handleCopy} className="text-[8px] font-black text-primary uppercase tracking-[0.2em] hover:underline cursor-pointer bg-primary/5 px-2 py-1 rounded-md">
              {t.inviteToken.slice(0, 8)}... (Copy)
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        {t.status !== "COMPLETED" && (
          <button onClick={() => onComplete(t.id)} className="flex-1 md:w-40 py-4 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-xl font-poppins">
            Complete
          </button>
        )}
        <button onClick={() => onControlRoom(t.id)} className="flex-1 md:w-40 py-4 bg-foreground/10 text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all rounded-xl font-poppins">
          Control Room
        </button>
      </div>
    </div>
  );
}
