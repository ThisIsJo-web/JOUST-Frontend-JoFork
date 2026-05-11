"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface ManagerSidebarProps {
  userRoles: string[];
}

export default function ManagerSidebar({ userRoles }: ManagerSidebarProps) {
  const pathname = usePathname();

  const links = [
    { label: "DASHBOARD", href: "/tournaments/manage", icon: "📊" },
    { label: "CREATE NEW", href: "/tournaments/create", icon: "➕" },
  ];

  if (userRoles.includes("ADMIN")) {
    links.push({ label: "ADMIN CENTER", href: "/admin", icon: "🛡️" });
  }

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-white/10">
        <div className="text-white font-black tracking-tighter text-2xl font-poppins uppercase leading-none">
          JOUST<br/>
          <span className="text-primary text-[8px] tracking-[0.4em] font-bold">MANAGER</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-all rounded-[4px] ${
              pathname === link.href
                ? "bg-primary text-black"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <Link href="/" className="text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
          ← EXIT TO SITE
        </Link>
      </div>
    </aside>
  );
}
