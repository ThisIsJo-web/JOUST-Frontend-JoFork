"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS } from "../utils/api";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ id?: string, sub?: string, username: string, email?: string, roles?: string[] } | null>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            }
        };
        fetchUser();
    }, [pathname]); // Refresh on navigation

    // Close profile menu when clicking outside
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
            setUser(null);
            setIsMenuOpen(false);
            setIsProfileMenuOpen(false);
            router.push("/");
        }
    };

    const navLinks = [
        { name: "Tournaments", href: "/Tournaments" },
        { name: "Leaderboards", href: "/Leaderboards" },
    ];

    const isAdmin = user?.roles?.includes('ADMIN');
    if (isAdmin) {
        navLinks.push({ name: "Admin", href: "/Admin" });
    }

    return (
        <>
            <header className="w-full h-20 px-6 md:px-12 flex items-center bg-neutral-800 sticky top-0 z-50 border-b border-foreground/5 justify-between">
                <nav className="flex items-center gap-8 md:gap-12">
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                        <Image 
                            src="/hpluslogo.png" 
                            alt="Hplus Logo" 
                            width={128} 
                            height={40} 
                            className="w-32 h-10 object-contain dark:invert-0 invert brightness-110" 
                            priority
                        />
                    </Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name}
                                href={link.href} 
                                className={`text-2xl font-black transition-all hover:text-primary font-poppins ${
                                    pathname === link.href ? "text-primary shadow-primary" : "text-foreground"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        /* Profile Menu Container (Desktop) */
                        <div className="relative hidden sm:block" ref={profileMenuRef}>
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className={`flex w-10 h-10 rounded-full items-center justify-center text-white font-black text-xs hover:brightness-110 transition-all border-2 ${isProfileMenuOpen ? 'bg-primary/80 border-primary' : 'bg-primary border-foreground/5'}`}
                                aria-label="Profile Menu"
                            >
                                {user.username?.[0]?.toUpperCase() || "U"}
                            </button>
                            
                            {/* Desktop Profile Dropdown Modal */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-4 w-56 bg-neutral-900 border border-foreground/10 rounded-2xl shadow-2xl py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-foreground/10 mb-2">
                                        <p className="text-sm font-bold text-foreground truncate">{user.username}</p>
                                        <p className="text-xs text-foreground/50 truncate uppercase tracking-widest mt-1">Logged In</p>
                                    </div>
                                    <Link 
                                        href={`/Profile?id=${user.id || user.sub}`} 
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="px-4 py-3 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors flex items-center gap-3 uppercase tracking-wider"
                                    >
                                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        View Profile
                                    </Link>
                                    <button 
                                        onClick={handleSignOut}
                                        className="px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3 uppercase tracking-wider text-left w-full"
                                    >
                                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Login Button (Desktop) */
                        <Link 
                            href="/Auth" 
                            className="hidden sm:block bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/10 font-poppins"
                        >
                            Login
                        </Link>
                    )}
                    
                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-foreground p-2 hover:bg-foreground/5 transition-colors rounded-xl"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-background transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div className="flex flex-col items-center justify-center h-full gap-10 p-6">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name}
                            href={link.href} 
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-2xl font-black uppercase tracking-[0.3em] transition-all font-poppins ${
                                pathname === link.href ? "text-primary" : "text-foreground"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    
                    {user ? (
                        <>
                            <div className="w-16 h-px bg-foreground/10 my-4"></div>
                            <Link 
                                href={`/Profile?id=${user.id || user.sub}`} 
                                onClick={() => setIsMenuOpen(false)}
                                className={`text-2xl font-black uppercase tracking-[0.3em] transition-all font-poppins flex items-center gap-3 ${
                                    pathname.startsWith("/Profile") ? "text-primary" : "text-foreground"
                                }`}
                            >
                                <svg className="w-6 h-6 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Profile
                            </Link>


                            <button 
                                onClick={handleSignOut}
                                className="text-2xl font-black uppercase tracking-[0.3em] transition-all font-poppins text-red-500 mt-4 flex items-center gap-3"
                            >
                                <svg className="w-6 h-6 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Logout
                            </button>
                        </>
                    ) : (
                        /* Unstylized Login for Mobile */
                        <Link 
                            href="/Auth" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-2xl font-black uppercase tracking-[0.3em] transition-all font-poppins text-foreground mt-8"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}