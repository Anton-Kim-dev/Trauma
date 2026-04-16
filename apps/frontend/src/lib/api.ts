import { createSession } from "./session";
import type { ApiClient, SessionState } from "../types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retryOnAuth?: boolean;
  skipAuth?: boolean;
};

type SessionBridge = {
  clear: () => void;
  get: () => SessionState | null;
  save: (session: SessionState) => void;
};

const joinUrl = (baseUrl: string, path: string) => {
  const left = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const right = path.startsWith("/") ? path : `/${path}`;
  return `${left}${right}`;
};

const parseResponse = async (response: Response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const extractMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "string" && payload.trim()) {
    const text = payload.trim();
    if (/<!doctype html|<html|<body|<pre>/i.test(text)) return fallback;
    if (/^bad request$/i.test(text)) return fallback;
    if (/^invalid username or password$/i.test(text)) return fallback;
    return text;
  }

  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && /^invalid username or password$/i.test(message.trim())) return fallback;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
};

const fallbackMessageForStatus = (status: number) => {
  if (status === 400) return "Проверьте корректность введенных данных.";
  if (status === 401) return "Неверный логин или пароль.";
  return `Запрос завершился ошибкой (${status}).`;
};

export const createApiClient = (baseUrl: string, sessionBridge: SessionBridge): ApiClient => {
  const refreshAccessToken = async () => {
    const session = sessionBridge.get();
    if (!session?.refreshToken) {
      sessionBridge.clear();
      return null;
    }

    const response = await fetch(joinUrl(baseUrl, "/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: session.refreshToken }),
    });

    if (!response.ok) {
      sessionBridge.clear();
      return null;
    }

    const payload = (await parseResponse(response)) as { access_token?: string } | null;
    if (!payload?.access_token) {
      sessionBridge.clear();
      return null;
    }

    const nextSession = createSession(payload.access_token, session.refreshToken);
    if (!nextSession) {
      sessionBridge.clear();
      return null;
    }

    sessionBridge.save(nextSession);
    return nextSession.accessToken;
  };

  const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { retryOnAuth = true, skipAuth = false, headers, body, ...rest } = options;
    const session = sessionBridge.get();
    const nextHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    };

    if (!skipAuth && session?.accessToken) {
      nextHeaders.Authorization = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(joinUrl(baseUrl, path), {
      ...rest,
      headers: nextHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && retryOnAuth && !skipAuth && session?.refreshToken) {
      const refreshedAccessToken = await refreshAccessToken();
      if (refreshedAccessToken) {
        return request<T>(path, {
          ...options,
          retryOnAuth: false,
        });
      }
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(extractMessage(payload, fallbackMessageForStatus(response.status)), response.status, payload);
    }

    return payload as T;
  };

  return {
    get: <T>(path: string, init?: RequestOptions) =>
      request<T>(path, {
        ...init,
        method: "GET",
      }),
    post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
      request<T>(path, {
        ...init,
        method: "POST",
        body,
      }),
  };
};
