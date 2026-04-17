import type { SessionUser } from "../types";

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return window.atob(`${normalized}${padding}`);
};

export const parseAccessToken = (token: string): SessionUser | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload)) as SessionUser;
  } catch {
    return null;
  }
};
