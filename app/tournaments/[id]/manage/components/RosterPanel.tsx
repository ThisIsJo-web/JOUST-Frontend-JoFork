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
      className={`bg-foreground/5 border ${isDragging ? 'border-primary/50 scale-[1.02] shadow-lg shadow-primary/10' : 'border-foreground/5'} p-6 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        {isAdmin && (
          <div
            ref={handleRef}
            className="cursor-grab active:cursor-grabbing text-foreground/20 hover:text-primary transition-colors p-2 -ml-2 touch-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16"/>
            </svg>
          </div>
        )}
        <span className="text-primary font-black text-[10px] font-poppins w-6">{(idx + 1).toString().padStart(2, "0")}</span>
        <span className="text-sm font-black text-foreground uppercase tracking-tight font-poppins">{p.user?.username || p.user?.guestName || "Unknown"}</span>
        {p.user?.isGuest && (
          <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 uppercase font-black">Guest</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">#{p.user?.id?.slice(0, 6)}</span>
        {isAdmin && (
          <button 
            onClick={() => onRemove(p.userId)}
            className="p-2 text-foreground/20 hover:text-red-500 transition-colors"
            title="Remove Participant"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
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
    <div className="lg:col-span-8 space-y-8">
      <div className="flex items-center gap-6 mb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground font-poppins">
          Arena Roster <span className="text-foreground/20 ml-2">[{tournament.participants.length}/{tournament.maxPlayers}]</span>
        </h2>
        <div className="h-[1px] flex-1 bg-foreground/10" />
      </div>

      <DragDropProvider
        sensors={[PointerSensor]}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournament.participants.length === 0 ? (
            <div className="col-span-full py-20 border border-dashed border-foreground/10 rounded-[2.5rem] flex items-center justify-center text-foreground/20 font-black uppercase text-sm tracking-widest">
              No combatants deployed
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
