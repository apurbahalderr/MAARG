import Link from "next/link";
import BrandMark from "./BrandMark";

const PLATFORM_LINKS = [
  { href: "/", label: "Home" },
  { href: "/user/dashboard", label: "Route planner" },
  { href: "/routes", label: "Route risk comparison" },
  { href: "/your-mission", label: "Driver mission" },
  { href: "/report", label: "Report an incident" },
];

const ACCESS_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Register / activate" },
  { href: "/user/select", label: "Choose account type" },
  { href: "/government", label: "Government / Authority portal" },
];

export default function Footer() {
  return (
    <footer className="mt-auto w-full">
      <div className="tricolor-strip" aria-hidden="true" />
      <div className="bg-navy text-white/70">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            {/* Brand */}
            <div className="space-y-4 md:col-span-5">
              <div className="flex items-center gap-2.5">
                <BrandMark size={38} tone="onDark" />
                <span className="text-lg font-bold tracking-tight text-white">MAARG</span>
              </div>
              <p className="max-w-sm text-[13.5px] leading-relaxed text-white/60">
                An AI-based smart logistics and road-accessibility intelligence platform for the
                North Eastern Region — predicting terrain and weather disruptions to keep essential
                transport moving.
              </p>
              <p className="text-[12px] text-white/45">Team Golden Arrows · Smart India Hackathon 2026</p>
            </div>

            <div className="md:col-span-4">
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Platform
              </h3>
              <ul className="space-y-2.5 text-[13.5px]">
                {PLATFORM_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/65 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3">
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Access
              </h3>
              <ul className="space-y-2.5 text-[13.5px]">
                {ACCESS_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/65 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-[12px] text-white/50 sm:flex-row">
            <p>© 2026 MAARG — Smart Logistics &amp; Accessibility Intelligence Platform.</p>
            <p>Prototype · Smart India Hackathon 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
