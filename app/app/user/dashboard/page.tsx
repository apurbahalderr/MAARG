"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteStatusBadge from "@/components/RouteStatusBadge";
import Icon from "@/components/Icon";

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-navy";

const LOCATIONS = [
  "Guwahati", "Tawang", "Shillong", "Tezpur", "Silchar", "Dibrugarh",
  "Itanagar", "Kohima", "Aizawl", "Gangtok", "Imphal", "Agartala",
];

export default function UserDashboardPage() {
  const [source, setSource] = useState("Guwahati");
  const [destination, setDestination] = useState("Tawang");
  const [isSearched, setIsSearched] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckRoute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSearched(true);
    }, 400);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
              Civilian intelligence portal
            </span>
            <h1 className="mt-2 text-[26px] font-bold tracking-tight text-ink sm:text-[32px]">
              Route accessibility &amp; journey planner
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">
              Select your origin and destination to evaluate AI risk forecasts, landslide risks, and
              accessibility status across North East corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-5">
              {/* Journey form */}
              <div className="rounded-[10px] border border-line bg-surface p-6 sm:p-7">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy">
                  <Icon name="navigation" size={18} className="text-primary" />
                  Plan journey route
                </h2>

                <form onSubmit={handleCheckRoute} className="space-y-4">
                  <div>
                    <label className={labelClass}>Source location</label>
                    <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} disabled={loc === destination}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Destination location</label>
                    <select value={destination} onChange={(e) => setDestination(e.target.value)} className={inputClass}>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} disabled={loc === source}>
                          {loc}
                        </option>
                      ))}
                    </select>
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

              {/* Recommendation card */}
              {isSearched && (
                <div className="animate-fadeIn rounded-[10px] border border-line bg-surface p-6 sm:p-7">
                  <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
                        MAARG recommendation
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-navy">Route 1 (Bhalukpong–Dirang)</h3>
                    </div>
                    <RouteStatusBadge status="safe" size="md" />
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-4">
                    <div className="rounded-md border border-line bg-canvas p-4">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        <Icon name="gauge" size={13} /> Risk probability
                      </span>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-safe">18%</p>
                    </div>
                    <div className="rounded-md border border-line bg-canvas p-4">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                        <Icon name="clock" size={13} /> Estimated ETA
                      </span>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-navy">8h 05m</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-md border border-line bg-wash p-4 text-[13px] text-muted sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span>Accessibility status</span>
                      <strong className="font-semibold text-safe">Fully accessible</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weather gradient</span>
                      <strong className="text-ink">Light fog near Sela Pass</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Disruption forecast</span>
                      <strong className="text-ink">Low risk (&lt; 20%)</strong>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
                    <Link
                      href="/routes"
                      className="flex flex-1 items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
                    >
                      <Icon name="layers" size={15} />
                      View all candidate routes
                    </Link>
                    <Link
                      href="/report"
                      className="flex items-center justify-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon name="alertTriangle" size={15} />
                      Report disruption
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: map */}
            <div className="w-full lg:col-span-7">
              <MapPlaceholder
                origin={source}
                destination={destination}
                recommendedRouteName="Route 1"
                recommendedRisk="18%"
                recommendedEta="8h 05m"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
