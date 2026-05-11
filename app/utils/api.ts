// Prioritize the environment variable if it's an absolute URL, otherwise fallback to the proxy
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_URL = (envApiUrl && envApiUrl.startsWith('http')) 
  ? envApiUrl.replace(/\/$/, '') // Remove trailing slash
  : "/api/backend";

export async function safeJson(res: Response) {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Build the full URL, handling slashes carefully
  let fullUrl = url;
  if (!url.startsWith('http')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    fullUrl = `${API_URL}${cleanPath}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
    return response;
  } catch (error) {
    console.error("Critical Fetch Error:", {
      url: fullUrl,
      method: options.method || 'GET',
      error
    });
    // Return a fake response object to prevent "res is undefined" crashes
    return {
      ok: false,
      status: 0,
      statusText: "Network Error",
      json: async () => ({ message: "Connection to server lost. Check network connection." }),
      text: async () => "Network Error",
    } as Response;
  }
}

export const API_ENDPOINTS = {
  AUTH: {
    ME: '/auth/me',
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    USERS: '/auth/users',
    REGISTERED_USERS: '/auth/registered-users',
    ROLES: (id: string) => `/auth/roles/${id}`,
    CREATE_GUEST: '/auth/createguest',
    CONVERT_GUEST: (id: string) => `/auth/convert-guest/${id}`,
    DELETE_USER: (id: string) => `/auth/users/${id}`,
    UPDATE_PROFILE: (id: string) => `/auth/users/${id}/profile`,
    ADMIN_CREATE_USER: '/auth/users',
  },
  TOURNAMENTS: {
    BASE: '/tournaments',
    CREATE: '/tournaments/createtournament',
    START: (id: string) => `/tournaments/starttournament/${id}`,
    COMPLETE: (id: string) => `/tournaments/${id}/complete`,
    JOIN: (id: string) => `/tournaments/${id}/participants/join`,
    JOIN_GUEST: (id: string) => `/tournaments/${id}/participants/guest`,
    LEAVE: (id: string) => `/tournaments/${id}/participants/leave`,
    UPDATE_SEED: (tournamentId: string, userId: string) => `/tournaments/${tournamentId}/participants/${userId}/seed`,
    LEADERBOARD: (id: string) => `/tournaments/${id}/leaderboard`,
    GET_ONE: (id: string) => `/tournaments/${id}`,
    UPDATE_STATUS: (id: string) => `/tournaments/${id}/status`,
    GENERATE_BRACKET: (id: string) => `/tournaments/${id}/generate-bracket`,
    INVITE: (token: string) => `/tournaments/invite/${token}`,
    CANCEL_CLEANUP: (id: string) => `/tournaments/${id}/cancel-cleanup`,
    GLOBAL_LEADERBOARD: '/tournaments/leaderboard/global',
    USER_STATS: (userId: string) => `/tournaments/users/${userId}/stats`,
  },
  FORMATS: {
    BASE: '/formats',
    DETAILS: '/formats/details',
    DETAILS_BY_FORMAT: (format: string) => `/formats/details/${format}`,
  },
  CARD_GAMES: {
    LIST: '/card-games',
    CREATE: '/card-games',
  },
  MATCHES: {
    SUBMIT: (id: string) => `/matches/${id}/submit`,
    GET_ONE: (id: string) => `/matches/${id}`,
    BY_ROUND: (roundId: string) => `/matches/round/${roundId}`,
  },
  DEV: {
    BATCH_GUESTS: (tournamentId: string) => `/dev/batch-guests/${tournamentId}`,
    GUEST_EXPIRY: '/dev/config/guest-expiry',
    DELETE_TOURNAMENT: (id: string) => `/dev/tournament/${id}`,
  }
};