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

  const tabs = [
    { 
      name: "Home", 
      href: "/", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" />
        </svg>
      )
    },
    { 
      name: "Tournaments", 
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
      name: "Leaderboards", 
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
      name: "Profile", 
      href: user ? `/profile/${user.id || user.sub}` : "/auth", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
          <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-background/80 backdrop-blur-2xl border-t border-foreground/5 px-4 pb-safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-16 h-full group"
            >
              <div className={`transition-all duration-300 ${isActive ? "text-primary -translate-y-1" : "text-foreground/40 hover:text-foreground/60"}`}>
                {tab.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 font-poppins transition-all duration-300 ${isActive ? "opacity-100 scale-100 text-primary" : "opacity-0 scale-50"}`}>
                {tab.name}
              </span>
              
              {isActive && (
                <m.motion.div 
                  layoutId="activeTab"
                  className="absolute -top-[1px] w-8 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
