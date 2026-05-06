"use client";
import { useState } from "react";

export interface AdminUser {
  id: string;
  sub?: string;
  username: string;
  email: string;
  roles: string[];
  isGuest: boolean;
  guestName?: string;
  expiresAt?: string;
  isExpired?: boolean;
}

interface Props {
  users: AdminUser[];
  onDelete: (userId: string) => void;
  onBatchDelete: (userIds: string[]) => void;
  onConvert: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onCreateClick: () => void;
}

export default function UserRegistry({ users, onDelete, onBatchDelete, onConvert, onEdit, onCreateClick }: Props) {
  const [activeTab, setActiveTab] = useState<"registered" | "guests">("registered");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  const registeredUsers = users.filter(u => !u.isGuest);
  const guestUsers = users.filter(u => u.isGuest);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === guestUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(guestUsers.map(u => (u.id || u.sub) as string)));
    }
  };

  const handleTabChange = (tab: "registered" | "guests") => {
    setActiveTab(tab);
    setSelectedIds(new Set());
    setIsBatchMode(false);
  };

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative group flex flex-col min-h-[600px] transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(82,185,70,0.05)]">
      {/* Header / Tabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-950 items-stretch">
        <button 
          onClick={() => handleTabChange("registered")}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-r border-neutral-800 ${activeTab === 'registered' ? 'bg-primary text-background' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
        >
          Users
        </button>
        <button 
          onClick={() => handleTabChange("guests")}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-r border-neutral-800 ${activeTab === 'guests' ? 'bg-primary text-background' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
        >
          Guests
        </button>
        <div className="flex-1" />
        
        {activeTab === "guests" && (
          <button 
            onClick={() => { setIsBatchMode(!isBatchMode); setSelectedIds(new Set()); }}
            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-l border-neutral-800 ${isBatchMode ? 'bg-amber-500 text-background' : 'text-amber-500 hover:bg-amber-500/10'}`}
          >
            {isBatchMode ? "Exit Bulk Mode" : "Bulk Select"}
          </button>
        )}

        {selectedIds.size > 0 && (
          <button 
            onClick={() => onBatchDelete(Array.from(selectedIds))}
            className="px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all bg-red-600 text-white hover:bg-red-700 border-l border-neutral-800"
          >
            Delete {selectedIds.size}
          </button>
        )}
        
        <button 
          onClick={onCreateClick}
          className="px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all bg-primary/10 text-primary hover:bg-primary hover:text-background border-l border-neutral-800"
        >
          + Create
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-0 flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase tracking-widest sticky top-0 z-10 border-b border-neutral-800">
              <tr>
                {isBatchMode && activeTab === "guests" && (
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="accent-primary"
                      checked={selectedIds.size > 0 && selectedIds.size === guestUsers.length}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {(activeTab === 'registered' ? registeredUsers : guestUsers).map(u => {
                const uId = u.id || u.sub;
                if (!uId) return null;
                const isSelected = selectedIds.has(uId);
                return (
                  <tr key={uId} className={`hover:bg-primary/[0.03] transition-all duration-300 group/row border-b border-neutral-800/50 last:border-b-0 ${isSelected ? 'bg-primary/10' : ''}`}>
                    {isBatchMode && activeTab === "guests" && (
                      <td className="px-6 py-4">
                         <input 
                           type="checkbox" 
                           className="accent-primary"
                           checked={isSelected}
                           onChange={() => toggleSelect(uId)}
                         />
                      </td>
                    )}
                    <td className="px-6 py-4 font-bold">
                      <div className="flex flex-col">
                        <span className="text-foreground">{u.username || "Guest"}</span>
                        <span className="text-[10px] text-neutral-500 font-normal lowercase">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap items-center">
                        {u.isGuest ? (
                          <>
                            <span className="text-[9px] px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase font-black tracking-widest">Guest</span>
                            {u.expiresAt && (
                              <span className={`text-[9px] px-2 py-0.5 font-mono ${u.isExpired || new Date(u.expiresAt) < new Date() ? 'text-red-500 bg-red-500/10 border border-red-500/20' : 'text-amber-500 bg-amber-500/10 border border-amber-500/20'}`}>
                                {(() => {
                                  const left = new Date(u.expiresAt).getTime() - new Date().getTime();
                                  if (left <= 0 || u.isExpired) return "EXPIRED";
                                  const mins = Math.floor(left / 60000);
                                  const secs = Math.floor((left % 60000) / 1000);
                                  if (mins > 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                                  return `${mins}m ${secs}s`;
                                })()}
                              </span>
                            )}
                          </>
                        ) : (
                          u.roles?.map(r => (
                            <span key={r} className={`text-[9px] px-2 py-0.5 uppercase tracking-widest font-black ${
                              r === 'ADMIN'     ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                              r === 'ORGANIZER' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                 'bg-neutral-800 text-neutral-300'
                            }`}>{r}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex justify-end gap-2 transition-opacity ${isSelected || isBatchMode ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'}`}>
                        {u.isGuest ? (
                          <button 
                            onClick={() => onConvert(u)}
                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-background border border-primary/30 px-3 py-1.5 transition-all"
                          >
                            Convert
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => onEdit(u)}
                              className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white/20 border border-neutral-700 px-3 py-1.5 transition-all duration-300 active:scale-95"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => onDelete(uId)}
                          className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white bg-red-600/10 hover:bg-red-600 border border-red-600/20 px-3 py-1.5 transition-all duration-300 active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
