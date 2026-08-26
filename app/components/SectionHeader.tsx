interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      {badge && (
        <div className={`mb-3.5 flex items-center gap-2.5 ${centered ? "justify-center" : ""}`}>
          <span className="h-[3px] w-7 rounded-full bg-saffron" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {badge}
          </span>
        </div>
      )}
      <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      )}
    </div>
  );
}
