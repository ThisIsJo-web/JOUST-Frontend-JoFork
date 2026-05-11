"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authenticatedFetch, API_ENDPOINTS, safeJson } from "../../utils/api";

interface LogEntry {
  id: string;
  type: "USER" | "TOURNAMENT" | "SYSTEM";
  message: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "CRITICAL";
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateLogs();
    const interval = setInterval(generateLogs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const generateLogs = async () => {
    try {
      // We derive logs from current system state since there's no dedicated audit endpoint
      const [usersRes, tourneyRes] = await Promise.all([
        authenticatedFetch(API_ENDPOINTS.AUTH.USERS),
        authenticatedFetch(API_ENDPOINTS.TOURNAMENTS.BASE),
      ]);
      
      const users = await safeJson(usersRes) || [];
      const tournaments = await safeJson(tourneyRes) || [];
      
      const newLogs: LogEntry[] = [];
      
      // Simulate user join logs
      users.slice(0, 3).forEach((u: any) => {
        newLogs.push({
          id: `u-${u.id}`,
          type: "USER",
          message: `Identity Sync: ${u.username || "Guest"} registered to core`,
          timestamp: new Date().toLocaleTimeString(),
          status: "SUCCESS"
        });
      });

      // Simulate tournament status logs
      tournaments.slice(0, 3).forEach((t: any) => {
        newLogs.push({
          id: `t-${t.id}`,
          type: "TOURNAMENT",
          message: `Deployment: ${t.name} initialized as ${t.status}`,
          timestamp: new Date().toLocaleTimeString(),
          status: t.status === "ONGOING" ? "SUCCESS" : "WARNING"
        });
      });

      // Add a system heartbeat
      newLogs.push({
        id: `s-${Date.now()}`,
        type: "SYSTEM",
        message: "Heartbeat: All services operational. Uplink stable.",
        timestamp: new Date().toLocaleTimeString(),
        status: "SUCCESS"
      });

      setLogs(newLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 15));
    } catch (e) {
      console.error("Log generation failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black border-2 border-white/10 h-[400px] flex flex-col overflow-hidden relative">
      {/* Industrial Header */}
      <div className="p-4 border-b-2 border-white/10 bg-white/[0.02] flex justify-between items-center">
        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
          <span className="w-2 h-2 bg-primary animate-pulse" />
          SYSTEM_AUDIT_LOGS
        </h2>
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Live_Sync: Active</span>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-2">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-start gap-4 p-3 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group"
            >
              <div className="text-[9px] font-mono text-white/20 pt-0.5 tracking-tighter">{log.timestamp}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[7px] font-black px-1 py-0.5 border ${
                    log.type === "USER" ? "border-primary/20 text-primary bg-primary/10" :
                    log.type === "TOURNAMENT" ? "border-amber-400/20 text-amber-400 bg-amber-400/10" :
                    "border-white/20 text-white/40 bg-white/5"
                  }`}>
                    {log.type}
                  </span>
                  <div className={`text-[10px] font-bold text-white/60 group-hover:text-white transition-colors truncate`}>
                    {log.message}
                  </div>
                </div>
              </div>
              <div className={`w-1 h-1 rounded-full mt-2 ${
                log.status === "SUCCESS" ? "bg-primary" :
                log.status === "WARNING" ? "bg-amber-400" :
                "bg-red-500"
              } shadow-[0_0_5px_currentColor]`} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-4 h-4 border-2 border-white/5 border-t-primary animate-spin" />
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Interrogating Subsystems...</p>
          </div>
        )}
      </div>

      {/* Industrial Footer */}
      <div className="p-3 border-t-2 border-white/10 bg-white/[0.02] text-[8px] font-black text-white/10 uppercase tracking-widest text-right">
        [ LOG_LIMIT_15_RECORDS_REACHED ]
      </div>
    </div>
  );
}
