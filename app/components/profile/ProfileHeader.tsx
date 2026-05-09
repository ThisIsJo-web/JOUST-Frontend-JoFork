"use client";

import React from "react";
import * as m from "motion/react";

interface UserProfile {
  id: string;
  username: string;
  roles?: string[];
  isGuest?: boolean;
  createdAt?: string;
}

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  onLogout: () => void;
}

export default function ProfileHeader({ user, isOwnProfile, onLogout }: ProfileHeaderProps) {
  return (
    <m.motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-l-4 border-l-primary border-y border-r border-primary/20 rounded-none p-8 md:p-10 relative overflow-hidden"
    >
      <div className="relative shrink-0 z-10">
        <div className="w-24 h-24 md:w-40 md:h-40 bg-primary/20 rounded-none border-2 border-primary flex items-center justify-center text-primary text-4xl md:text-6xl font-black shadow-[0_0_40px_rgba(var(--primary),0.4)]">
          <div>{user.username?.[0]?.toUpperCase() || "U"}</div>
        </div>
        {user.roles?.includes("ADMIN") && (
          <m.motion.div 
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -bottom-2 -right-2 bg-red-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded-xl border-2 md:border-4 border-neutral-900 shadow-xl"
          >
            Admin
          </m.motion.div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left flex flex-col justify-center pt-2 md:pt-4 z-10">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground font-poppins mb-2 drop-shadow-md">
          {user.username}
        </h1>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 md:mt-4">
          {user.isGuest && (
            <span className="bg-foreground/10 text-foreground px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
              Guest Account
            </span>
          )}
        </div>
        
        {user.createdAt && (
          <p className="text-foreground/30 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-6 md:mt-8">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}

        {/* Mobile Action Buttons */}
        {isOwnProfile && (
          <div className="flex md:hidden flex-col items-center gap-4 mt-8 w-full">
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-background border border-primary rounded-none text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Profile
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-none text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Desktop Action Buttons */}
      {isOwnProfile && (
        <div className="hidden md:flex absolute top-8 right-8 flex-row items-center gap-3 z-20">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background border border-primary rounded-none text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 group shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Profile
            <span className="absolute -top-10 right-0 bg-background border border-foreground/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-foreground/50">Coming Soon</span>
          </button>
        </div>
      )}
    </m.motion.div>
  );
}
