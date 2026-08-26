interface BrandMarkProps {
  size?: number;
  /** "onDark" lightens the tile so it separates on navy surfaces. */
  tone?: "default" | "onDark";
  className?: string;
}

/**
 * MAARG emblem — a navy roundel bearing a mountain-range "M" (the North
 * Eastern terrain the platform routes through) with a saffron summit marker.
 * Replaces the plain "M in a box" placeholder.
 */
export default function BrandMark({
  size = 40,
  tone = "default",
  className,
}: BrandMarkProps) {
  const tile = tone === "onDark" ? "#16385f" : "#0f2747";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill={tile} />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="11"
        stroke="#ffffff"
        strokeOpacity="0.14"
      />
      {/* mountain-range M */}
      <path
        d="M9 28.5 L15 15 L20 21 L26 12.5 L31 28.5"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* horizon baseline */}
      <path
        d="M8.5 28.5 H31.5"
        stroke="#ffffff"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* saffron summit marker */}
      <circle cx="26" cy="12.5" r="2.4" fill="#ff6b1f" stroke={tile} strokeWidth="1.2" />
    </svg>
  );
}
