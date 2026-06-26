import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./AuthGuard";

const authState = {
  isAuthenticated: false,
  isLoading: true,
};

vi.mock("@/modules/auth/AuthContext", () => ({
  useAuth: () => authState,
}));

describe("AuthGuard", () => {
  it("renders the loading splash while auth is resolving", () => {
    render(
      <MemoryRouter>
        <AuthGuard />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("progressbar", { name: /carregando funciona agro/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Preparando seu ambiente")).toBeInTheDocument();
  });
});
