"use client";
import { useState } from "react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";

const inputCls = "w-full h-12 bg-background border border-foreground/10 px-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all rounded-xl";

interface CardGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newGame: { id: string; name: string; description?: string | null }) => void;
}

export default function CardGameModal({ isOpen, onClose, onSuccess }: CardGameModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authenticatedFetch(API_ENDPOINTS.CARD_GAMES.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await safeJson(res);

      if (res.ok) {
        onSuccess(data);
        setName("");
        setDescription("");
        onClose();
      } else {
        setError(data?.message || "Failed to create card game");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-background border border-foreground/10 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 border-b border-foreground/10 pb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground font-poppins">Deploy Custom Game</h3>
          <button onClick={onClose} className="text-[10px] font-black uppercase text-foreground/40 hover:text-foreground tracking-widest font-poppins transition-colors">
            Close
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Game Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={inputCls} 
              placeholder="E.G. Yu-Gi-Oh!"
              required 
              minLength={3}
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className={`${inputCls} h-24 py-3 resize-none`} 
              placeholder="Briefly describe the game mechanics..."
              maxLength={250}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Register Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
