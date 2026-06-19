import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "../LoginPage";

vi.mock("../AuthContext", () => ({
  useAuth: () => ({ login: vi.fn(), isAuthenticated: false }),
}));

describe("LoginPage", () => {
  it("shows login button", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Entrar")).toBeInTheDocument();
  });
});
