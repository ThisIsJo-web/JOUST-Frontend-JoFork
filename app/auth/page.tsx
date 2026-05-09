"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as m from "motion/react";
import { AnimatePresence } from "motion/react";
import { authenticatedFetch, API_ENDPOINTS, API_URL } from "../utils/api";
import FadeIn, { StaggerContainer } from "../components/FadeIn";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const endpoint = mode === "login" ? API_ENDPOINTS.AUTH.SIGNIN : API_ENDPOINTS.AUTH.SIGNUP;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${mode === "login" ? "Signed in" : "Signed up"}`);
        if (data.token) localStorage.setItem("token", data.token);
        setTimeout(() => router.push("/home"), 1000);
      } else {
        setMessage(`Error: ${data.message || "Something went wrong"}`);
      }
    } catch (error) {
      setMessage("Error: Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-questrial bg-[#0F0F0F]">
      
      {/* Subtle Pulsing Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent animate-pulse duration-[5000ms]" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse duration-[6000ms] delay-1000" />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <StaggerContainer className="w-full max-w-[440px]">
          <FadeIn>
            <div className="bg-[#141414] border border-white/5 p-8 md:p-10 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
              
              {/* Header */}
              <div className="flex flex-col items-center mb-8 relative text-center">
                <Image
                  src="/hpluslogo.png"
                  alt="Hplus Logo"
                  width={176}
                  height={64}
                  className="w-36 h-12 object-contain brightness-125 transition-transform duration-700 hover:scale-105 mb-4"
                  priority
                />
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-poppins opacity-80">
                  User Portal
                </h2>
              </div>

              {/* Mode Switcher */}
              <div className="bg-black/40 p-1 rounded-xl flex mb-8 border border-white/5 relative">
                <button
                  onClick={() => setMode("login")}
                  className={`relative z-10 flex-1 py-2.5 font-black text-[10px] uppercase tracking-widest transition-all rounded-lg font-poppins ${
                    mode === "login" ? "text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Sign In
                  {mode === "login" && (
                    <m.motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-lg shadow-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`relative z-10 flex-1 py-2.5 font-black text-[10px] uppercase tracking-widest transition-all rounded-lg font-poppins ${
                    mode === "signup" ? "text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Sign Up
                  {mode === "signup" && (
                    <m.motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-lg shadow-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 font-poppins">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="EX: ARENA_KING"
                    className="w-full h-12 bg-black/40 border border-white/5 px-5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl font-questrial"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-poppins">
                      Password
                    </label>
                    <button type="button" className="text-[10px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-colors font-poppins">
                      Recover
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 bg-black/40 border border-white/5 px-5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl font-questrial"
                    required
                  />
                </div>

                <AnimatePresence mode="wait">
                  {message && (
                    <m.motion.div 
                      key="message"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className={`p-3 text-[10px] font-black uppercase tracking-widest text-center rounded-lg ${
                        message.startsWith("Error") 
                          ? "bg-red-500/10 text-red-500 border border-red-500/10" 
                          : "bg-primary/10 text-primary border border-primary/10"
                      }`}
                    >
                      {message}
                    </m.motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="w-full h-14 bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all rounded-xl shadow-xl shadow-primary/20 font-poppins mt-2 relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <m.motion.span
                      key={mode}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="block"
                    >
                      {mode === "login" ? "Sign In" : "Sign Up"}
                    </m.motion.span>
                  </AnimatePresence>
                </button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-4">
                <Link 
                  href="/" 
                  className="text-[10px] font-black text-primary hover:text-white uppercase tracking-[0.3em] transition-colors font-poppins"
                >
                  ← BACK TO LANDING
                </Link>
                <p className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] leading-relaxed font-questrial">
                  Authorized access only. Secure login active.
                </p>
              </div>
            </div>
          </FadeIn>
        </StaggerContainer>
      </main>
    </div>
  );
}