import Link from "next/link";
import BrandMark from "./BrandMark";
import Icon from "./Icon";

const PLATFORM_LINKS = [
  { href: "/", label: "Home" },
  { href: "/user/select", label: "Account type selection" },
  { href: "/user/dashboard", label: "User dashboard" },
  { href: "/your-mission", label: "Driver active mission" },
  { href: "/routes", label: "Route risk comparison" },
];

const SERVICE_LINKS = [
  { href: "/government", label: "Government / Authority portal", strong: true },
  { href: "/report", label: "Field incident reporting" },
  { href: "/login", label: "Portal login" },
  { href: "/signup", label: "Registration / activation" },
];

const RISK_LEGEND = [
  { label: "Safe", color: "bg-safe" },
  { label: "Medium", color: "bg-warning" },
  { label: "High risk", color: "bg-danger" },
];

export default function Footer() {
  return (
    <footer className="mt-auto w-full">
      <div className="tricolor-strip" aria-hidden="true" />
      <div className="bg-navy text-white/70">
        <div className="mx-auto w-full max-w-[1720px] px-4 py-14 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BrandMark size={40} tone="onDark" />
                <span className="text-lg font-extrabold tracking-tight text-white">
                  MAARG
                </span>
              </div>
              <p className="max-w-xs text-[13px] leading-relaxed text-white/60">
                AI-based smart logistics and road-accessibility intelligence
                platform for the North Eastern Region of India.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                <Icon name="shieldCheck" size={13} />
                Team Golden Arrows · SIH 2026
              </span>
            </div>

            {/* Platform navigation */}
            <div>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                Platform navigation
              </h3>
              <ul className="space-y-2.5 text-[13.5px]">
                {PLATFORM_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-white/65 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portals & services */}
            <div>
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                Portals &amp; services
              </h3>
              <ul className="space-y-2.5 text-[13.5px]">
                {SERVICE_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`transition-colors hover:text-white ${
                        l.strong ? "font-semibold" : "text-white/65"
                      }`}
                      style={l.strong ? { color: "#8fd3ac" } : undefined}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operational focus */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                NER operational focus
              </h3>
              <p className="flex gap-2 text-[13px] leading-relaxed text-white/60">
                <Icon name="mountain" size={16} className="mt-0.5 shrink-0 text-white/45" />
                <span>
                  Built for extreme terrain, heavy rainfall, landslide
                  prediction, and essential-supply transport across Arunachal
                  Pradesh, Assam, Meghalaya, Manipur, Mizoram, Nagaland, Sikkim
                  &amp; Tripura.
                </span>
              </p>
              <div className="flex items-center gap-4 pt-1 text-[12px] text-white/60">
                {RISK_LEGEND.map((r) => (
                  <span key={r.label} className="inline-flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/12 pt-6 text-[12px] text-white/55 sm:flex-row">
            <p>
              © 2026 MAARG — Smart Logistics &amp; Accessibility Intelligence
              Platform.
            </p>
            <p className="font-medium">Prototype · Smart India Hackathon 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
