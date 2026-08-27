"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteStatusBadge from "@/components/RouteStatusBadge";
import RouteModal, { type RouteModalData } from "@/components/RouteModal";
import Icon from "@/components/Icon";

const ROUTES_DATA: Record<string, RouteModalData> = {
  route1: {
    id: "route-1",
    routeName: "Route 1 (Bhalukpong – Dirang – Tawang)",
    status: "safe",
    riskProbability: "18%",
    eta: "8h 05m",
    distance: "448 km",
    isRecommended: true,
    recommendationReason: "Lowest predicted disruption probability based on rainfall forecasts and verified stable-slope telemetry.",
    riskReasons: [
      "Optimal terrain slope gradient along the Bhalukpong highway",
      "Clear road surface with no active landslide warnings",
      "Stable weather window predicted for the next 12 hours",
    ],
    recentIncidents: [{ title: "Minor road clearance completed", time: "3 days ago" }],
    expectedRecovery: "Fully operational · no delay expected",
  },
  route2: {
    id: "route-2",
    routeName: "Route 2 (Orang – Kalaktang Corridor)",
    status: "medium",
    riskProbability: "46%",
    eta: "7h 20m",
    distance: "412 km",
    isRecommended: false,
    recommendationReason: "Shorter distance but subject to moderate weather risk and ongoing bridge-reinforcement work.",
    riskReasons: [
      "Moderate rainfall expected in mountain passes within 4 hours",
      "Narrow hill section near Kalaktang prone to mudslides",
    ],
    recentIncidents: [
      { title: "Heavy rainfall reported in high pass", time: "Yesterday" },
      { title: "Single-lane traffic bottleneck", time: "12 hours ago" },
    ],
    expectedRecovery: "Approximately 6–8 hours to clear bottleneck",
  },
  route3: {
    id: "route-3",
    routeName: "Route 3 (Udalguri Direct Pass)",
    status: "high",
    riskProbability: "82%",
    eta: "6h 40m",
    distance: "385 km",
    isRecommended: false,
    recommendationReason: "Fastest distance, but high risk due to a recent active landslide blockage.",
    riskReasons: [
      "Active landslide reported 2 days ago blocking the outer lane",
      "Severe road-disruption probability over 80%",
    ],
    recentIncidents: [
      { title: "Active landslide reported near km 142", time: "2 days ago" },
      { title: "Heavy torrential rainfall & debris flow", time: "Yesterday" },
    ],
    expectedRecovery: "Approximately 18–24 hours for heavy-machinery clearing",
  },
};

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
  const [activeRoute, setActiveRoute] = useState<RouteModalData | null>(null);

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
            <h1 className="text-[22px] font-bold tracking-tight text-ink sm:text-[26px]">
              Route accessibility &amp; journey planner
            </h1>
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
                    <button
                      type="button"
                      onClick={() => setActiveRoute(ROUTES_DATA.route1)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
                    >
                      <Icon name="layers" size={15} />
                      View route details
                    </button>
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
                onRouteClick={(key) => setActiveRoute(ROUTES_DATA[key])}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Route detail modal */}
      <RouteModal route={activeRoute} onClose={() => setActiveRoute(null)} />
    </div>
  );
}
