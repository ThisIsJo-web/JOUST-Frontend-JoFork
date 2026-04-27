const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Build full URL if only endpoint is provided
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  
  // Ensure credentials are still included for cookie support
  return fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });
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
  },
  TOURNAMENTS: {
    BASE: '/tournaments',
    CREATE: '/tournaments/createtournament',
    START: (id: string) => `/tournaments/starttournament/${id}`,
    COMPLETE: (id: string) => `/tournaments/${id}/complete`,
    JOIN: (id: string) => `/tournaments/${id}/participants/join`,
    JOIN_GUEST: (id: string) => `/tournaments/${id}/participants/guest`,
    LEAVE: (id: string) => `/tournaments/${id}/participants/leave`,
    LEADERBOARD: (id: string) => `/tournaments/${id}/leaderboard`,
    GET_ONE: (id: string) => `/tournaments/${id}`,
    INVITE: (token: string) => `/tournaments/invite/${token}`,
    GLOBAL_LEADERBOARD: '/tournaments/leaderboard/global',
  },
  MATCHES: {
    SUBMIT: (id: string) => `/matches/${id}/submit`,
    GET_ONE: (id: string) => `/matches/${id}`,
    BY_ROUND: (roundId: string) => `/matches/round/${roundId}`,
  }
};