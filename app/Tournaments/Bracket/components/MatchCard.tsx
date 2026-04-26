import { Match, LeaderboardEntry } from "../types";

interface MatchCardProps {
  match: Match;
  onOpenScoring: () => void;
  isAdmin: boolean;
  isUpdating: boolean;
  leaderboard: LeaderboardEntry[];
  showPoints?: boolean;
}

export default function MatchCard({ 
  match, 
  onOpenScoring, 
  isAdmin, 
  isUpdating,
  leaderboard,
  showPoints
}: MatchCardProps) {
  const isByeMatch = match.player1 !== null && match.player2 === null;
  const p1Stats = leaderboard.find(l => l.userId === match.player1?.id);
  const p2Stats = leaderboard.find(l => l.userId === match.player2?.id);
  
  const canScore = isAdmin && !match.winnerId && match.player1 && match.player2;

  return (
    <div
      onClick={canScore ? onOpenScoring : undefined}
      className={`w-52 flex flex-col rounded-2xl shadow-xl transition-all overflow-hidden relative group ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      } ${canScore ? "cursor-pointer hover:border-primary/50 border-2 border-transparent" : "border-2 border-foreground/5"}`}
      style={{
        background: "var(--background)",
      }}
    >
      <ParticipantRow
        username={match.player1?.username}
        isWinner={match.winnerId === match.player1?.id}
        points={showPoints ? p1Stats?.points : undefined}
      />
      <div className="h-[1px] bg-foreground/5 w-full" />
      <ParticipantRow
        username={match.player2?.username}
        isWinner={match.winnerId === match.player2?.id}
        points={showPoints ? p2Stats?.points : undefined}
        isBye={isByeMatch}
      />
      {canScore && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-black text-primary uppercase tracking-[2px] bg-background px-3 py-1 rounded-full border border-primary/50">Score Match</span>
        </div>
      )}
    </div>
  );
}

function ParticipantRow({ 
  username, 
  isWinner, 
  isBye,
  points,
}: { 
  username?: string, 
  isWinner: boolean, 
  isBye?: boolean,
  points?: number,
}) {
  return (
    <div
      className={`px-4 py-3 flex justify-between items-center transition-all ${isWinner ? "bg-primary/5" : ""}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {isWinner && <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 shadow-[0_0_8px_var(--color-primary)]" />}
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest truncate ${username ? (isWinner ? "text-primary" : "text-foreground") : "text-foreground/20"}`}>
            {username || (isBye ? "BYE" : "TBD")}
          </span>
          {points !== undefined && username && (
            <span className="text-[7px] text-foreground/40 font-black uppercase tracking-tight">
              {points} PTS
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
