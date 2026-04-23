import { parseAccessToken } from "./jwt";
import type { SessionState } from "../types";

const STORAGE_KEY = "trauma-team-session";

export const loadSession = (): SessionState | null => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionState;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const createSession = (accessToken: string, refreshToken: string): SessionState | null => {
  const user = parseAccessToken(accessToken);
  if (!user) return null;

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const persistSession = (session: SessionState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSessionStorage = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
