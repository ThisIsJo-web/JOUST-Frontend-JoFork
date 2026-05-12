import { Tournament } from "../../types";

export interface Match {
  id: string;
  player1: { id: string; username: string; isGuest?: boolean } | null;
  player2: { id: string; username: string; isGuest?: boolean } | null;
  winnerId?: string | null;
  winner?: { id: string; username: string; isGuest?: boolean } | null;
  p1Name?: string | null;
  p2Name?: string | null;
  winnerName?: string | null;
  status: string;
  roundId: string;
  isBye: boolean;
  nextMatchId?: string | null;
}

export interface Round {
  id: string;
  roundNumber: number;
  matches: Match[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  isGuest?: boolean;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
  omw: number;
  oomw: number;
}
