export interface AdminTournament {
  id: string;
  name: string;
  status: string;
  date: string;
  format: string;
}

interface Props {
  tournaments: AdminTournament[];
  onForceComplete: (id: string) => void;
}

export default function TournamentTable({ tournaments, onForceComplete }: Props) {
  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6 border-b border-neutral-800 bg-neutral-950/50">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
          <span className="w-2 h-8 bg-amber-400 block" />
          Operations Log
        </h2>
      </div>
      <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase tracking-widest sticky top-0 z-10 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4">Designation</th>
              <th className="px-6 py-4">State</th>
              <th className="px-6 py-4 text-right">Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {tournaments.map(t => (
              <tr key={t.id} className="hover:bg-neutral-800/30 transition-colors group/row">
                <td className="px-6 py-4 font-bold">{t.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest font-black ${
                    t.status === 'COMPLETED' ? 'text-primary bg-primary/10' :
                    t.status === 'ONGOING'   ? 'text-amber-400 bg-amber-400/10 animate-pulse' :
                    t.status === 'OPEN'      ? 'text-green-400 bg-green-400/10' :
                                               'text-neutral-400 bg-neutral-800'
                  }`}>{t.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status !== 'COMPLETED' && (
                    <button onClick={() => onForceComplete(t.id)} className="opacity-0 group-hover/row:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-neutral-950 border border-primary/50 px-3 py-1">
                      Force Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
