import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearSessionStorage, loadSession, persistSession } from "../lib/session";
import type { SessionState } from "../types";

export type AuthState = {
  session: SessionState | null;
};

const initialState: AuthState = {
  session: loadSession(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearCredentials(state) {
      state.session = null;
      clearSessionStorage();
    },
    setCredentials(state, action: PayloadAction<SessionState>) {
      state.session = action.payload;
      persistSession(action.payload);
    },
  },
});

export const { clearCredentials, setCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
