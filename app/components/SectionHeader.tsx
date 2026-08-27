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
    <div className={`mb-9 ${centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {badge && (
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {badge}
        </p>
      )}
      <h2 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      )}
    </div>
  );
}
