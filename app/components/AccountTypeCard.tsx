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
}

const VARIANTS: Record<
  Variant,
  { tile: string; iconColor: string; button: string }
> = {
  primary: {
    tile: "border-primary/20 bg-primary/10",
    iconColor: "text-primary",
    button: "bg-primary hover:bg-primary-600",
  },
  india: {
    tile: "border-india/20 bg-india/10",
    iconColor: "text-india",
    button: "bg-india hover:bg-india-600",
  },
  navy: {
    tile: "border-line bg-wash",
    iconColor: "text-navy",
    button: "bg-navy hover:bg-navy-600",
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
}: AccountTypeCardProps) {
  const v = VARIANTS[variant];

  return (
    <div className="flex flex-col justify-between rounded-[14px] border border-line bg-surface p-7 shadow-sm transition-all duration-200 hover:border-line-strong hover:shadow-md">
      <div>
        <div className="mb-5 flex items-center justify-between">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${v.tile}`}
          >
            <Icon name={icon} size={24} className={v.iconColor} />
          </span>
          {badge && (
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold tracking-tight text-navy">{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <Link
          href={href}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors ${v.button}`}
        >
          <span>{buttonText}</span>
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </div>
  );
}
