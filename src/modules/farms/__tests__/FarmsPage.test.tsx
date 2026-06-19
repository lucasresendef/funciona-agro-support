import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FarmsPage } from "../FarmsPage";

vi.mock("@/shared/lib/http/api-client", () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    }),
  },
}));

vi.mock("@/modules/auth/AuthContext", () => ({
  useAuth: () => ({ profile: null }),
}));

describe("FarmsPage", () => {
  it("renders title", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <FarmsPage />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Fazendas")).toBeInTheDocument();
  });
});
