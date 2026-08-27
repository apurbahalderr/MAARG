"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteStatusBadge from "@/components/RouteStatusBadge";
import Icon from "@/components/Icon";
import dynamic from "next/dynamic";
import type { RouteData } from "@/components/MapComponent";

// Dynamically import MapComponent to avoid SSR issues with the Mappls SDK
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-[10px] border border-line bg-canvas text-sm text-muted">
      Loading map…
    </div>
  ),
});

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-navy";

export default function UserDashboardPage() {
  const [source, setSource] = useState("Guwahati");
  const [destination, setDestination] = useState("Tawang");
  const [submittedOrigin, setSubmittedOrigin] = useState("Guwahati");
  const [submittedDest, setSubmittedDest] = useState("Tawang");
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteData[]>([]);

  const recommendedRoute = routes.find((r) => r.isRecommended) ?? routes[0] ?? null;

  const handleRoutesLoaded = useCallback((loadedRoutes: RouteData[]) => {
    setRoutes(loadedRoutes);
    setIsSearched(true);
    setIsLoading(false);
  }, []);

  const handleCheckRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) return;
    setIsLoading(true);
    setIsSearched(false);
    setRoutes([]);
    setSubmittedOrigin(source.trim());
    setSubmittedDest(destination.trim());
    // The map will call onRoutesLoaded when done
  };

  const riskLabel = {
    LOW: "Safe",
    MEDIUM: "Medium risk",
    HIGH: "High risk",
  } as const;

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[22px] font-bold tracking-tight text-ink sm:text-[26px]">
              Route accessibility &amp; journey planner
            </h1>
            <p className="mt-1 text-sm text-muted">
              Enter your origin and destination to evaluate route safety across the North Eastern Region.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-4">
              {/* Journey form */}
              <div className="rounded-[10px] border border-line bg-surface p-6 sm:p-7">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy">
                  <Icon name="navigation" size={18} className="text-primary" />
                  Plan journey route
                </h2>

                <form onSubmit={handleCheckRoute} className="space-y-4">
                  <div>
                    <label className={labelClass}>Source location</label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. Guwahati"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Destination location</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Tawang"
                      className={inputClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Evaluating terrain risk…</span>
                    ) : (
                      <>
                        <Icon name="search" size={16} />
                        <span>Check route accessibility</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Recommendation card — shows after routes are loaded */}
              {isSearched && recommendedRoute && (
                <div className="animate-fadeIn rounded-[10px] border border-line bg-surface p-6 sm:p-7">
                  <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
                        MAARG recommendation
                      </span>
                      <h3 className="mt-1 text-base font-bold text-navy">
                        Route {routes.indexOf(recommendedRoute) + 1} — {submittedOrigin} → {submittedDest}
                      </h3>
                    </div>
                    <RouteStatusBadge
                      status={
                        recommendedRoute.risk === "LOW"
                          ? "safe"
                          : recommendedRoute.risk === "MEDIUM"
                          ? "medium"
                          : "high"
                      }
                      size="md"
                    />
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-4">
                    <div className="rounded-md border border-line bg-canvas p-4">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        <Icon name="gauge" size={13} /> Risk probability
                      </span>
                      <p
                        className="mt-1 font-mono text-2xl font-bold tabular-nums"
                        style={{
                          color:
                            recommendedRoute.risk === "LOW"
                              ? "#16a34a"
                              : recommendedRoute.risk === "MEDIUM"
                              ? "#d97706"
                              : "#dc2626",
                        }}
                      >
                        {recommendedRoute.riskScore}%
                      </p>
                    </div>
                    <div className="rounded-md border border-line bg-canvas p-4">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        <Icon name="clock" size={13} /> Estimated ETA
                      </span>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-navy">
                        {recommendedRoute.eta}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-md border border-line bg-wash p-4 text-[13px] text-muted">
                    <div className="flex items-center justify-between">
                      <span>Distance</span>
                      <strong className="text-ink">{recommendedRoute.distanceKm} km</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Risk level</span>
                      <strong
                        style={{
                          color:
                            recommendedRoute.risk === "LOW"
                              ? "#16a34a"
                              : recommendedRoute.risk === "MEDIUM"
                              ? "#d97706"
                              : "#dc2626",
                        }}
                      >
                        {riskLabel[recommendedRoute.risk]}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Road status</span>
                      <strong className="text-ink">{recommendedRoute.expectedRecovery}</strong>
                    </div>
                  </div>

                  <p className="mt-4 rounded-md border border-line bg-canvas p-3 text-[12px] leading-relaxed text-muted">
                    <strong className="text-navy">Why?</strong> {recommendedRoute.riskReasons.join(". ")}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href="/report"
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon name="alertTriangle" size={15} />
                      Report disruption
                    </Link>
                  </div>
                </div>
              )}

              {/* All routes list */}
              {isSearched && routes.length > 1 && (
                <div className="rounded-[10px] border border-line bg-surface p-5">
                  <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-navy">
                    All route options
                  </h3>
                  <p className="mb-3 text-[12px] text-muted">Click a route in the legend on the map to see its full details.</p>
                  <ul className="divide-y divide-line">
                    {routes.map((r, i) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                          <span className="text-sm font-medium text-ink">Route {i + 1}</span>
                          {r.isRecommended && (
                            <span className="rounded-full bg-safe-bg px-2 py-0.5 text-[10px] font-semibold text-safe">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[13px] text-muted">
                          {r.riskScore}% risk · {r.eta}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right column: real map */}
            <div className="w-full lg:col-span-8">
              <div className="overflow-hidden rounded-[10px] border border-line">
                <MapComponent
                  origin={submittedOrigin}
                  destination={submittedDest}
                  showControls={false}
                  onRoutesLoaded={handleRoutesLoaded}
                  height="560px"
                  mode="routes"
                />
              </div>
              <p className="mt-2 text-[12px] text-muted">
                Map powered by Mappls · Click on a route in the legend to see risk analysis
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
