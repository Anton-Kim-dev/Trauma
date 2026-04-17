import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { RootStore } from "./rootStore";

const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider = ({ children, store }: { children: ReactNode; store: RootStore }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export const useRootStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreProvider is not configured.");
  return store;
};
