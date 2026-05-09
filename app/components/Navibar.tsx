"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as m from "motion/react";
import { authenticatedFetch, API_ENDPOINTS } from "../utils/api";
import { useUser } from "./UserProvider";

/**
 * Navibar - The primary navigation component.
 * Implements the "Modern Sleek Hobbyist" aesthetic with professional terminology.
 */
export default function Navibar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks for profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authenticatedFetch(API_ENDPOINTS.AUTH.SIGNOUT);
    } finally {
      localStorage.removeItem("token");
      await refreshUser();
      setIsProfileMenuOpen(false);
      router.push("/");
    }
  };

  const navLinks = [];
  if (user) {
    navLinks.push({ name: "Home", href: "/home" });
  }
  navLinks.push(
    { name: "Tournaments", href: "/tournaments" },
    { name: "Leaderboards", href: "/leaderboards" }
  );

  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin) {
    navLinks.push({ name: "Admin", href: "/admin" });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-white/10 h-20 backdrop-blur-md bg-black/80">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between relative z-10">
        {/* Branding */}
        <div className="flex items-center gap-12">
          <Link href="/" className="group flex items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/hpluslogo.png"
                alt="Hplus Logo"
                width={120}
                height={40}
                className="w-28 h-auto object-contain brightness-125 group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </Link>
 
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-300 relative py-2 font-poppins ${
                    isActive ? "text-primary" : "text-white/40 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <m.motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary shadow-[0_0_20px_rgba(var(--color-primary),1)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <m.motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center font-black text-xs transition-all border-2 font-poppins ${
                  isProfileMenuOpen 
                  ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" 
                  : "bg-black text-white border-white/20 hover:border-primary"
                }`}
              >
                {user.username?.[0]?.toUpperCase() || "U"}
              </m.motion.button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-black border-2 border-white/10 shadow-[0_0_40px_rgba(0,0,0,1)] py-0 overflow-hidden z-50">
                  <div className="px-8 py-6 border-b border-white/10 bg-zinc-900/50">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1 font-poppins">USER</p>
                    <p className="text-lg font-black truncate font-poppins text-white">{user.username?.toUpperCase()}</p>
                  </div>
                  
                  <div className="divide-y divide-white/10">
                    <Link
                      href={`/profile/${user.id || user.sub}`}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-6 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-primary hover:bg-white/5 transition-all font-poppins"
                    >
                      <div className="w-2 h-2 bg-primary/40 group-hover:bg-primary" />
                      PROFILE
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-6 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-left font-poppins"
                    >
                      <div className="w-2 h-2 bg-red-500/40" />
                      LOGOUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <m.motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth"
                className="bg-primary text-black border-2 border-primary px-8 py-2.5 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary),0.5)] block font-poppins"
              >
                SIGN IN
              </Link>
            </m.motion.div>
          )}

        </div>
      </div>
    </header>
  );
}
