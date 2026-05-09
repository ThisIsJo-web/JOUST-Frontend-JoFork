"use client";

import React from "react";
import * as m from "motion/react";
import { BentoBox } from "../ui/Bento";

interface UserProfile {
  id: string;
  username: string;
  roles?: string[];
  isGuest?: boolean;
  createdAt?: string;
}

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onLogout?: () => void;
  variant?: "default" | "bento";
}

export default function ProfileHeader({ user, isOwnProfile = false, onLogout, variant = "default" }: ProfileHeaderProps) {
  const avatar = (
    <div className="relative group">
      <div className={`
        ${variant === "bento" ? "w-24 h-24 text-3xl" : "w-40 h-40 md:w-56 md:h-56 text-6xl md:text-8xl"}
        bg-black border-2 border-primary text-primary flex items-center justify-center font-black font-poppins relative z-10 transition-transform duration-300 group-hover:scale-105
      `}>
        {user.username?.[0]?.toUpperCase() || "U"}
        {/* Internal technical lines */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/40" />
      </div>
    </div>
  );

  const statsInfo = (
    <div className="flex flex-col">
      <h1 className={`
        ${variant === "bento" ? "text-4xl" : "text-6xl md:text-8xl lg:text-9xl"}
        font-black uppercase tracking-tighter text-white font-poppins leading-none mb-6 mix-blend-difference
      `}>
        {user.username}
      </h1>
    </div>
  );

  if (variant === "bento") {
    return (
      <BentoBox theme="default" className="p-0 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(var(--color-primary),0.03)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />
        <div className="p-6 flex items-center gap-8 h-full relative z-10">
          {avatar}
          {statsInfo}
        </div>
      </BentoBox>
    );
  }

  return (
    <m.motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="flex flex-col md:flex-row items-center md:items-center gap-16 bg-black border-2 border-white/5 p-12 md:p-24 relative overflow-hidden min-h-[500px]"
    >
      {/* Background Greeble Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden select-none">
        <div className="text-[20rem] font-black leading-none uppercase rotate-12 -ml-24 -mt-24">
          {user.username}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-8 text-white/5 font-mono text-[8px] tracking-[0.5em] hidden md:block">
        CORE_SYS_042 // LAT_34.0522_LNG_118.2437
      </div>

      <div className="relative z-10">
        {avatar}
      </div>

      <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-center">
        {statsInfo}
        
        <div className="mt-12 flex items-center gap-6">
          <div className="text-white/20 text-[9px] font-mono tracking-widest uppercase bg-zinc-900/50 px-4 py-2 border border-white/5">
             ID_{user.id?.toUpperCase()}
          </div>
          {user.createdAt && (
            <div className="text-white/20 text-[9px] font-mono tracking-widest uppercase">
              REGISTERED_{new Date(user.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && onLogout && (
        <div className="absolute top-12 right-12 z-20">
          <m.motion.button
            whileHover={{ scale: 1.05, borderColor: "rgba(var(--color-primary),1)", color: "rgba(var(--color-primary),1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="px-8 py-4 border-2 border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] transition-all font-poppins"
          >
            TERMINATE_LINK
          </m.motion.button>
        </div>
      )}
    </m.motion.div>
  );
}

