export interface Tournament {
  id: string;
  name: string;
  format: string;
  maxPlayers: number;
  prizePool: number | null;
  isPrivate: boolean;
  status: string;
  createdAt: string;
  createdById: string;
  createdBy?: {
    username: string;
  };
  participants: {
    id: string;
    userId: string;
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
        guestName?: string;
        isGuest?: boolean;
      };
    }[];
  }[];
  // Fields for UI that might not be in backend yet
  image?: string;
  color?: string;
  description?: string;
}