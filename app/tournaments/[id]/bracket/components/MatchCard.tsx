import { Match, LeaderboardEntry } from "../types";

interface MatchCardProps {
  match: Match;
  onOpenScoring: () => void;
  isAdmin: boolean;
  isUpdating: boolean;
  leaderboard: LeaderboardEntry[];
  showPoints?: boolean;
  trackedUserId?: string | null;
}

export default function MatchCard({ 
  match, 
  onOpenScoring, 
  isAdmin, 
  isUpdating,
  leaderboard,
  showPoints,
  trackedUserId
}: MatchCardProps) {
  const p1Stats = leaderboard.find(l => l.userId === match.player1?.id);
  const p2Stats = leaderboard.find(l => l.userId === match.player2?.id);
  
  const isTracked = trackedUserId && (match.player1?.id === trackedUserId || match.player2?.id === trackedUserId);
  const canScore = isAdmin && !match.winnerId;

  const handleInteraction = (e: React.MouseEvent) => {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    if (canScore) {
        onOpenScoring();
    }
  };

  return (
    <div
      onClick={handleInteraction}
      className={`w-64 md:w-80 lg:w-96 flex flex-col shadow-2xl transition-all overflow-hidden relative group border-x border-y ${
        isTracked ? "border-purple-500 ring-2 ring-purple-500/20 scale-105 z-10" : "border-white/5"
      } ${isUpdating ? "opacity-50 pointer-events-none" : ""} cursor-pointer hover:border-primary/50`}
      style={{
        background: "linear-gradient(180deg, #2A2A2A 0%, #222222 100%)",
      }}
    >
      <ParticipantRow
        username={match.player1?.username || match.p1Name}
        isWinner={match.winnerId ? match.winnerId === match.player1?.id : (!!match.winnerName && match.winnerName === (match.player1?.username || match.p1Name))}
        points={showPoints ? p1Stats?.points : undefined}
        isTracked={trackedUserId === match.player1?.id}
      />
      <div className="h-[1px] bg-white/5 w-full" />
      <ParticipantRow
        username={match.player2?.username || match.p2Name}
        isWinner={match.winnerId ? match.winnerId === match.player2?.id : (!!match.winnerName && match.winnerName === (match.player2?.username || match.p2Name))}
        points={showPoints ? p2Stats?.points : undefined}
        isBye={match.isBye}
        isTracked={trackedUserId === match.player2?.id}
      />
      {canScore && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-primary uppercase tracking-[2px] bg-background px-4 py-2 border border-primary/50">Score Combat</span>
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
  isTracked
}: { 
  username?: string, 
  isWinner: boolean, 
  isBye?: boolean,
  points?: number,
  isTracked?: boolean
}) {
  return (
    <div
      className={`px-6 py-5 flex justify-between items-center transition-all ${isWinner ? "bg-primary" : ""} ${isTracked && !isWinner ? "bg-purple-500/10" : ""}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-[12px] md:text-sm font-black uppercase tracking-widest truncate ${isWinner ? "text-white" : username ? "text-foreground" : "text-foreground/20"}`}>
                {username || (isBye ? "BYE" : "TBD")}
            </span>
            {isTracked && (
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]" />
            )}
          </div>
          {points !== undefined && username && (
            <span className={`text-[8px] font-black uppercase tracking-tight ${isWinner ? "text-white/80" : "text-foreground/40"}`}>
              {points} PTS
            </span>
          )}
        </div>
      </div>
      {isWinner && (
        <span className="text-[10px] font-black text-white uppercase tracking-tighter">WINNER</span>
      )}
    </div>
  );
}
