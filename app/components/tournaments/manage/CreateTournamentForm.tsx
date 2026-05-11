"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../utils/api";
import CardGameModal from "../CardGameModal";

const inputCls = "w-full h-11 bg-black border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all rounded-[4px] appearance-none placeholder:text-white/10";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between ml-0.5">
        <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{label}</label>
        {required && <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-50">(REQUIRED)</span>}
      </div>
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
  const [activeStep, setActiveStep] = useState<"IDENTITY" | "RULES" | "DEPLOYMENT">("IDENTITY");

  // IDENTITY
  const [name, setName] = useState("");
  const [format, setFormat] = useState("SINGLE_ELIMINATION");
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [cardGames, setCardGames] = useState<Array<{ id: string; name: string }>>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [selectedCardGameId, setSelectedCardGameId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // RULES
  const [bestOf, setBestOf] = useState(1);
  const [allowDraw, setAllowDraw] = useState(false);
  const [prizePool, setPrizePool] = useState<number | "">("");
  const [swissRounds, setSwissRounds] = useState(3);
  const [swissPointsWin, setSwissPointsWin] = useState(3);
  const [swissPointsDraw, setSwissPointsDraw] = useState(1);
  const [swissPointsLoss, setSwissPointsLoss] = useState(0);

  // DEPLOYMENT
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startNow, setStartNow] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(["IDENTITY"]));
  const [nameError, setNameError] = useState<string | null>(null);
  const [isValidatingName, setIsValidatingName] = useState(false);

  useEffect(() => {
    setVisitedSteps(prev => new Set(prev).add(activeStep));
  }, [activeStep]);

  useEffect(() => {
    if (!name) {
      setNameError(null);
      return;
    }

    setIsValidatingName(true);
    const timer = setTimeout(() => {
      const normalizedName = name.trim().toLowerCase();
      const isDuplicate = existingNames.some(n => n.toLowerCase() === normalizedName);

      if (name.length < 3) {
        setNameError("IDENTIFIER TOO SHORT (MIN 3 CHARS)");
      } else if (name.length > 60) {
        setNameError("IDENTIFIER TOO LONG (MAX 60 CHARS)");
      } else if (isDuplicate) {
        setNameError("IDENTIFIER ALREADY REGISTERED");
      } else {
        setNameError(null);
      }
      setIsValidatingName(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [name, existingNames]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [gamesRes, tournamentsRes] = await Promise.all([
        authenticatedFetch(API_ENDPOINTS.CARD_GAMES.LIST),
        authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE)
      ]);

      if (gamesRes.ok) {
        const data = await safeJson(gamesRes);
        setCardGames(data ?? []);
      }
      if (tournamentsRes.ok) {
        const data = await safeJson(tournamentsRes);
        setExistingNames(data?.map((t: any) => t.name) ?? []);
      }
    };
    loadInitialData();
  }, []);

  // Validation Checkers
  const isIdentityValid = !!(name && !nameError && selectedCardGameId && maxPlayers >= 2 && !isValidatingName);
  const isRulesValid = !!(bestOf >= 1);
  const isDeploymentValid = !!(startNow || date);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalDate = date ? (startTime ? `${date}T${startTime}` : `${date}T00:00:00`) : null;

    const formatConfig: any = {
      bestOf: Number(bestOf) || 1,
      allowDraw,
    };

    if (format === "SWISS") {
      formatConfig.swissRounds = Number(swissRounds) || 3;
      formatConfig.swissPointsForWin = Number(swissPointsWin);
      formatConfig.swissPointsForDraw = Number(swissPointsDraw);
      formatConfig.swissPointsForLoss = Number(swissPointsLoss);
    }

    const body = {
      name, format, maxPlayers: Number(maxPlayers),
      prizePool: prizePool === "" ? null : Number(prizePool),
      venue, date: finalDate, isPrivate, startNow,
      createdById: userId,
      ...(selectedCardGameId ? { cardGameId: selectedCardGameId } : {}),
      formatConfig
    };

    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) onSuccess("Tournament Created Successfully");
    else {
      const data = await safeJson(res);
      onSuccess(`Error: ${data?.message || "Failed to create"}`);
    }
  };

  const steps = [
    { id: "IDENTITY", label: "01. IDENTITY", valid: isIdentityValid && visitedSteps.has("IDENTITY") },
    { id: "RULES", label: "02. RULE ENGINE", valid: isRulesValid && visitedSteps.has("RULES") },
    { id: "DEPLOYMENT", label: "03. DEPLOYMENT", valid: isDeploymentValid && visitedSteps.has("DEPLOYMENT") },
  ] as const;

  return (
    <div className="flex gap-24 min-h-[600px] -ml-2">
      {/* AUTHENTIC PROCESS SIDEBAR */}
      <aside className="w-48 flex flex-col pt-4 shrink-0">
        <div className="relative flex flex-col gap-16">
          {/* Connecting Track */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/5" />
          
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className="group relative flex items-start gap-6 text-left transition-all"
            >
              {/* Dot Indicator */}
              <div className={`mt-1.5 w-4 h-4 rounded-full border-2 z-10 transition-all duration-500 shadow-lg ${
                step.valid 
                  ? "bg-primary border-primary shadow-primary/20 scale-110" 
                  : activeStep === step.id
                    ? "bg-white border-white shadow-white/20 scale-110"
                    : "bg-black border-white/10"
              }`} />

              <div className="flex flex-col gap-1">
                <span className={`text-[8px] font-black tracking-[0.4em] transition-all ${
                  step.valid ? "text-primary" : "text-white/20"
                }`}>
                  {step.valid ? "VALIDATED" : "PENDING"}
                </span>
                <span className={`text-xs font-bold uppercase tracking-widest transition-all ${
                  activeStep === step.id ? "text-white" : "text-white/40 group-hover:text-white/60"
                }`}>
                  {step.label.split(". ")[1]}
                </span>
              </div>

              {/* Active Highlight Glow */}
              {activeStep === step.id && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-primary/5 rounded-full blur-3xl -z-10" />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* CONFIGURATION AREA */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        {/* Main Operational Block */}
        <div className="flex-1 bg-black/40 border border-white/5 p-12 rounded-[4px] relative overflow-hidden flex flex-col">
          {/* Technical Corner Greebles */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10" />

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {activeStep === "IDENTITY" && (
                  <motion.section 
                    key="identity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    {/* Row 1: Select Card Game */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Select Card Game</h3>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                      
                      <div className="relative overflow-hidden group/matrix">
                        <motion.div 
                          drag="x"
                          dragConstraints={{ 
                            right: 0, 
                            left: Math.min(0, -(cardGames.length * 216 - 800))
                          }}
                          dragElastic={0.05}
                          className="flex gap-4 cursor-grab active:cursor-grabbing pb-2"
                        >
                          {cardGames.map((game) => (
                            <button
                              key={game.id}
                              type="button"
                              onClick={() => setSelectedCardGameId(game.id)}
                              className={`p-4 border transition-all rounded-[4px] text-left relative overflow-hidden h-20 min-w-[200px] flex flex-col justify-end shrink-0 ${
                                selectedCardGameId === game.id 
                                  ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                                  : "bg-black/40 border-white/5 hover:border-white/10"
                              }`}
                            >
                              <div className={`text-[10px] font-black uppercase tracking-tighter ${
                                selectedCardGameId === game.id ? "text-primary" : "text-white"
                              }`}>{game.name}</div>
                              {selectedCardGameId === game.id && (
                                <div className="absolute top-3 right-3 text-[7px] font-black text-primary tracking-[0.2em]">VALIDATED</div>
                              )}
                            </button>
                          ))}
                        </motion.div>
                        <div className="absolute right-0 top-0 bottom-2 w-24 bg-gradient-to-l from-[#1B1B1B] to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {!selectedCardGameId ? (
                              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[4px]">
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Please select a game above...</div>
                              </div>
                            ) : (
                              <div className="space-y-12 animate-in fade-in duration-700">
                                {/* Format Selection */}
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Format Selection</h3>
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                    <Field label="Deployment Format" required>
                                      <select 
                                        value={format} 
                                        onChange={e => setFormat(e.target.value)} 
                                        className={inputCls}
                                      >
                                        <option value="" className="bg-black text-white/20">Select Protocol</option>
                                        <option value="SINGLE_ELIMINATION" className="bg-black">SINGLE ELIMINATION</option>
                                        <option value="DOUBLE_ELIMINATION" className="bg-black">DOUBLE ELIMINATION</option>
                                        <option value="SWISS" className="bg-black">SWISS</option>
                                        <option value="ROUND_ROBIN" className="bg-black">ROUND ROBIN</option>
                                      </select>
                                    </Field>
                                  </div>
                                </div>

                                {/* Tournament Information */}
                                {format && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                  >
                                    <div className="flex items-center gap-4">
                                      <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Tournament Information</h3>
                                      <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                        <Field label="Tournament Name" required>
                                          <input 
                                            type="text" 
                                            value={name} 
                                            onChange={e => setName(e.target.value)} 
                                            placeholder="PRO LEAGUE SEASON 1" 
                                            className={`${inputCls} ${nameError ? "border-red-500/50" : ""}`} 
                                            required 
                                          />
                                        </Field>
                                        <AnimatePresence>
                                          {nameError && (
                                            <motion.div 
                                              key="name-error"
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: "auto" }}
                                              exit={{ opacity: 0, height: 0 }}
                                              className="text-[9px] font-black text-red-500 uppercase tracking-widest pl-1"
                                            >
                                              {nameError}
                                            </motion.div>
                                          )}
                                          {isValidatingName && (
                                            <motion.div 
                                              key="validating"
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              className="text-[9px] font-black text-primary/40 uppercase tracking-widest pl-1 animate-pulse"
                                            >
                                              Validating Identifier...
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                      <Field label="Player Capacity" required>
                                        <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} className={inputCls} required />
                                      </Field>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </motion.section>
                        )}

              {activeStep === "RULES" && (
                <motion.section 
                  key="rules"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Match Parameters</h3>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Match Intensity (Best Of)">
                      <input type="number" value={bestOf} onChange={e => setBestOf(Number(e.target.value))} min={1} className={inputCls} />
                    </Field>
                    <Field label="Prize Pool">
                      <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0.00" className={inputCls} />
                    </Field>
                    <Field label="Allow Draws">
                      <select value={allowDraw ? "YES" : "NO"} onChange={e => setAllowDraw(e.target.value === "YES")} className={inputCls}>
                        <option value="NO" className="bg-black">NO (FORCE WIN)</option>
                        <option value="YES" className="bg-black">YES (PERMIT DRAW)</option>
                      </select>
                    </Field>
                    {format === "SWISS" && (
                      <Field label="Total Swiss Rounds">
                        <input type="number" value={swissRounds} onChange={e => setSwissRounds(Number(e.target.value))} className={inputCls} />
                      </Field>
                    )}
                  </div>
                </motion.section>
              )}

              {activeStep === "DEPLOYMENT" && (
                <motion.section 
                  key="deployment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Scheduling & Visibility</h3>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Venue">
                      <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Arena / Online" className={inputCls} />
                    </Field>
                    <Field label="Deployment Mode">
                      <select value={startNow ? "IMMEDIATE" : "SCHEDULED"} onChange={e => setStartNow(e.target.value === "IMMEDIATE")} className={inputCls}>
                        <option value="SCHEDULED" className="bg-black">SCHEDULED</option>
                        <option value="IMMEDIATE" className="bg-black">IMMEDIATE</option>
                      </select>
                    </Field>
                    {!startNow && (
                      <>
                        <Field label="Schedule Date">
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Schedule Time">
                          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
                        </Field>
                      </>
                    )}
                    <Field label="Access Control">
                      <select value={isPrivate ? "PRIVATE" : "PUBLIC"} onChange={e => setIsPrivate(e.target.value === "PRIVATE")} className={inputCls}>
                        <option value="PUBLIC" className="bg-black">PUBLIC</option>
                        <option value="PRIVATE" className="bg-black">PRIVATE</option>
                      </select>
                    </Field>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* STEPPER ACTIONS */}
          <div className="pt-10 flex items-center justify-between border-t border-white/5">
            <button 
              type="button" 
              onClick={onDiscard} 
              className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.3em] transition-all"
            >
              Discard Changes
            </button>
            
            <div className="flex gap-4">
              {activeStep !== "IDENTITY" && (
                <button 
                  type="button" 
                  onClick={() => setActiveStep(activeStep === "DEPLOYMENT" ? "RULES" : "IDENTITY")}
                  className="px-8 py-3 bg-white/5 text-white/40 font-bold text-[10px] uppercase tracking-widest rounded-[4px] hover:bg-white/10"
                >
                  Back
                </button>
              )}
              
              {activeStep !== "DEPLOYMENT" ? (
                <button 
                  type="button" 
                  onClick={() => setActiveStep(activeStep === "IDENTITY" ? "RULES" : "DEPLOYMENT")}
                  disabled={!steps.find(s => s.id === activeStep)?.valid}
                  className="px-10 py-3 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-[4px] hover:brightness-110 transition-all disabled:opacity-20 disabled:grayscale"
                >
                  Proceed
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={!isIdentityValid || !isRulesValid || !isDeploymentValid}
                  className="px-10 py-3 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-[4px] hover:brightness-110 transition-all disabled:opacity-20 disabled:grayscale"
                >
                  Create Tournament
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>

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
