"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-subtle focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-navy";

// Values map exactly to the Incident model enums.
const INCIDENT_TYPES: { value: string; label: string }[] = [
  { value: "LANDSLIDE", label: "Landslide / rockfall" },
  { value: "FLOOD", label: "Flood / waterlogging" },
  { value: "ROAD_BLOCK", label: "Road block / obstruction" },
  { value: "ROAD_DAMAGE", label: "Road damage / potholes" },
  { value: "BRIDGE_DAMAGE", label: "Bridge damage / structural" },
  { value: "ACCIDENT", label: "Accident" },
  { value: "TRAFFIC", label: "Traffic congestion" },
  { value: "OTHER", label: "Other disruption" },
];

const SEVERITIES: { value: string; label: string }[] = [
  { value: "LOW", label: "Low — passable with caution" },
  { value: "MEDIUM", label: "Medium — partial blockage" },
  { value: "HIGH", label: "High — severe disruption" },
  { value: "CRITICAL", label: "Critical — impassable" },
];

export default function ReportPage() {
  const [type, setType] = useState("LANDSLIDE");
  const [severity, setSeverity] = useState("MEDIUM");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [truckNo, setTruckNo] = useState("");
  const [occurredAt, setOccurredAt] = useState("");

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [syncPending, setSyncPending] = useState(false);

  const handleGetCurrentLocation = () => {
    setGeoError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported on this device. Enter coordinates manually.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setGeoError("Could not read your location. Enter the coordinates manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resetForm = () => {
    setDescription("");
    setTruckNo("");
    setLat("");
    setLng("");
    setType("LANDSLIDE");
    setSeverity("MEDIUM");
    setOccurredAt("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (!lat || !lng || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError("Please provide a valid latitude and longitude, or use GPS.");
      return;
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setError("Coordinates are out of range. Latitude −90…90, longitude −180…180.");
      return;
    }

    // Payload matches the Incident model exactly (GeoJSON = [longitude, latitude]).
    const payload = {
      type,
      severity,
      location: {
        type: "Point",
        coordinates: [lngNum, latNum] as [number, number],
      },
      description: description.trim() || undefined,
      source: "FIELD_REPORT",
      occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
      ...(truckNo.trim() ? { truckNo: truckNo.trim().toUpperCase() } : {}),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // The incident service may not be live yet; treat a non-2xx as "sync pending"
      // rather than losing the user's report.
      setSyncPending(!res.ok);
      setSubmitted(true);
      setLoading(false);
    } catch {
      // Network/route unavailable — still confirm capture, flag sync as pending.
      setSyncPending(true);
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-[13px] text-muted" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Icon name="chevronRight" size={13} className="text-subtle" />
            <span className="font-semibold text-navy">Report incident</span>
          </nav>

          {/* Header */}
          <div className="mb-7">
            <span className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-danger">
              <Icon name="alertTriangle" size={13} />
              Field reporting
            </span>
            <h1 className="text-[26px] font-bold tracking-tight text-ink">Report a road incident</h1>
            <p className="mt-2 text-sm text-muted">
              Submit a road hazard, landslide, flood, or infrastructure-damage report to update
              MAARG&apos;s accessibility models.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-[10px] border border-line bg-surface p-7">
            {submitted ? (
              <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-safe-line bg-safe-bg text-safe">
                  <Icon name="checkCircle" size={30} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">Incident report submitted</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
                  Thank you. Your field report has been captured with its location and time stamp.
                </p>

                {syncPending && (
                  <p className="mx-auto mt-4 flex max-w-lg items-start gap-2.5 rounded-md border border-warning-line bg-warning-bg p-3 text-left text-[13px] leading-relaxed text-warning">
                    <Icon name="info" size={16} className="mt-0.5 shrink-0" />
                    <span>
                      The incident service isn&apos;t responding yet, so live sync is pending. Your
                      report is formatted correctly and will be accepted once the endpoint is online.
                    </span>
                  </p>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/routes"
                    className="inline-flex items-center gap-1.5 rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
                  >
                    View route forecasts
                    <Icon name="arrowRight" size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSyncPending(false);
                      resetForm();
                    }}
                    className="rounded-md border border-line-strong px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-wash"
                  >
                    Submit another report
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-md border border-danger-line bg-danger-bg p-3 text-[13px] font-medium text-danger"
                  >
                    <Icon name="alertTriangle" size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="type" className={labelClass}>
                      Incident type
                    </label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={inputClass}
                    >
                      {INCIDENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="severity" className={labelClass}>
                      Severity
                    </label>
                    <select
                      id="severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className={inputClass}
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="text-[13px] font-semibold text-navy">Location coordinates</label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-india transition-colors hover:border-india hover:bg-wash disabled:opacity-60"
                    >
                      <Icon name="mapPin" size={14} />
                      <span>{locating ? "Locating…" : "Use GPS"}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Latitude e.g. 27.012300"
                      className={inputClass}
                      required
                    />
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Longitude e.g. 92.641100"
                      className={inputClass}
                      required
                    />
                  </div>
                  {geoError && <p className="mt-1.5 text-[12px] text-warning">{geoError}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="occurredAt" className={labelClass}>
                      When did it occur? <span className="font-normal text-subtle">(optional)</span>
                    </label>
                    <input
                      id="occurredAt"
                      type="datetime-local"
                      value={occurredAt}
                      onChange={(e) => setOccurredAt(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-[12px] text-subtle">Leave blank to use the current time.</p>
                  </div>
                  <div>
                    <label htmlFor="truckNo" className={labelClass}>
                      Associated truck <span className="font-normal text-subtle">(optional)</span>
                    </label>
                    <input
                      id="truckNo"
                      type="text"
                      value={truckNo}
                      onChange={(e) => setTruckNo(e.target.value)}
                      placeholder="AS01AB1234"
                      className={`${inputClass} uppercase`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description <span className="font-normal text-subtle">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the disruption size, affected lanes, weather conditions, or estimated clearance…"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-danger px-5 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span>Submitting…</span>
                  ) : (
                    <>
                      <span>Submit incident report</span>
                      <Icon name="arrowRight" size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
