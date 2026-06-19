import { initKeycloak } from "@/shared/lib/auth/keycloak";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "@/shared/ui/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

initKeycloak()
  .catch(() => false)
  .finally(() => {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
