export interface AdminUser {
  id: string;
  sub?: string;
  username: string;
  email: string;
  roles: string[];
  isGuest: boolean;
}

interface Props {
  users: AdminUser[];
  onRoleToggle: (userId: string, currentRoles: string[], role: string) => void;
}

export default function UserTable({ users, onRoleToggle }: Props) {
  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-6 border-b border-neutral-800 bg-neutral-950/50">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
          <span className="w-2 h-8 bg-primary block" />
          User Registry
        </h2>
      </div>
      <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase tracking-widest sticky top-0 z-10 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4">Callsign</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Access Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {users.map(u => {
              const uId = u.id || u.sub;
              if (!uId) return null;
              return (
                <tr key={uId} className="hover:bg-neutral-800/30 transition-colors group/row">
                  <td className="px-6 py-4 font-bold">
                    {u.username}
                    {u.isGuest && (
                      <span className="ml-2 text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-sm uppercase">Guest</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles?.map(r => (
                        <span key={r} className={`text-[10px] px-2 py-0.5 uppercase tracking-widest font-black ${
                          r === 'ADMIN'     ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          r === 'ORGANIZER' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                             'bg-neutral-800 text-neutral-300'
                        }`}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      {!u.isGuest && (
                        <>
                          <button onClick={() => onRoleToggle(uId, u.roles || [], 'ORGANIZER')} className="text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 border border-amber-500/20 px-3 py-1 bg-amber-500/5">Toggle Org</button>
                          <button onClick={() => onRoleToggle(uId, u.roles || [], 'ADMIN')}     className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 border border-red-500/20 px-3 py-1 bg-red-500/5">Toggle Admin</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
