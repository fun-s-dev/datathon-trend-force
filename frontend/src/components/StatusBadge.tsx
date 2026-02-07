type StatusLevel = "Low" | "Medium" | "High" | string;

interface StatusBadgeProps {
  level: StatusLevel | null | undefined;
}

export function StatusBadge({ level }: StatusBadgeProps) {
  if (level == null || level === "") return null;

  const normalized = String(level).toLowerCase();
  const variant =
    normalized === "low"
      ? "low"
      : normalized === "medium"
        ? "medium"
        : normalized === "high"
          ? "high"
          : "default";

  return (
    <span className={`status-badge status-${variant}`}>{level}</span>
  );
}
