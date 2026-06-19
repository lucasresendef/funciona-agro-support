import { useEffect, useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

interface UsePaginationStateOptions {
  initialLimit?: number;
  totalPages?: number;
}

export function usePaginationState({
  initialLimit = 10,
  totalPages,
}: UsePaginationStateOptions = {}) {
  const [page, setPage] = useState(1);
  const [limit, setLimitValue] = useState(initialLimit);

  useEffect(() => {
    if (totalPages === undefined) return;
    if (page === 1) return;

    if (totalPages <= 0) {
      setPage(1);
      return;
    }

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function setLimit(nextLimit: number) {
    setLimitValue(nextLimit);
    setPage(1);
  }

  function resetPage() {
    setPage(1);
  }

  return {
    page,
    limit,
    setPage,
    setLimit,
    resetPage,
    pagination: {
      page,
      limit,
    },
  };
}
