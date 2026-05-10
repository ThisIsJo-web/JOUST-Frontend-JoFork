"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as m from "motion/react";
import { useUser } from "../UserProvider";

/**
 * MobileBottomNav - Persistent tab bar for mobile "Web App" experience.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const allTabs = [
    { 
      name: "Events", 
      href: "/tournaments", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
          <path d="M2 17L12 22L22 17" />
          <path d="M2 12L12 17L22 12" />
        </svg>
      )
    },
    { 
      name: "Ranks", 
      href: "/leaderboards", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M8 21V10" />
          <path d="M12 21V3" />
          <path d="M16 21V14" />
        </svg>
      )
    },
    { 
      name: user ? "Home" : "Landing", 
      href: user ? "/home" : "/", 
      isFloating: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
          <path d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" />
        </svg>
      )
    },
    { 
      name: "Profile", 
      href: user ? `/profile/${user.id || (user as any).id}` : "/auth", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
  ];

  // Logic for specialized tabs
  const tabs = [...allTabs];
  
  // Add Manage tab for authorized personnel only
  if (user?.roles?.some((r: string) => r === "ADMIN" || r === "ORGANIZER")) {
    tabs.push({
      name: "Manage",
      href: "/tournaments/manage",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M9 3v18" />
          <path d="m14 9 3 3-3 3" />
        </svg>
      )
    });
  }

  // Filter out Events tab for logged in users if needed (keeping consistency with your existing filter)
  const finalTabs = user ? tabs.filter(tab => tab.name !== "Events") : tabs;

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-background/80 backdrop-blur-2xl border-t border-foreground/5 px-4 pb-safe-area-inset-bottom h-20">
      <div className="max-w-md mx-auto flex items-center justify-around h-full">
        {finalTabs.map((tab) => {
          const isActive = pathname === tab.href;
          
          if ((tab as any).isFloating) {
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className="relative flex flex-col items-center justify-center -mt-10"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                  isActive 
                  ? "bg-primary text-white scale-110 shadow-primary/40 ring-4 ring-background" 
                  : "bg-foreground text-background scale-100 shadow-black/20"
                }`}>
                  {tab.icon}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-2 font-poppins transition-all duration-300 ${isActive ? "text-primary opacity-100" : "text-foreground opacity-40"}`}>
                  {tab.name}
                </span>
              </Link>
            );
          }

          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-16 h-full group pt-2"
            >
              <div className={`transition-all duration-300 ${isActive ? "text-primary -translate-y-1" : "text-foreground/40 hover:text-foreground/60"}`}>
                {tab.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 font-poppins transition-all duration-300 ${isActive ? "opacity-100 scale-100 text-primary" : "opacity-40"}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
