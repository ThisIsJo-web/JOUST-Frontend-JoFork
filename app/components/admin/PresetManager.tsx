"use client";
import { useState, useEffect } from "react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";
import { TournamentFormat } from "../../tournaments/types";

interface Template {
  id: string;
  name: string;
  description?: string;
  system: TournamentFormat;
  config: any;
  isBuiltin: boolean;
  gameName?: string;
  createdAt: string;
}

export default function PresetManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [system, setSystem] = useState<TournamentFormat>("SINGLE_ELIMINATION");
  const [gameName, setGameName] = useState("");

  // Config fields
  const [winsToAdvance, setWinsToAdvance] = useState(1);
  const [bestOf, setBestOf] = useState(1);
  const [allowDraw, setAllowDraw] = useState(false);
  const [swissRounds, setSwissRounds] = useState(3);
  const [swissPointsWin, setSwissPointsWin] = useState(3);
  const [swissPointsDraw, setSwissPointsDraw] = useState(1);
  const [swissPointsLoss, setSwissPointsLoss] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(1);
  const [pointsPerSession, setPointsPerSession] = useState(0);
  const [pointsThreshold, setPointsThreshold] = useState(0);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.PRESETS.BASE);
      if (res.ok) {
        const data = await safeJson(res);
        setTemplates(data || []);
      }
    } catch (err) {
      setError("Failed to sync presets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name) return setError("Name is required");
    
    const config = {
      winsToAdvance,
      bestOf,
      allowDraw,
      swissRounds: system === "SWISS" ? swissRounds : null,
      swissPointsForWin: swissPointsWin,
      swissPointsForDraw: swissPointsDraw,
      swissPointsForLoss: swissPointsLoss,
      sessionsCount,
      pointsPerSession,
      pointsThreshold,
    };

    try {
      const res = await authenticatedFetch(API_ENDPOINTS.PRESETS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          system,
          config,
          gameName: gameName || null,
        })
      });

      if (res.ok) {
        setIsCreating(false);
        resetForm();
        fetchTemplates();
      } else {
        const data = await safeJson(res);
        setError(data?.message || "Creation failed");
      }
    } catch (err) {
      setError("Network error during preset deployment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Decommission this preset?")) return;
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.PRESETS.DELETE(id), {
        method: "DELETE"
      });
      if (res.ok) fetchTemplates();
    } catch (err) {
      setError("Failed to decommission preset");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSystem("SINGLE_ELIMINATION");
    setGameName("");
    setWinsToAdvance(1);
    setBestOf(1);
    setAllowDraw(false);
    setError("");
  };

  const labelCls = "text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block";
  const inputCls = "w-full bg-[#1B1B1B] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all cursor-pointer hover:bg-white/[0.02]";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Technical Presets</h3>
        <button 
          onClick={() => {
            if (isCreating) resetForm();
            setIsCreating(!isCreating);
          }}
          className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
        >
          {isCreating ? "CANCEL" : "+ CREATE PRESET"}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white/5 border border-white/10 p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>Preset Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Standard 1v1" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>System Engine</label>
              <select value={system} onChange={e => setSystem(e.target.value as any)} className={inputCls}>
                <option value="SINGLE_ELIMINATION" className="bg-[#1B1B1B] text-white">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION" className="bg-[#1B1B1B] text-white">Double Elimination</option>
                <option value="SWISS" className="bg-[#1B1B1B] text-white">Swiss System</option>
                <option value="ROUND_ROBIN" className="bg-[#1B1B1B] text-white">Round Robin</option>
                <option value="HYBRID" className="bg-[#1B1B1B] text-white">Top Cut (Multi-Phase)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Game Designation</label>
              <input 
                type="text" 
                value={gameName} 
                onChange={e => setGameName(e.target.value.toUpperCase())} 
                placeholder="e.g. BEYBLADE" 
                className={inputCls} 
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional technical details" className={inputCls} />
          </div>

          <div className={`space-y-8 transition-all duration-700 ${system === "HYBRID" ? "opacity-20 grayscale blur-sm pointer-events-none" : "opacity-100"}`}>
            <div className="grid grid-cols-3 gap-12 pt-4 border-t border-white/5">
              <div className="space-y-4">
                <div className="text-[9px] font-black text-white/10 uppercase tracking-widest border-b border-white/5 pb-2">Structure</div>
                <div>
                  <label className={labelCls}>Best of X</label>
                  <input type="number" value={bestOf} onChange={e => setBestOf(Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Wins to Advance</label>
                  <input type="number" value={winsToAdvance} onChange={e => setWinsToAdvance(Number(e.target.value))} className={inputCls} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[9px] font-black text-white/10 uppercase tracking-widest border-b border-white/5 pb-2">Scoring</div>
                <div>
                  <label className={labelCls}>Sessions</label>
                  <input type="number" value={sessionsCount} onChange={e => setSessionsCount(Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Points/Session</label>
                  <input type="number" value={pointsPerSession} onChange={e => setPointsPerSession(Number(e.target.value))} className={inputCls} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[9px] font-black text-white/10 uppercase tracking-widest border-b border-white/5 pb-2">Advanced</div>
                <div>
                  <label className={labelCls}>Points Threshold</label>
                  <input type="number" value={pointsThreshold} onChange={e => setPointsThreshold(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" id="allowDraw" checked={allowDraw} onChange={e => setAllowDraw(e.target.checked)} className="mr-2" />
                  <label htmlFor="allowDraw" className="text-[10px] font-black text-white/60 uppercase tracking-widest">Allow Draws</label>
                </div>
              </div>
            </div>

            {system === "SWISS" && (
              <div className="grid grid-cols-4 gap-6 pt-6 border-t border-white/5 bg-primary/5 -mx-8 px-8 py-6">
                <div>
                  <label className={labelCls}>Swiss Rounds</label>
                  <input type="number" value={swissRounds} onChange={e => setSwissRounds(Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Pts/Win</label>
                  <input type="number" value={swissPointsWin} onChange={e => setSwissPointsWin(Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Pts/Draw</label>
                  <input type="number" value={swissPointsDraw} onChange={e => setSwissPointsDraw(Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Pts/Loss</label>
                  <input type="number" value={swissPointsLoss} onChange={e => setSwissPointsLoss(Number(e.target.value))} className={inputCls} />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleCreate}
            className="w-full py-3 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 transition-all"
          >
            Deploy Preset Logic
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
          ERROR: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-[#1B1B1B] border border-white/5 p-6 group hover:border-white/20 transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden">
             {/* Diagonal accent */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-12 -translate-y-12" />
             
             <div>
               <div className="flex items-start justify-between mb-4">
                 <div>
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">{tpl.name}</h4>
                   <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.2em]">{tpl.system.replace(/_/g, " ")}</span>
                 </div>
                 <button onClick={() => handleDelete(tpl.id)} className="text-[10px] text-white/20 hover:text-red-500 transition-colors">✕</button>
               </div>
               
               <p className="text-[9px] text-white/40 leading-relaxed italic mb-4 line-clamp-2">
                 {tpl.description || "No technical specification provided."}
               </p>
             </div>

             <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Designation</span>
                    <span className="text-[8px] font-bold text-primary">{tpl.gameName || "GENERAL"}</span>
                  </div>
                 <div className="flex flex-col text-right">
                   <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">BoX</span>
                   <span className="text-[8px] font-bold text-white/60">Best of {tpl.config?.bestOf || 1}</span>
                 </div>
               </div>
          </div>
        ))}
      </div>
    </div>
  );
}
