"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm font-medium text-ink transition-all placeholder:text-subtle focus:border-primary focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";
const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted";

export default function LoginPage() {
  const [role, setRole] = useState<"user" | "driver">("user");
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  const isDriver = role === "driver";
  const accent = isDriver ? "bg-india hover:bg-india-600" : "bg-primary hover:bg-primary-600";

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
                <Icon name="lock" size={13} />
                MAARG portal authentication
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">Welcome to MAARG</h1>
              <p className="mt-2 text-sm text-muted">
                Choose your account type to access your portal.
              </p>
            </div>

            {/* Role switcher */}
            <div className="mb-8 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all ${
                  role === "user" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-navy"
                }`}
              >
                <Icon name="user" size={15} />
                Normal user
              </button>
              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all ${
                  role === "driver" ? "bg-india text-white shadow-sm" : "text-muted hover:text-navy"
                }`}
              >
                <Icon name="truck" size={15} />
                Truck driver
              </button>
              <Link
                href="/government"
                className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-center text-xs font-bold text-navy transition-all hover:bg-wash"
              >
                <Icon name="landmark" size={15} />
                Authority
              </Link>
            </div>

            {/* Form box */}
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-md">
              {loggedIn ? (
                <div className="space-y-3 rounded-xl border border-safe-line bg-safe-bg p-6 text-center">
                  <Icon name="checkCircle" size={40} className="mx-auto text-safe" />
                  <h3 className="text-lg font-bold text-safe">Login successful</h3>
                  <p className="text-xs text-muted">Welcome back — redirecting to your dashboard…</p>
                  <div className="pt-2">
                    <Link
                      href={isDriver ? "/your-mission" : "/user/dashboard"}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-colors ${accent}`}
                    >
                      Go to dashboard
                      <Icon name="arrowRight" size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="mb-4 border-b border-line pb-3">
                    <h3 className="text-base font-bold text-navy">
                      {isDriver ? "Truck driver login" : "Normal user login"}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {isDriver
                        ? "Enter your government-assigned Driver ID or licence number."
                        : "Enter your email or registered phone number."}
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      {isDriver ? "Government Driver ID / Licence no." : "Email / mobile number"}
                    </label>
                    <input
                      type="text"
                      value={emailOrId}
                      onChange={(e) => setEmailOrId(e.target.value)}
                      placeholder={isDriver ? "DRV-NER-10928" : "user@example.com"}
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
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors ${accent}`}
                  >
                    <span>Sign in to {isDriver ? "Driver portal" : "User portal"}</span>
                    <Icon name="arrowRight" size={16} />
                  </button>

                  <div className="border-t border-line pt-4 text-center text-xs text-muted">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-bold text-primary hover:underline">
                      Sign up / activate account
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
