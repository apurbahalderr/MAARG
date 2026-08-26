"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-ink transition-all placeholder:text-subtle focus:border-primary focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";
const inputClassDriver =
  "w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-ink transition-all placeholder:text-subtle focus:border-india focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-india/25";
const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted";

export default function SignupPage() {
  const [tab, setTab] = useState<"user" | "driver">("user");

  // Normal user state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userType, setUserType] = useState("Family / Resident");
  const [state, setState] = useState("Assam");
  const [district, setDistrict] = useState("Kamrup Metropolitan");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Driver state
  const [driverId, setDriverId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [driverConfirmPassword, setDriverConfirmPassword] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
                <Icon name="user" size={13} />
                Registration &amp; activation
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">
                Create your MAARG account
              </h1>
              <p className="mt-2 text-sm text-muted">
                Government accounts are provisioned internally. Select a user account type below.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-8 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setTab("user")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all ${
                  tab === "user" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-navy"
                }`}
              >
                <Icon name="user" size={15} />
                Normal user registration
              </button>
              <button
                type="button"
                onClick={() => setTab("driver")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all ${
                  tab === "driver" ? "bg-india text-white shadow-sm" : "text-muted hover:text-navy"
                }`}
              >
                <Icon name="truck" size={15} />
                Truck driver activation
              </button>
            </div>

            {/* Form container */}
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-md">
              {submitted ? (
                <div className="space-y-3 rounded-xl border border-safe-line bg-safe-bg p-6 text-center">
                  <Icon name="checkCircle" size={40} className="mx-auto text-safe" />
                  <h3 className="text-lg font-bold text-safe">
                    {tab === "user" ? "Account created successfully" : "Driver account activated"}
                  </h3>
                  <p className="text-xs text-muted">
                    {tab === "user"
                      ? "Welcome to MAARG. You can now check routes and submit incident reports."
                      : "Your Driver ID has been verified with government logistics records."}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={tab === "user" ? "/user/dashboard" : "/your-mission"}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-colors ${
                        tab === "user" ? "bg-primary hover:bg-primary-600" : "bg-india hover:bg-india-600"
                      }`}
                    >
                      Proceed to {tab === "user" ? "dashboard" : "active mission"}
                      <Icon name="arrowRight" size={14} />
                    </Link>
                  </div>
                </div>
              ) : tab === "user" ? (
                /* USER FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-4 border-b border-line pb-3">
                    <h3 className="text-base font-bold text-navy">Civilian user registration</h3>
                    <p className="text-xs text-muted">For residents, students, office workers &amp; visitors.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Full name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ananya Sharma" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>User type</label>
                      <select value={userType} onChange={(e) => setUserType(e.target.value)} className={inputClass}>
                        <option>Family / Resident</option>
                        <option>Student</option>
                        <option>Office Worker</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Email address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ananya@example.com" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile number</label>
                      <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98765 43210" className={inputClass} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>State</label>
                      <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                        <option>Assam</option>
                        <option>Arunachal Pradesh</option>
                        <option>Meghalaya</option>
                        <option>Manipur</option>
                        <option>Mizoram</option>
                        <option>Nagaland</option>
                        <option>Sikkim</option>
                        <option>Tripura</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>District</label>
                      <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kamrup Metropolitan" className={inputClass} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••••" className={inputClass} required />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
                  >
                    <span>Create account</span>
                    <Icon name="arrowRight" size={16} />
                  </button>

                  <div className="pt-3 text-center text-xs text-muted">
                    Already registered?{" "}
                    <Link href="/login" className="font-bold text-primary hover:underline">
                      Log in
                    </Link>
                  </div>
                </form>
              ) : (
                /* DRIVER FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-4 border-b border-line pb-3">
                    <h3 className="text-base font-bold text-navy">Government driver activation</h3>
                    <p className="text-xs text-muted">
                      Drivers are government-assigned. Enter your assigned Driver ID to activate.
                    </p>
                  </div>

                  <p className="mb-4 flex gap-2 rounded-xl border border-safe-line bg-safe-bg p-3.5 text-xs leading-relaxed text-india-600">
                    <Icon name="info" size={15} className="mt-0.5 shrink-0" />
                    <span>
                      The backend verifies that your Driver ID was created and assigned by the
                      government authority before granting access.
                    </span>
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Government Driver ID</label>
                      <input type="text" value={driverId} onChange={(e) => setDriverId(e.target.value)} placeholder="DRV-AS-1024" className={inputClassDriver} required />
                    </div>
                    <div>
                      <label className={labelClass}>Full name</label>
                      <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Ramesh Kumar" className={inputClassDriver} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Mobile number</label>
                      <input type="tel" value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} placeholder="+91 98765 12345" className={inputClassDriver} required />
                    </div>
                    <div>
                      <label className={labelClass}>Driving licence number</label>
                      <input type="text" value={dlNumber} onChange={(e) => setDlNumber(e.target.value)} placeholder="AS-01-2022-009182" className={inputClassDriver} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Password</label>
                      <input type="password" value={driverPassword} onChange={(e) => setDriverPassword(e.target.value)} placeholder="••••••••••••" className={inputClassDriver} required />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm password</label>
                      <input type="password" value={driverConfirmPassword} onChange={(e) => setDriverConfirmPassword(e.target.value)} placeholder="••••••••••••" className={inputClassDriver} required />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-india px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-india-600"
                  >
                    <span>Activate driver account</span>
                    <Icon name="arrowRight" size={16} />
                  </button>

                  <div className="pt-3 text-center text-xs text-muted">
                    Already activated?{" "}
                    <Link href="/login" className="font-bold text-india hover:underline">
                      Driver login
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
