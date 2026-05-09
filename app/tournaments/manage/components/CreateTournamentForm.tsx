"use client";
import { useState, useEffect } from "react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../utils/api";
import CardGameModal from "../../components/CardGameModal";

const inputCls = "w-full h-14 bg-background border border-foreground/10 px-6 text-sm text-foreground focus:outline-none focus:border-primary transition-all rounded-xl appearance-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 font-poppins">{label}</label>
      {children}
    </div>
  );
}

interface Props {
  userId: string;
  onSuccess: (message: string) => void;
  onDiscard: () => void;
}

export default function CreateTournamentForm({ userId, onSuccess, onDiscard }: Props) {
  const [name, setName]               = useState("");
  const [format, setFormat]           = useState("SINGLE_ELIMINATION");
  const [maxPlayers, setMaxPlayers]   = useState(16);
  const [prizePool, setPrizePool]     = useState<number | "">("");
  const [entranceFee, setEntranceFee] = useState<number | "">("");
  const [venue, setVenue]             = useState("");
  const [date, setDate]               = useState("");
  const [startTime, setStartTime]     = useState("");
  const [startNow, setStartNow]       = useState(true);
  const [isPrivate, setIsPrivate]     = useState(false);
  const [cardGames, setCardGames]     = useState<Array<{ id: string; name: string; description?: string | null }>>([]);
  const [selectedCardGameId, setSelectedCardGameId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Config State
  const [bestOf, setBestOf]                       = useState(1);
  const [pointsThreshold, setPointsThreshold]     = useState(0);
  const [sessionsCount, setSessionsCount]         = useState(1);
  const [allowDraw, setAllowDraw]                 = useState(false);
  const [winsToAdvance, setWinsToAdvance]         = useState(1);
  const [swissRounds, setSwissRounds]             = useState(3);
  const [swissPointsWin, setSwissPointsWin]       = useState(3);
  const [swissPointsDraw, setSwissPointsDraw]     = useState(1);
  const [swissPointsLoss, setSwissPointsLoss]     = useState(0);

  const loadCardGames = async () => {
    const res = await authenticatedFetch(API_ENDPOINTS.CARD_GAMES.LIST);
    if (res.ok) {
      const data = await safeJson(res);
      setCardGames(data ?? []);
    }
  };

  useEffect(() => {
    loadCardGames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = date ? (startTime ? `${date}T${startTime}` : `${date}T00:00:00`) : null;

    const body = {
      name,
      format,
      maxPlayers: Number(maxPlayers),
      prizePool: prizePool === "" ? null : Number(prizePool),
      entranceFee: entranceFee === "" ? null : Number(entranceFee),
      venue,
      date: finalDate,
      isPrivate,
      startNow,
      createdById: userId,
      ...(selectedCardGameId ? { cardGameId: selectedCardGameId } : {}),
      formatConfig: {
        bestOf: Number(bestOf),
        pointsThreshold: Number(pointsThreshold),
        sessionsCount: Number(sessionsCount),
        allowDraw,
        winsToAdvance: Number(winsToAdvance),
        ...(format === "SWISS" ? {
          swissRounds: Number(swissRounds),
          swissPointsForWin: Number(swissPointsWin),
          swissPointsForDraw: Number(swissPointsDraw),
          swissPointsForLoss: Number(swissPointsLoss),
        } : {})
      }
    };

    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess("Arena Initialized Successfully");
    } else {
      const data = await safeJson(res);
      onSuccess(`Error: ${data?.message || "Failed to create"}`);
    }
  };

  return (
    <div className="mb-12 bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-10 md:p-16 rounded-[3rem] animate-in fade-in zoom-in duration-700">
      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Step 1: Card Game Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/[0.05]">
          <div className="max-w-md">
            <h3 className="text-xl md:text-2xl font-black text-foreground font-poppins tracking-tight mb-2">Initialize Combat Zone</h3>
            <p className="text-xs text-foreground/40 font-questrial leading-relaxed">Select the core card game to unlock full terminal configuration.</p>
          </div>
          
          <div className="flex-1 max-w-sm flex gap-3">
            <div className="relative flex-1 group">
              <select 
                value={selectedCardGameId} 
                onChange={e => setSelectedCardGameId(e.target.value)} 
                className={`${inputCls} !h-16 !px-8 !bg-primary/[0.03] !border-primary/20 focus:!border-primary/60 !text-primary font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/5 transition-all group-hover:scale-[1.02]`}
              >
                <option value="" className="bg-background text-foreground/60">Select Game</option>
                {cardGames.map((game) => (
                  <option key={game.id} value={game.id} className="bg-background text-foreground font-black">{game.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)}
              className="h-16 w-16 flex items-center justify-center bg-primary text-white rounded-2xl hover:brightness-110 active:scale-90 transition-all text-2xl font-light shadow-xl shadow-primary/30"
              title="Add Custom Game"
            >
              +
            </button>
          </div>
        </div>

        {/* Locked Details Section */}
        <div className={`space-y-12 transition-all duration-700 ${!selectedCardGameId ? "opacity-10 grayscale blur-sm pointer-events-none translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            <Field label="Arena Designation">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="E.G. CHAMPIONSHIP ALPHA" className={`${inputCls} bg-transparent border-white/10 hover:border-white/20`} required />
            </Field>
            <Field label="Combat Format">
              <select value={format} onChange={e => setFormat(e.target.value)} className={`${inputCls} bg-transparent border-white/10 hover:border-white/20`}>
                <option value="SINGLE_ELIMINATION" className="bg-background">SINGLE ELIMINATION</option>
                <option value="DOUBLE_ELIMINATION" className="bg-background">DOUBLE ELIMINATION</option>
                <option value="SWISS" className="bg-background">SWISS</option>
                <option value="ROUND_ROBIN" className="bg-background">ROUND ROBIN</option>
              </select>
            </Field>
            <Field label="Max Capacity">
              <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} className={`${inputCls} bg-transparent border-white/10 hover:border-white/20`} required />
            </Field>
            <Field label="Prize Pool (₱)">
              <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0.00" className={`${inputCls} bg-transparent border-white/10 hover:border-white/20`} />
            </Field>
            <Field label="Arena Venue">
              <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="E.G. VIRTUAL STADIUM" className={`${inputCls} bg-transparent border-white/10 hover:border-white/20`} />
            </Field>
            <Field label="Operational Date">
              <div className="flex gap-2">
                <input type="date" value={date} onChange={e => { setDate(e.target.value); if (e.target.value) setStartNow(false); }} className={`${inputCls} bg-transparent border-white/10 hover:border-white/20 flex-1`} />
                <input type="time" value={startTime} onChange={e => { setStartTime(e.target.value); if (e.target.value) setStartNow(false); }} className={`${inputCls} bg-transparent border-white/10 hover:border-white/20 w-32`} />
              </div>
            </Field>
          </div>

          {/* Advanced Configuration Toggle */}
          <div className="pt-8">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest hover:brightness-110 transition-all"
            >
              <span>{showAdvanced ? "[-]" : "[+]"} Advanced Configuration</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 border border-white/5 bg-white/[0.01] rounded-3xl animate-in slide-in-from-top-4 duration-500">
                <Field label="Match Intensity (Best Of)">
                   <input type="number" value={bestOf} onChange={e => setBestOf(Number(e.target.value))} min={1} step={2} className={`${inputCls} !h-12`} />
                </Field>
                <Field label="Play Days (Duration)">
                   <input type="number" value={sessionsCount} onChange={e => setSessionsCount(Number(e.target.value))} min={1} className={`${inputCls} !h-12`} />
                </Field>
                <Field label="Victory Score (Threshold)">
                   <input type="number" value={pointsThreshold} onChange={e => setPointsThreshold(Number(e.target.value))} min={0} className={`${inputCls} !h-12`} />
                </Field>
                <Field label="Allow Draws">
                  <div className="h-12 flex items-center">
                    <input type="checkbox" checked={allowDraw} onChange={e => setAllowDraw(e.target.checked)} className="w-5 h-5 rounded bg-background border border-white/10 text-primary focus:ring-primary" />
                  </div>
                </Field>

                {(format === "SINGLE_ELIMINATION" || format === "DOUBLE_ELIMINATION") && (
                  <Field label="Wins to Advance">
                    <input type="number" value={winsToAdvance} onChange={e => setWinsToAdvance(Number(e.target.value))} min={1} className={`${inputCls} !h-12`} />
                  </Field>
                )}

                {format === "SWISS" && (
                  <>
                    <Field label="Swiss Rounds">
                      <input type="number" value={swissRounds} onChange={e => setSwissRounds(Number(e.target.value))} min={1} className={`${inputCls} !h-12`} />
                    </Field>
                    <Field label="Points: Win">
                      <input type="number" value={swissPointsWin} onChange={e => setSwissPointsWin(Number(e.target.value))} className={`${inputCls} !h-12`} />
                    </Field>
                    <Field label="Points: Draw">
                      <input type="number" value={swissPointsDraw} onChange={e => setSwissPointsDraw(Number(e.target.value))} className={`${inputCls} !h-12`} />
                    </Field>
                    <Field label="Points: Loss">
                      <input type="number" value={swissPointsLoss} onChange={e => setSwissPointsLoss(Number(e.target.value))} className={`${inputCls} !h-12`} />
                    </Field>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-white/[0.05]">
            <div className="flex gap-12">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center transition-all group-hover:border-primary ${isPrivate ? "bg-primary border-primary shadow-lg shadow-primary/20" : ""}`}>
                  {isPrivate && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>}
                </div>
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="hidden" />
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">Private Mode</span>
              </label>
              
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center transition-all group-hover:border-green-500 ${startNow ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/20" : ""}`}>
                  {startNow && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>}
                </div>
                <input type="checkbox" checked={startNow} onChange={e => setStartNow(e.target.checked)} className="hidden" />
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">Immediate Deployment</span>
              </label>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button type="button" onClick={onDiscard} className="px-10 py-5 bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 hover:text-foreground transition-all">
                Discard
              </button>
              <button type="submit" className="flex-1 md:flex-none md:px-16 h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/20">
                Initialize Arena
              </button>
            </div>
          </div>
        </div>
      </form>

      <CardGameModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(newGame) => {
          setCardGames(prev => [...prev, newGame]);
          setSelectedCardGameId(newGame.id);
        }}
      />
    </div>
  );
}
