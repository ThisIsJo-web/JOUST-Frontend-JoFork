"use client";
import { useState, useEffect, useRef } from "react";
import { AdminUser } from "./UserRegistry";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSubmit: (userId: string | null, data: any) => Promise<void>;
}

const AVAILABLE_ROLES = ["PLAYER", "ORGANIZER", "ADMIN"];

export default function UserModal({ isOpen, onClose, user, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roles: ["PLAYER"] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        roles: user.roles || ["PLAYER"],
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        roles: ["PLAYER"],
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const selectRole = (role: string) => {
    setFormData(prev => ({ ...prev, roles: [role] }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submissionData: any = {
      username: formData.username,
      email: formData.email,
      roles: formData.roles,
    };
    if (formData.password.trim()) submissionData.password = formData.password;

    try {
      await onSubmit(user ? (user.id || user.sub!) : null, submissionData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-all duration-500" onClick={onClose} />
      
      <div className="relative bg-neutral-900 border border-neutral-800 w-full max-w-[900px] shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 overflow-hidden rounded-sm group/modal">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <form id="user-form" onSubmit={handleSubmit}>
          <div className="p-10 md:p-14 border-b border-neutral-800/50">
             <h3 className="text-4xl font-black uppercase tracking-tighter text-white font-poppins relative z-10">
              {user ? "Manage" : "Create"} <span className="text-primary group-hover/modal:text-primary transition-colors duration-500">User</span>
            </h3>
          </div>

          <div className="flex flex-col md:flex-row min-h-[300px]">
            {/* Left Column (Identity) */}
            <div className="flex-1 p-10 md:p-14 border-b md:border-b-0 md:border-r border-neutral-800/50">
              <div className="space-y-10">
                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-primary transition-colors">Username</label>
                  <input
                    type="text" required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full h-14 bg-black/40 border border-neutral-800 px-6 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-neutral-700 hover:border-neutral-700"
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-primary transition-colors">Email</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 bg-black/40 border border-neutral-800 px-6 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-neutral-700 hover:border-neutral-700"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (Access) */}
            <div className="flex-1 bg-neutral-950/30 p-10 md:p-14 flex flex-col backdrop-blur-sm">
              <div className="flex-1 space-y-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1 mb-1 block">Access Permissions</label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full h-14 bg-black/60 border px-6 flex items-center justify-between group/drop transition-all duration-300 ${
                        isDropdownOpen ? 'border-primary shadow-[0_0_20px_rgba(82,185,70,0.1)]' : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-white truncate mr-2">
                        {formData.roles[0] || "Select Role"}
                      </span>
                      <div className={`transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                        <svg className={`w-4 h-4 ${isDropdownOpen ? 'text-primary' : 'text-neutral-500 group-hover/drop:text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-neutral-900/95 border border-primary/20 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-3 duration-300 backdrop-blur-xl">
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                          {AVAILABLE_ROLES.map(role => {
                            const isActive = formData.roles.includes(role);
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => selectRole(role)}
                                className={`w-full flex items-center justify-between px-6 py-5 border-b border-neutral-800/50 last:border-b-0 transition-all duration-300 group/item ${
                                  isActive ? 'bg-primary/5 text-primary' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                                }`}
                              >
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-transform duration-300 ${isActive ? 'translate-x-1' : ''}`}>{role}</span>
                                <div className={`w-4 h-4 rounded-full border transition-all duration-300 flex items-center justify-center ${
                                  isActive ? 'bg-primary border-primary scale-110 shadow-[0_0_10px_rgba(82,185,70,0.5)]' : 'border-neutral-700 group-hover/item:border-neutral-500'
                                }`}>
                                  {isActive && (
                                    <div className="w-1.5 h-1.5 bg-background rounded-full animate-in zoom-in duration-200" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-primary transition-colors">
                    {user ? "Change Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    required={!user}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 bg-black/40 border border-neutral-800 px-6 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-neutral-700 hover:border-neutral-700"
                    placeholder={user ? "Optional" : "••••••••"}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-12">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-primary text-background text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-125 hover:shadow-[0_0_30px_rgba(82,185,70,0.3)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  ) : (user ? "Commit Changes" : "Create User")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-14 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white active:scale-95 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 185, 70, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 185, 70, 0.3); }
      `}</style>
    </div>
  );
}
