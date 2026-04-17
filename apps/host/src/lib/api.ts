import { clearSessionStorage, createSession, persistSession } from "./session";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, SessionState } from "../types";

const API_BASE_URL = "/api";

const request = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const contentType = response.headers.get("content-type") ?? "";

  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    if (typeof payload === "string" && payload.trim()) {
      throw new Error(payload);
    }

    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        throw new Error(message);
      }
    }

    throw new Error(`Запрос завершился с ошибкой (${response.status}).`);
  }

  return payload as T;
};

export const loginRequest = async (payload: LoginRequest): Promise<SessionState> => {
  const response = await request<LoginResponse>("/auth/login", {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const session = createSession(response.access_token, response.refresh_token);
  if (!session) {
    throw new Error("Сервер вернул некорректный access token.");
  }

  persistSession(session);
  return session;
};

export const registerRequest = async (payload: RegisterRequest) => {
  const response = await request<RegisterResponse>("/auth/register", {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (response.result !== 0) {
    throw new Error(
      response.result === 1
        ? "Пользователь с таким логином уже существует."
        : "Не удалось завершить регистрацию.",
    );
  }

  return loginRequest({
    password: payload.password,
    username: payload.username,
  });
};

export const logoutRequest = async (session: SessionState | null) => {
  if (!session?.refreshToken) {
    clearSessionStorage();
    return;
  }

  try {
    await request<void>("/auth/logout", {
      body: JSON.stringify({ token: session.refreshToken }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } finally {
    clearSessionStorage();
  }
};
