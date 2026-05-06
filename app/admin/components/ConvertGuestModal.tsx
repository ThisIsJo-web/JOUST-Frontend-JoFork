"use client";
import { useState, useEffect } from "react";
import { AdminUser } from "./UserRegistry";

interface Props {
  guest: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guestId: string, data: any) => Promise<void>;
}

export default function ConvertGuestModal({ guest, isOpen, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (guest) {
      setFormData(prev => ({ ...prev, username: guest.username || "" }));
    }
  }, [guest]);

  if (!isOpen || !guest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(guest.id || guest.sub!, formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-neutral-900 border border-neutral-800 w-full max-w-[800px] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="flex flex-col md:flex-row">
          {/* Left Side: Context */}
          <div className="w-full md:w-[300px] bg-black/20 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-neutral-800">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
              Convert <span className="text-primary">Guest</span>
            </h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-[0.2em] mt-4 leading-relaxed">
              Elevating <span className="text-white font-bold">{guest.username}</span> from a temporary guest ID to a permanent registered account.
            </p>
            <div className="mt-8 pt-8 border-t border-neutral-800 hidden md:block">
              <div className="flex items-center gap-3 text-[9px] font-black text-neutral-600 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Permanent Profile
              </div>
              <div className="flex items-center gap-3 text-[9px] font-black text-neutral-600 uppercase tracking-widest mt-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Match History Sync
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text" required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full h-14 bg-black/40 border border-neutral-800 px-6 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email" required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-14 bg-black/40 border border-neutral-800 px-6 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="password" required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-14 bg-black/40 border border-neutral-800 px-6 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-primary text-background text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-125 hover:shadow-[0_0_30px_rgba(82,185,70,0.3)] active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? "Syncing..." : "Finalize Conversion"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-14 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
