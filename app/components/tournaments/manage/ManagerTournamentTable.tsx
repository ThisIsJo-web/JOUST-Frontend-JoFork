"use client";
import React from "react";
import Link from "next/link";
import { Tournament } from "../../types";

interface ManagerTournamentTableProps {
  tournaments: Tournament[];
  onComplete: (id: string) => void;
}

export default function ManagerTournamentTable({ tournaments, onComplete }: ManagerTournamentTableProps) {
  return (
    <div className="w-full bg-black border border-white/10 rounded-[4px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#111] border-b border-white/10">
          <tr>
            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-white/30">Tournament Name</th>
            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-white/30">Status</th>
            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-white/30">Format</th>
            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-white/30">Capacity</th>
            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tournaments.map((t) => (
            <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{t.name}</span>
                  <span className="text-[10px] text-white/20 font-mono tracking-tighter">ID: {t.id}</span>
                </div>
              </td>
              <td className="p-4">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-[2px] ${
                  t.status === "OPEN" ? "bg-primary/20 text-primary border border-primary/30" :
                  t.status === "ONGOING" ? "bg-amber-400/20 text-amber-400 border border-amber-400/30" :
                  "bg-white/10 text-white/40 border border-white/20"
                }`}>
                  {t.status}
                </span>
              </td>
              <td className="p-4">
                <span className="text-[11px] font-bold text-white/60 uppercase">{t.format.replace("_", " ")}</span>
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{t.participants?.length} / {t.maxPlayers}</span>
                  <div className="w-24 h-1 bg-white/5 mt-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${(t.participants?.length / t.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link 
                    href={`/tournaments/${t.id}/lobby`}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase rounded-[4px] transition-all"
                  >
                    LOBBY
                  </Link>
                  <Link 
                    href={`/tournaments/${t.id}/manage`}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 text-[10px] font-bold uppercase rounded-[4px] transition-all"
                  >
                    CONTROL ROOM
                  </Link>
                  {t.status !== "COMPLETED" && (
                    <button 
                      onClick={() => onComplete(t.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-bold uppercase rounded-[4px] transition-all"
                    >
                      FINALIZE
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {tournaments.length === 0 && (
            <tr>
              <td colSpan={5} className="p-20 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">NO TOURNAMENTS DEPLOYED</p>
                <Link href="/tournaments/create" className="mt-4 inline-block text-primary text-[11px] font-bold uppercase hover:underline">
                  + Create Your First Tournament
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
