import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { RootStore } from "./stores/rootStore";
import { StoreProvider } from "./stores/storeContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const rootStore = new RootStore(API_BASE_URL);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StoreProvider store={rootStore}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
);
