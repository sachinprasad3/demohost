import { memo, useEffect, useRef } from "react";

const Pagination = memo(
  ({
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  }) => {
    if (!totalPages || totalPages <= 1) return null;

    return (
      <div className="card-footer d-flex justify-content-between align-items-center">
        <span className="text-muted">
          Page {page} of {totalPages}
        </span>

        <div>
          <button
            className="btn btn-primary"
            disabled={
              !hasPreviousPage || isFetchingNextPage || isFetchingPreviousPage
            }
            onClick={fetchPreviousPage}
          >
            {isFetchingPreviousPage ? "Loading..." : "Previous"}
          </button>

          <button
            className="btn btn-outline-secondary btn-sm text-black"
            disabled={
              !hasNextPage || isFetchingNextPage || isFetchingPreviousPage
            }
            onClick={fetchNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    );
  },
);

export default Pagination;

export const InfinitePagination = memo(
  ({
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }) => {
    const observerRef = useRef(null);

    useEffect(() => {
      if (!observerRef.current || !hasNextPage) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(observerRef.current);

      return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (!hasNextPage) return null;

    return (
      <div
        ref={observerRef}
        className="d-flex justify-content-center py-3"
      >
        {isFetchingNextPage && (
          <span className="text-muted">Loading more...</span>
        )}
      </div>
    );
  }
);
