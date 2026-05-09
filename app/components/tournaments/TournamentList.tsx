"use client";

import React from "react";
import Link from "next/link";
import * as m from "motion/react";
import { BentoBox } from "../ui/Bento";

interface Tournament {
  id: string;
  name: string;
  status: string;
  format: string;
  date?: string;
  createdAt?: string;
}

interface TournamentListProps {
  tournaments: Tournament[];
  variant?: "default" | "bento";
  limit?: number;
}

export default function TournamentList({ tournaments, variant = "default", limit }: TournamentListProps) {
  const displayTournaments = limit ? tournaments.slice(0, limit) : tournaments;
  const sorted = [...displayTournaments].sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const mouseX = m.useMotionValue(0);
  const mouseY = m.useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % sorted.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + sorted.length) % sorted.length);

  const rotateX = m.useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = m.useTransform(mouseX, [-500, 500], [-10, 10]);

  const content = (
    <div 
      className="flex flex-col h-full bg-surface text-white relative group/container overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
    >
      {variant === "bento" && (
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/30">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary font-poppins">
            Active Tournaments
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={prev}
              className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary transition-all bg-black"
            >
              ←
            </button>
            <button 
              onClick={next}
              className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary transition-all bg-black"
            >
              →
            </button>
          </div>
        </div>
      )}

      <div className="relative flex-1">
        <m.AnimatePresence mode="wait">
          {sorted.length > 0 && (
            <m.motion.div
              key={sorted[currentIndex].id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) prev();
                else if (info.offset.x < -100) next();
              }}
              className="h-full w-full grid grid-cols-1 md:grid-cols-2 cursor-grab active:cursor-grabbing"
            >
              {/* Image Side - Isolated Parallax */}
              <div className="relative h-full overflow-hidden border-r border-white/5 bg-black group">
                <m.motion.div 
                  className="absolute inset-0"
                  style={{ 
                    rotateX, 
                    rotateY, 
                    perspective: 1000,
                    transformStyle: "preserve-3d"
                  }}
                >
                  <img 
                    src={`https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop&sig=${sorted[currentIndex].id}`} 
                    alt={sorted[currentIndex].name}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </m.motion.div>
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
              </div>

              {/* Content Side - Static */}
              <div className="flex-1 p-12 flex flex-col justify-center bg-surface/40 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-6xl font-black uppercase tracking-tighter text-white group-hover:text-primary transition-colors font-poppins leading-none mb-2">
                      {sorted[currentIndex].name}
                    </h4>
                    <div className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">
                      ID: {sorted[currentIndex].id.slice(0, 8)}
                    </div>
                  </div>
                  <span className="px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-primary text-primary">
                    {sorted[currentIndex].status}
                  </span>
                </div>

                <p className="text-white/50 text-sm leading-relaxed max-w-xl font-poppins mb-8 italic">
                  Experience high-level competitive gaming. Join the arena and prove your skills against the best players in the community.
                </p>

                <div className="flex items-center gap-4">
                  <div className="px-4 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest">
                    {sorted[currentIndex].format?.replace('_', ' ')}
                  </div>
                  <Link href={`/tournaments/${sorted[currentIndex].id}`} className="text-white font-black text-xs uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform flex items-center gap-2">
                    VIEW TOURNAMENT <span className="text-primary text-lg">→</span>
                  </Link>
                </div>
              </div>
            </m.motion.div>
          )}
        </m.AnimatePresence>
      </div>
    </div>
  );

  if (variant === "bento") {
    return (
      <BentoBox theme="default" noPadding className="p-0">
        {content}
      </BentoBox>
    );
  }

  return content;
}
