interface RouteStatusBadgeProps {
  status: "safe" | "medium" | "high" | "SAFE" | "MEDIUM RISK" | "HIGH RISK" | string;
  size?: "sm" | "md" | "lg";
}

export default function RouteStatusBadge({ status, size = "md" }: RouteStatusBadgeProps) {
  const normalized = status.toLowerCase();

  const isSafe = normalized.includes("safe");
  const isMedium = normalized.includes("medium");

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-semibold",
    md: "px-3 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold",
  }[size];

  const config = isSafe
    ? {
        wrap: "bg-safe-bg text-safe border-safe-line",
        dot: "bg-safe animate-pulse",
        label: "Safe",
      }
    : isMedium
    ? {
        wrap: "bg-warning-bg text-warning border-warning-line",
        dot: "bg-warning",
        label: "Medium risk",
      }
    : {
        wrap: "bg-danger-bg text-danger border-danger-line",
        dot: "bg-danger",
        label: "High risk",
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wide ${config.wrap} ${sizeClasses}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
