import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { UsersPage } from "../UsersPage";

vi.mock("@/shared/lib/http/api-client", () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    }),
  },
}));

describe("UsersPage", () => {
  it("renders header", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByText("Controle de contas administrativas e operacionais"),
    ).toBeInTheDocument();
  });
});
