"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BrandMark from "./BrandMark";
import Icon, { type IconName } from "./Icon";

interface NavLink {
  href: string;
  label: string;
  icon: IconName;
  match?: string;
  exact?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: "navigation", exact: true },
  { href: "/#about", label: "About", icon: "info" },
  { href: "/#how-it-works", label: "How it works", icon: "layers" },
  { href: "/user/dashboard", label: "User dashboard", icon: "gauge", match: "/user" },
  { href: "/your-mission", label: "Driver mission", icon: "truck", match: "/your-mission" },
  { href: "/routes", label: "Routes", icon: "route", match: "/routes" },
  { href: "/report", label: "Report incident", icon: "alertTriangle", match: "/report" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (link: NavLink) => {
    if (link.exact) return pathname === link.href;
    if (link.match) return pathname.startsWith(link.match);
    return false;
  };

  return (
    <div className="w-full">
      {/* Official utility band */}
      <div className="hidden bg-navy-800 text-white/80 sm:block">
        <div className="mx-auto flex h-9 w-full max-w-[1720px] items-center justify-between px-4 text-[11px] font-medium sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <span className="tricolor-rail h-3 w-1 rounded-full" aria-hidden="true" />
            <span className="tracking-wide">
              North Eastern Region · Smart Logistics &amp; Accessibility Mission
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <Icon name="signal" size={13} className="text-white/70" />
              GNSS / NavIC ready
            </span>
            <span className="text-white/30">|</span>
            <span className="tracking-wide">Team Golden Arrows · SIH 2026</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full">
        <div className="tricolor-strip" aria-hidden="true" />
        <div className="border-b border-line bg-surface/95 backdrop-blur-md">
          <div className="mx-auto flex h-[68px] w-full max-w-[1720px] items-center justify-between px-4 sm:px-8 lg:px-12">
            {/* Brand */}
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <BrandMark size={40} />
              <span className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight text-navy">
                  MAARG
                </span>
                <span className="mt-0.5 hidden text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted sm:block">
                  NER Logistics Intelligence
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-0.5 lg:flex">
              {NAV_LINKS.map((link) => {
                const active = isActive(link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative inline-flex items-center border-b-2 px-3 py-2 text-[13.5px] font-medium transition-colors ${
                      active
                        ? "border-saffron font-semibold text-navy"
                        : "border-transparent text-muted hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
              <Link
                href="/government"
                className="inline-flex items-center gap-1.5 rounded-lg border border-india/25 bg-india/10 px-3.5 py-2 text-xs font-semibold text-india transition-colors hover:bg-india/15"
              >
                <Icon name="landmark" size={15} />
                Government portal
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
              >
                Sign up
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-navy hover:bg-wash lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Icon name={mobileMenuOpen ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="animate-fadeIn border-b border-line bg-surface px-4 pb-6 pt-3 shadow-lg lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium ${
                      active
                        ? "bg-wash font-semibold text-navy"
                        : "text-muted hover:bg-wash hover:text-navy"
                    }`}
                  >
                    <Icon
                      name={link.icon}
                      size={18}
                      className={active ? "text-primary" : "text-subtle"}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
              <Link
                href="/government"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-india/30 bg-india/10 py-2.5 text-sm font-semibold text-india"
              >
                <Icon name="landmark" size={16} />
                Government / Authority portal
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-line-strong py-2.5 text-center text-sm font-semibold text-navy"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
