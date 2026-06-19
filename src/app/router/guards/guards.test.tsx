import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./AuthGuard";

vi.mock("@/modules/auth/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

describe("AuthGuard", () => {
  it("renders redirect fallback", () => {
    render(
      <MemoryRouter>
        <AuthGuard />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
  });
});
