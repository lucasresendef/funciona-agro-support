import { initKeycloak } from "@/shared/lib/auth/keycloak";
import { LoadingSplashScreen } from "@/shared/ui/components/LoadingSplashScreen";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "@/shared/ui/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <LoadingSplashScreen />
  </React.StrictMode>,
);

void initKeycloak()
  .catch(() => false)
  .finally(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
