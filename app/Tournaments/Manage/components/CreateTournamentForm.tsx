"use client";
import { useState } from "react";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../../utils/api";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = date ? (startTime ? `${date}T${startTime}` : `${date}T00:00:00`) : null;

    const res = await authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, format,
        maxPlayers:  Number(maxPlayers),
        prizePool:   prizePool   === "" ? null : Number(prizePool),
        entranceFee: entranceFee === "" ? null : Number(entranceFee),
        venue, date: finalDate, isPrivate, startNow,
        createdById: userId,
      }),
    });

    if (res.ok) {
      onSuccess("Arena Initialized Successfully");
    } else {
      const data = await safeJson(res);
      onSuccess(`Error: ${data?.message || "Failed to create"}`);
    }
  };

  return (
    <div className="mb-12 bg-foreground/5 border border-primary/20 p-8 md:p-12 rounded-[2.5rem] animate-in fade-in zoom-in duration-500">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Field label="Arena Name">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="E.G. PRO LEAGUE" className={inputCls} required />
        </Field>
        <Field label="Combat Format">
          <select value={format} onChange={e => setFormat(e.target.value)} className={inputCls}>
            <option value="SINGLE_ELIMINATION">SINGLE ELIMINATION</option>
            <option value="DOUBLE_ELIMINATION">DOUBLE ELIMINATION</option>
            <option value="SWISS">SWISS</option>
            <option value="ROUND_ROBIN">ROUND ROBIN</option>
          </select>
        </Field>
        <Field label="Max Capacity">
          <input type="number" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} className={inputCls} required />
        </Field>
        <Field label="Prize Pool (₱)">
          <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value === "" ? "" : Number(e.target.value))} placeholder="OPTIONAL" className={inputCls} />
        </Field>
        <Field label="Arena Venue">
          <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="E.G. MADISON SQUARE" className={inputCls} />
        </Field>
        <Field label="Event Date">
          <input type="date" value={date} onChange={e => { setDate(e.target.value); if (e.target.value) setStartNow(false); }} className={inputCls} />
        </Field>
        <Field label="Start Time">
          <input type="time" value={startTime} onChange={e => { setStartTime(e.target.value); if (e.target.value) setStartNow(false); }} className={inputCls} />
        </Field>
        <Field label="Entrance Fee (₱)">
          <input type="number" value={entranceFee} onChange={e => setEntranceFee(e.target.value === "" ? "" : Number(e.target.value))} placeholder="OPTIONAL" className={inputCls} />
        </Field>

        <div className="flex flex-col gap-4 py-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-6 h-6 accent-primary bg-background border-foreground/10 rounded-lg" />
            <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest font-poppins group-hover:text-primary transition-colors">Private Arena</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={startNow} onChange={e => setStartNow(e.target.checked)} className="w-6 h-6 accent-green-500 bg-background border-foreground/10 rounded-lg" />
            <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest font-poppins group-hover:text-green-500 transition-colors">Start Now (Open Registration)</span>
          </label>
        </div>

        <div className="flex items-end gap-4">
          <button type="submit" className="flex-1 h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
            Initialize Arena
          </button>
          <button type="button" onClick={onDiscard} className="h-14 px-6 bg-foreground/5 text-foreground/40 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-foreground/10 transition-all">
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
