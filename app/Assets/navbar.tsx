"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authenticatedFetch, API_ENDPOINTS } from "../utils/api";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<{ username: string } | null>(null);

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

    const handleSignOut = async () => {
        try {
            await authenticatedFetch(API_ENDPOINTS.AUTH.SIGNOUT);
        } finally {
            localStorage.removeItem("token");
            setUser(null);
            setIsMenuOpen(false);
            router.push("/");
        }
    };

    const navLinks = [
        { name: "Tournaments", href: "/Tournaments" },
        { name: "Leaderboards", href: "/Leaderboards" },
    ];

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
                        /* Profile/Logout Circle (Desktop) */
                        <button 
                            onClick={handleSignOut}
                            className="hidden sm:flex w-10 h-10 rounded-full bg-primary items-center justify-center text-white font-black text-xs hover:brightness-110 transition-all border-2 border-foreground/5"
                            title="Sign Out"
                        >
                            {user.username?.[0]?.toUpperCase() || "U"}
                        </button>
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
                <div className="flex flex-col items-center justify-center h-full gap-12 p-6">
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
                        <button 
                            onClick={handleSignOut}
                            className="text-2xl font-black uppercase tracking-[0.3em] transition-all font-poppins text-red-500"
                        >
                            Logout
                        </button>
                    ) : (
                        /* Unstylized Login for Mobile */
                        <Link 
                            href="/Auth" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-2xl font-black uppercase tracking-[0.3em] transition-all font-poppins text-foreground"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}