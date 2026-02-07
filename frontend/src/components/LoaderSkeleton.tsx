interface LoaderSkeletonProps {
  rows?: number;
}

export function LoaderSkeleton({ rows = 3 }: LoaderSkeletonProps) {
  return (
    <div className="loader-skeleton">
      <div className="skeleton-grid">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-card" aria-hidden="true" />
        ))}
      </div>
      <p className="skeleton-text">Loading prediction...</p>
    </div>
  );
}
