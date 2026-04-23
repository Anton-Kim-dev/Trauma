import { useState } from "react";
import type { ComponentType } from "react";
import "../index.css";
import { RootStore } from "../stores/rootStore";
import { StoreProvider } from "../stores/storeContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const withRemoteProviders = <TProps extends object>(Component: ComponentType<TProps>) => {
  const WrappedComponent = (props: TProps) => {
    const [store] = useState(() => new RootStore(API_BASE_URL));

    return (
      <StoreProvider store={store}>
        <Component {...props} />
      </StoreProvider>
    );
  };

  WrappedComponent.displayName = `Remote(${Component.displayName ?? Component.name ?? "Component"})`;

  return WrappedComponent;
};
