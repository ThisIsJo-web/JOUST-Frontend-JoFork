"use client";
import { Tournament } from "../../../types";
import { DragDropProvider, PointerSensor, DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

interface Props { 
  tournament: Tournament;
  onReorder: (activeUserId: string, newIndex: number) => void;
  onRemove: (userId: string) => void;
}

function SortableParticipantCard({ p, idx, isAdmin, onRemove }: { p: any; idx: number; isAdmin: boolean; onRemove: (id: string) => void }) {
  const { ref, handleRef, isDragging } = useSortable({
    id: p.userId,
    index: idx,
    disabled: !isAdmin,
  });

  return (
    <div
      ref={ref}
      className={`bg-white/[0.02] border transition-all duration-300 rounded-[1.25rem] flex items-center justify-between group h-20 px-6 ${isDragging ? 'border-primary/50 scale-[1.02] shadow-2xl shadow-primary/10 bg-white/[0.05]' : 'border-white/[0.05] hover:border-white/10'}`}
    >
      <div className="flex items-center gap-6">
        {/* Drag Handle */}
        {isAdmin && (
          <div
            ref={handleRef}
            className="cursor-grab active:cursor-grabbing text-foreground/10 hover:text-primary transition-colors p-2 -ml-2 touch-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8h16M4 16h16"/>
            </svg>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-primary font-black text-[8px] font-poppins tracking-[0.2em] mb-0.5">UNIT {(idx + 1).toString().padStart(2, "0")}</span>
          <span className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{p.user?.username || p.user?.guestName || "Unknown"}</span>
        </div>
        {p.user?.isGuest && (
          <span className="text-[7px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 uppercase font-black tracking-widest rounded-full">Guest</span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.3em] font-mono">#{p.user?.id?.slice(0, 6)}</span>
        {isAdmin && (
          <button 
            onClick={() => onRemove(p.userId)}
            className="w-10 h-10 flex items-center justify-center text-foreground/10 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
            title="Decommission Unit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function RosterPanel({ tournament, onReorder, onRemove }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;
    if (source && target && source.id !== target.id) {
      const oldIndex = tournament.participants.findIndex(p => p.userId === source.id);
      const newIndex = tournament.participants.findIndex(p => p.userId === target.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(source.id as string, newIndex);
      }
    }
  };

  const isOpen = tournament.status === "OPEN";

  return (
    <div className="lg:col-span-8 space-y-12">
      <div className="flex items-center gap-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground font-poppins">
          Arena Roster <span className="text-foreground/10 ml-4 font-light">[{tournament.participants.length} / {tournament.maxPlayers}]</span>
        </h2>
        <div className="h-[1px] flex-1 bg-white/[0.05]" />
      </div>

      <DragDropProvider
        sensors={[PointerSensor]}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {tournament.participants.length === 0 ? (
            <div className="col-span-full py-32 border border-dashed border-white/[0.05] rounded-[3rem] bg-white/[0.01] flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.02]">
              <div className="p-5 bg-white/[0.03] rounded-full">
                <svg className="w-8 h-8 text-foreground/5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <p className="font-black uppercase text-[10px] tracking-[0.4em] text-foreground/10">No combatants deployed</p>
            </div>
          ) : (
            tournament.participants.map((p, idx) => (
              <SortableParticipantCard key={p.userId} p={p} idx={idx} isAdmin={isOpen} onRemove={onRemove} />
            ))
          )}
        </div>
      </DragDropProvider>
    </div>
  );
}
