interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <p className="error-message">{message}</p>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
