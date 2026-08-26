"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3.5 text-sm font-medium text-ink transition-all placeholder:text-subtle focus:border-primary focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25";
const labelClass =
  "mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted";

export default function ReportPage() {
  const [incidentType, setIncidentType] = useState("Landslide");
  const [severity, setSeverity] = useState("Medium - Partial blockage");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("NH-27, near Bhalukpong Pass (km 142)");
  const [isLocating, setIsLocating] = useState(false);
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setLocation("Lat: 27.0123° N, Long: 92.6411° E (Bhalukpong Sector)");
      setIsLocating(false);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <Icon name="chevronRight" size={13} className="text-subtle" />
              <span className="font-semibold text-navy">Report incident</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-danger-line bg-danger-bg px-3.5 py-1 text-xs font-semibold text-danger">
                <Icon name="alertTriangle" size={13} />
                Field reporting portal
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">Report a road incident</h1>
              <p className="mt-2 text-sm text-muted">
                Submit real-time road hazard, landslide, flood, or infrastructure-damage reports to
                update MAARG&apos;s AI accessibility models.
              </p>
            </div>

            {/* Session banner */}
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-navy sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-safe" />
                <span>
                  Verified field session: <strong>Authenticated user mode</strong>
                </span>
              </div>
              <span className="hidden items-center gap-1.5 text-xs font-semibold text-primary sm:inline-flex">
                <Icon name="shieldCheck" size={14} />
                Priority verification
              </span>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-md sm:p-10">
              {submitted ? (
                <div className="space-y-4 rounded-xl border border-safe-line bg-safe-bg p-8 text-center">
                  <Icon name="checkCircle" size={48} className="mx-auto text-safe" />
                  <h3 className="text-xl font-bold text-safe">Incident report submitted</h3>
                  <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted">
                    Thank you. Your field report has been uploaded to the MAARG Incident Intelligence
                    Database, and AI risk probabilities for this corridor have been updated.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link
                      href="/routes"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-navy-600 sm:text-sm"
                    >
                      View route forecasts
                      <Icon name="arrowRight" size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setDescription("");
                        setFileSelected(null);
                      }}
                      className="rounded-xl border border-line px-5 py-3 text-xs font-semibold text-navy transition-colors hover:bg-wash sm:text-sm"
                    >
                      Submit another report
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Incident type</label>
                      <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)} className={inputClass}>
                        <option value="Landslide">Landslide / rockfall</option>
                        <option value="Flood">Flood / waterlogging</option>
                        <option value="Road Damage">Road damage / potholes</option>
                        <option value="Bridge Damage">Bridge damage / structural</option>
                        <option value="Heavy Rainfall">Heavy torrential rainfall</option>
                        <option value="Traffic Blockage">Traffic blockage / breakdown</option>
                        <option value="Other">Other disruption</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Severity level</label>
                      <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputClass}>
                        <option value="Low - Passable with caution">Low — passable with caution</option>
                        <option value="Medium - Partial blockage">Medium — partial blockage / slow</option>
                        <option value="High - Severe disruption / Unpassable">High — severe disruption / impassable</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Exact location / landmark</label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. NH-27 near Bhalukpong Pass"
                        className={`flex-1 ${inputClass}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-4 py-3.5 text-xs font-semibold text-india transition-all hover:border-india hover:bg-wash disabled:opacity-60"
                      >
                        <Icon name="mapPin" size={15} />
                        <span>{isLocating ? "Locating…" : "Use GPS location"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Incident description</label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the disruption size, affected lanes, weather conditions, or estimated clearance status…"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Upload photograph / field photo</label>
                    <div className="relative rounded-2xl border-2 border-dashed border-line bg-canvas p-8 text-center transition-colors hover:border-primary">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="space-y-2">
                        <Icon name="camera" size={32} className="mx-auto text-subtle" />
                        <p className="text-sm font-semibold text-navy">
                          {fileSelected ? `Selected: ${fileSelected}` : "Click or drag an image file here"}
                        </p>
                        <p className="text-xs text-muted">Supports JPG, PNG, WEBP up to 10&nbsp;MB.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-110"
                  >
                    <span>Submit incident report</span>
                    <Icon name="arrowRight" size={18} />
                  </button>
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
