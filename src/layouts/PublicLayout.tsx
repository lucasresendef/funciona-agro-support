import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <main className="app-shell-bg min-h-screen">
      <Outlet />
    </main>
  );
}
