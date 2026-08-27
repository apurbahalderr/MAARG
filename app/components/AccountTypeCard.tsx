import Link from "next/link";
import Icon, { type IconName } from "./Icon";

type Variant = "primary" | "india" | "navy";

interface AccountTypeCardProps {
  badge?: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  icon?: IconName;
  variant?: Variant;
  size?: "default" | "lg";
  features?: string[];
}

const VARIANTS: Record<
  Variant,
  { tile: string; iconColor: string; button: string; hover: string; check: string }
> = {
  primary: {
    tile: "border-primary/20 bg-primary/8",
    iconColor: "text-primary",
    button: "bg-primary hover:bg-primary-600",
    hover: "hover:border-primary/45",
    check: "text-primary",
  },
  india: {
    tile: "border-india/20 bg-india/8",
    iconColor: "text-india",
    button: "bg-india hover:bg-india-600",
    hover: "hover:border-india/45",
    check: "text-india",
  },
  navy: {
    tile: "border-line bg-wash",
    iconColor: "text-navy",
    button: "bg-navy hover:bg-navy-600",
    hover: "hover:border-line-strong",
    check: "text-navy",
  },
};

export default function AccountTypeCard({
  badge,
  title,
  description,
  buttonText,
  href,
  icon = "landmark",
  variant = "primary",
  size = "default",
  features,
}: AccountTypeCardProps) {
  const v = VARIANTS[variant];
  const lg = size === "lg";

  return (
    <div
      className={`flex flex-col rounded-[10px] border border-line bg-surface transition-colors ${v.hover} ${
        lg ? "p-7 sm:p-8" : "p-6"
      }`}
    >
      <div className="flex-1">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span
            className={`flex items-center justify-center rounded-lg border ${v.tile} ${
              lg ? "h-14 w-14" : "h-11 w-11"
            }`}
          >
            <Icon name={icon} size={lg ? 28 : 22} className={v.iconColor} />
          </span>
          {badge && (
            <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-medium text-muted">
              {badge}
            </span>
          )}
        </div>

        <h3 className={`font-bold tracking-tight text-navy ${lg ? "text-2xl" : "text-lg"}`}>{title}</h3>
        <p className={`mt-2 leading-relaxed text-muted ${lg ? "text-[15px]" : "text-sm"}`}>{description}</p>

        {features && features.length > 0 && (
          <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                <Icon name="check" size={17} className={`mt-0.5 shrink-0 ${v.check}`} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={lg ? "mt-7" : "mt-6"}>
        <Link
          href={href}
          className={`flex w-full items-center justify-center gap-2 rounded-md px-5 font-semibold text-white transition-colors ${v.button} ${
            lg ? "py-3.5 text-[15px]" : "py-3 text-sm"
          }`}
        >
          <span>{buttonText}</span>
          <Icon name="arrowRight" size={17} />
        </Link>
      </div>
    </div>
  );
}
