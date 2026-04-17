export type UserRole = "P" | "D" | "A";
export type Gender = "M" | "F";

export interface SessionUser {
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  ver: number;
}

export interface SessionState {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  birth_date: string;
  email: string;
  first_name: string;
  gender: Gender;
  last_name: string;
  password: string;
  patronymic: string | null;
  phone: string | null;
  username: string;
}

export interface RegisterResponse {
  result: number;
  userId: string | null;
}
