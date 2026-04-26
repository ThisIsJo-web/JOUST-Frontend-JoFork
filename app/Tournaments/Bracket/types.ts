import { Tournament } from "../types";

export interface Match {
  id: string;
  player1: { id: string; username: string } | null;
  player2: { id: string; username: string } | null;
  winnerId?: string | null;
  winner?: { id: string; username: string } | null;
  status: string;
  roundId: string;
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
  points: number;
  wins: number;
  losses: number;
  draws: number;
  matchWinPct: number;
  omw: number;
  oomw: number;
}
