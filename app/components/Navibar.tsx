"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
      router.push("/");
    }
  };

  const navLinks = [
    { name: "Tournaments", href: "/tournaments" },
    { name: "Leaderboards", href: "/leaderboards" },
  ];

  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin) {
    navLinks.push({ name: "Admin", href: "/admin" });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-foreground/5 h-20">
      {/* Dynamic Background Accent */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between relative z-10">
        {/* Branding */}
        <div className="flex items-center gap-12">
          <Link href="/" className="group flex items-center">
            <Image 
              src="/hpluslogo.png" 
              alt="Hobby+ Logo" 
              width={140} 
              height={44} 
              className="w-32 h-10 object-contain transition-opacity duration-300 group-hover:opacity-80" 
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 relative py-2 font-poppins ${
                    isActive ? "text-primary-light" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-primary-light animate-in fade-in slide-in-from-left-4 duration-500" />
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
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center font-black text-xs transition-all duration-500 border-2 font-poppins ${
                  isProfileMenuOpen 
                  ? "bg-gradient-primary text-background border-primary-light shadow-[0_0_20px_var(--color-primary-glow)]" 
                  : "bg-foreground/5 text-foreground border-foreground/10 hover:border-primary/40"
                }`}
              >
                {user.username?.[0]?.toUpperCase() || "U"}
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-background/95 backdrop-blur-2xl border border-foreground/10 shadow-2xl py-2 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
                  
                  <div className="px-6 py-5 border-b border-foreground/5 mb-2 relative">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 font-poppins">Authenticated</p>
                    <p className="text-sm font-black text-foreground truncate font-poppins">{user.username}</p>
                  </div>
                  
                  <Link
                    href={`/profile/${user.id || user.sub}`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-primary-light hover:bg-foreground/5 transition-all font-poppins"
                  >
                    <div className="w-1.5 h-1.5 bg-primary" />
                    View Profile
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all text-left border-t border-foreground/5"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="group relative bg-primary text-background px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] overflow-hidden transition-all active:scale-95 shadow-[0_10px_20px_var(--color-primary-glow)] font-poppins"
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 group-hover:text-background">Login</span>
            </Link>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
            aria-label="Toggle Navigation"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0" : "w-4"}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "w-6 -rotate-45 -translate-y-1" : "w-5"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-background transition-all duration-500 md:hidden ${
        isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}>
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-12">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-4xl font-black uppercase tracking-tighter transition-all duration-500 font-poppins ${
                pathname === link.href ? "text-primary translate-x-4" : "text-foreground/40 hover:text-foreground"
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="w-12 h-px bg-foreground/10" />
          
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-xl font-black uppercase tracking-[0.4em] text-red-500/60 hover:text-red-500 transition-colors"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/auth"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-black uppercase tracking-[0.4em] text-primary hover:text-primary/80 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
