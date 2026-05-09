export interface CardGame {
  id: string;
  name: string;
  description?: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  format: string;
  maxPlayers: number;
  prizePool: number | null;
  entranceFee: number | null;
  venue: string | null;
  date: string | null;
  inviteToken: string;
  isPrivate: boolean;
  status: string;
  guestCleanupAt: string | null;
  createdAt: string;
  createdById: string;
  createdBy?: {
    username: string;
  };
  cardGameId?: string;
  cardGame?: CardGame;
  participants: {
    id: string;
    userId: string;
    seed?: number;
    user: {
      id: string;
      username: string;
      email: string;
      guestName?: string;
      isGuest?: boolean;
    };
  }[];
  rounds?: {
    matches: {
      winner?: {
        username: string;
        isGuest?: boolean;
      };
    }[];
  }[];
  formatConfig?: FormatConfig;
  // Fields for UI that might not be in backend yet
  image?: string;
  color?: string;
  description?: string;
}

export interface FormatConfig {
  winsToAdvance?: number;
  swissRounds?: number;
  swissPointsForWin?: number;
  swissPointsForDraw?: number;
  swissPointsForLoss?: number;
  pointsThreshold?: number;
  sessionsCount?: number;
  pointsPerSession?: number;
  bestOf?: number;
  allowDraw?: boolean;
  tieBreakerOrder?: string[];
  progressionType?: string;
}

export interface FormatDefinition {
  id: string;
  label: string;
  description: string;
  configFields: Array<{
    key: string;
    label: string;
    placeholder: string;
    defaultValue?: number | null;
    min?: number;
    max?: number;
  }>;
}