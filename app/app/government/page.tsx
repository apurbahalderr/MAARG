"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm font-medium text-ink transition-all placeholder:text-subtle focus:border-india focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-india/25";
const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted";

const CAPABILITIES = [
  "Create & assign critical logistics missions",
  "Register trucks, drivers & cargo priorities",
  "Live fleet positioning via NavIC / GNSS",
  "Issue real-time road hazard & landslide advisories",
];

export default function GovernmentPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deptCode, setDeptCode] = useState("NER-LOGISTICS-01");
  const [submitted, setSubmitted] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-12">
            {/* Left info */}
            <div className="space-y-5 md:col-span-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-india/20 bg-india/10 px-3.5 py-1 text-xs font-semibold text-india">
                <Icon name="landmark" size={13} />
                Official authority portal
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Government &amp; Logistics Authority Portal
              </h1>

              <div className="tricolor-strip w-24 rounded-full" aria-hidden="true" />

              <p className="text-sm leading-relaxed text-muted">
                Restricted portal for state transport departments, disaster-response authorities,
                and essential-goods supply managers across the North Eastern Region.
              </p>

              <div className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy">
                  Internal authority capabilities
                </h4>
                <ul className="space-y-2.5 text-xs text-muted">
                  {CAPABILITIES.map((cap) => (
                    <li key={cap} className="flex items-start gap-2">
                      <Icon name="check" size={15} className="mt-0.5 shrink-0 text-india" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="flex gap-2 rounded-xl border border-warning-line bg-warning-bg p-4 text-xs leading-relaxed text-warning">
                <Icon name="lock" size={15} className="mt-0.5 shrink-0" />
                <span>
                  <strong className="font-bold">Notice:</strong> Government accounts are provisioned
                  internally by authorised administrators. Public registration is strictly disabled.
                </span>
              </p>
            </div>

            {/* Right login form */}
            <div className="md:col-span-6">
              <div className="rounded-2xl border border-line bg-surface p-8 shadow-md">
                <div className="mb-6 text-center">
                  <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white shadow-sm">
                    <Icon name="landmark" size={28} />
                  </span>
                  <h2 className="text-xl font-bold text-navy">Government sign in</h2>
                  <p className="mt-1 text-xs text-muted">Enter your official government credentials.</p>
                </div>

                {submitted ? (
                  <div className="space-y-3 rounded-xl border border-safe-line bg-safe-bg p-6 text-center">
                    <Icon name="shieldCheck" size={40} className="mx-auto text-safe" />
                    <h3 className="text-base font-bold text-safe">Authentication verified</h3>
                    <p className="text-xs text-muted">
                      Welcome, <strong className="text-ink">{email || "authority user"}</strong>.
                      Connecting to MAARG Central Authority Control System…
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/your-mission"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-india px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-india-600"
                      >
                        Proceed to fleet monitor
                        <Icon name="arrowRight" size={14} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className={labelClass}>Official email / government ID</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="official@transport.gov.in"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Department access code</label>
                      <input
                        type="text"
                        value={deptCode}
                        onChange={(e) => setDeptCode(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={inputClass}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-india px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-india-600"
                    >
                      <span>Sign in as Government Authority</span>
                      <Icon name="arrowRight" size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
