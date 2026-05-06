import { Tournament } from "../../../types";

interface Props { tournament: Tournament; }

export default function RosterPanel({ tournament }: Props) {
  return (
    <div className="lg:col-span-8 space-y-8">
      <div className="flex items-center gap-6 mb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground font-poppins">
          Arena Roster <span className="text-foreground/20 ml-2">[{tournament.participants.length}/{tournament.maxPlayers}]</span>
        </h2>
        <div className="h-[1px] flex-1 bg-foreground/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournament.participants.length === 0 ? (
          <div className="col-span-full py-20 border border-dashed border-foreground/10 rounded-[2.5rem] flex items-center justify-center text-foreground/20 font-black uppercase text-sm tracking-widest">
            No combatants deployed
          </div>
        ) : (
          tournament.participants.map((p: { id: string; userId: string; user: { id: string; username?: string; guestName?: string } }, idx: number) => (
            <div key={p.id} className="bg-foreground/5 border border-foreground/5 p-6 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <span className="text-primary font-black text-[10px] font-poppins w-6">{(idx + 1).toString().padStart(2, "0")}</span>
                <span className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{p.user.username || p.user.guestName}</span>
              </div>
              <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">#{p.user.id.slice(0, 6)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
