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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1B1B1B]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1B1B1B] border border-white/10 w-full max-w-[500px] shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden rounded-sm">
        <div className="p-6 border-b border-white/5 bg-[#1B1B1B]">
          <h3 className="text-lg font-semibold text-white tracking-tight">
            {user ? "Edit User Account" : "Create New User"}
          </h3>
          <p className="text-[11px] text-white/40 uppercase tracking-widest mt-1">Identity Configuration Service</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-0.5">Username</label>
              <input
                type="text" required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full h-10 bg-[#1B1B1B] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/10 rounded-sm"
                placeholder="Identity Label"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-0.5">Email Address</label>
              <input
                type="email" required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-10 bg-[#1B1B1B] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/10 rounded-sm"
                placeholder="system@domain.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-0.5">Access Role</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full h-10 bg-[#1B1B1B] border px-3 flex items-center justify-between transition-all ${
                    isDropdownOpen ? 'border-primary' : 'border-white/10 hover:border-white/20'
                  } rounded-sm`}
                >
                  <span className="text-xs text-white uppercase font-medium">
                    {formData.roles[0] || "Select Permissions"}
                  </span>
                  <svg className={`w-3 h-3 text-white/20 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#1B1B1B] border border-white/10 shadow-2xl z-20">
                    {AVAILABLE_ROLES.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => selectRole(role)}
                        className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b border-white/5 last:border-b-0 transition-colors ${
                          formData.roles.includes(role) ? 'bg-primary text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-0.5">
                {user ? "Modify Password (Optional)" : "Security Password"}
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-10 bg-[#1B1B1B] border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/10 rounded-sm"
                placeholder={user ? "Unchanged" : "••••••••"}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-primary text-black text-[11px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 rounded-sm"
            >
              {isSubmitting ? "Processing..." : (user ? "Save Changes" : "Confirm Creation")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 h-10 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
