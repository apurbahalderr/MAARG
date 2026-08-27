"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPlaceholder from "@/components/MapPlaceholder";
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
    recommendationReason: "Lowest predicted disruption probability based on rainfall forecasts.",
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
    recommendationReason: "Shorter distance but subject to moderate weather risk.",
    riskReasons: [
      "Moderate rainfall expected in mountain passes within 4 hours",
      "Narrow hill section near Kalaktang prone to mudslides",
    ],
    recentIncidents: [{ title: "Single-lane traffic bottleneck", time: "12 hours ago" }],
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
    recentIncidents: [{ title: "Active landslide reported near km 142", time: "2 days ago" }],
    expectedRecovery: "Approximately 18–24 hours for heavy-machinery clearing",
  },
};

interface Mission {
  missionId?: string;
  truckNo?: string;
  cargoType?: string;
  cargoQuantity?: string;
  origin?: string;
  destination?: string;
  targetArrival?: string;
  status?: string;
}

const CARGO_LABELS: Record<string, string> = {
  MEDICAL: "Medical supplies",
  FOOD: "Food grains",
  FUEL: "Fuel",
  AGRICULTURAL: "Agricultural",
  CONSTRUCTION: "Construction material",
  RELIEF: "Relief material",
  GENERAL: "General cargo",
};

function statusMeta(status?: string): { label: string; chip: string; dot: string } {
  switch (status) {
    case "IN_PROGRESS":
      return { label: "In transit", chip: "border-primary/25 bg-primary/8 text-primary", dot: "bg-primary" };
    case "COMPLETED":
      return { label: "Completed", chip: "border-safe-line bg-safe-bg text-safe", dot: "bg-safe" };
    case "CANCELLED":
      return { label: "Cancelled", chip: "border-danger-line bg-danger-bg text-danger", dot: "bg-danger" };
    case "PENDING":
    default:
      return { label: "Pending", chip: "border-warning-line bg-warning-bg text-warning", dot: "bg-warning" };
  }
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DriverMissionPage() {
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [truckNo, setTruckNo] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteModalData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/missions/my-mission");
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setErrorCode(res.status);
          setErrorMsg(data?.message ?? null);
          setLoading(false);
          return;
        }
        setTruckNo(data?.truckNo ?? null);
        setMissions(Array.isArray(data?.missions) ? data.missions : []);
        setLoading(false);
      } catch {
        if (!active) return;
        setErrorCode(0);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const primary =
    missions.find((m) => m.status === "IN_PROGRESS") ?? missions[0] ?? null;
  const others = primary ? missions.filter((m) => m !== primary) : [];

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/report"
        className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
      >
        <Icon name="alertTriangle" size={15} />
        Report incident
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-ink sm:text-[32px]">
                Your assigned missions
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                {truckNo
                  ? `Missions assigned to truck ${truckNo}, with live route recommendations.`
                  : "Pre-assigned transport parameters and live route recommendations."}
              </p>
            </div>
            {actions}
          </div>

          {/* States */}
          {loading ? (
            <div className="rounded-[10px] border border-line bg-surface p-10 text-center text-sm text-muted">
              Loading your missions…
            </div>
          ) : errorCode ? (
            <div className="mx-auto max-w-xl rounded-[10px] border border-line bg-surface p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-wash text-muted">
                <Icon name={errorCode === 401 ? "lock" : "info"} size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">
                {errorCode === 401
                  ? "Please sign in"
                  : errorCode === 403
                  ? "Driver access only"
                  : errorCode === 404
                  ? "No truck assigned yet"
                  : "Missions unavailable"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                {errorCode === 401
                  ? "Sign in with your driver account to view the missions assigned to your truck."
                  : errorCode === 403
                  ? "This view is for government-assigned drivers. Switch to your user dashboard for route planning."
                  : errorCode === 404
                  ? errorMsg ||
                    "No truck is linked to your driver profile yet. Contact your authority administrator."
                  : "We couldn't reach the mission service right now. Please try again shortly."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {errorCode === 401 && (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    Sign in
                    <Icon name="arrowRight" size={15} />
                  </Link>
                )}
                {errorCode === 403 && (
                  <Link
                    href="/user/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    Go to dashboard
                    <Icon name="arrowRight" size={15} />
                  </Link>
                )}
              </div>
            </div>
          ) : !primary ? (
            <div className="mx-auto max-w-xl rounded-[10px] border border-line bg-surface p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-wash text-muted">
                <Icon name="truck" size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">No missions yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                {truckNo
                  ? `No missions are currently assigned to truck ${truckNo}. New assignments will appear here.`
                  : "No missions are currently assigned. New assignments will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Left: mission details */}
              <div className="space-y-6 lg:col-span-5">
                <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
                  <div className="tricolor-strip" aria-hidden="true" />
                  <div className="p-6 sm:p-7">
                    <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                          Mission ID
                        </span>
                        <h2 className="mt-0.5 font-mono text-xl font-bold tracking-tight text-navy">
                          {primary.missionId || "—"}
                        </h2>
                      </div>
                      {(() => {
                        const s = statusMeta(primary.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.chip}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Route */}
                    <div className="mb-5 rounded-md border border-line bg-canvas p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Icon name="mapPin" size={13} />
                          </span>
                          <div className="my-1 h-10 w-0.5 bg-line-strong" />
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron text-white">
                            <Icon name="flag" size={12} />
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                              From (origin)
                            </span>
                            <p className="text-[15px] font-semibold text-ink">{(primary.origin || "—").toUpperCase()}</p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                              To (destination)
                            </span>
                            <p className="text-[15px] font-semibold text-ink">
                              {(primary.destination || "—").toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md border border-line bg-canvas p-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          <Icon name="shieldCheck" size={13} className="text-subtle" />
                          Cargo
                        </span>
                        <p className="mt-1 text-[15px] font-semibold text-ink">
                          {CARGO_LABELS[primary.cargoType ?? ""] || primary.cargoType || "—"}
                        </p>
                      </div>
                      <div className="rounded-md border border-line bg-canvas p-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          <Icon name="gauge" size={13} className="text-subtle" />
                          Quantity
                        </span>
                        <p className="mt-1 text-[15px] font-semibold text-ink">
                          {primary.cargoQuantity || "—"}
                        </p>
                      </div>
                      <div className="rounded-md border border-line bg-canvas p-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          <Icon name="truck" size={13} className="text-subtle" />
                          Truck
                        </span>
                        <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-ink">
                          {primary.truckNo || truckNo || "—"}
                        </p>
                      </div>
                      <div className="rounded-md border border-line bg-canvas p-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          <Icon name="clock" size={13} className="text-subtle" />
                          Target arrival
                        </span>
                        <p className="mt-1 text-[13px] font-semibold text-ink">
                          {formatDate(primary.targetArrival)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other missions */}
                {others.length > 0 && (
                  <div className="rounded-[10px] border border-line bg-surface p-6">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-navy">
                      Other missions for this truck
                    </h3>
                    <ul className="mt-3 divide-y divide-line">
                      {others.map((m, i) => {
                        const s = statusMeta(m.status);
                        return (
                          <li
                            key={m.missionId || i}
                            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">
                                {m.origin} → {m.destination}
                              </p>
                              <p className="font-mono text-[12px] text-subtle">{m.missionId}</p>
                            </div>
                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.chip}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right: map */}
              <div className="w-full lg:col-span-7">
                <MapPlaceholder
                  origin={primary.origin || "Origin"}
                  destination={primary.destination || "Destination"}
                  recommendedRouteName="Route 1"
                  recommendedRisk="18%"
                  recommendedEta="8h 05m"
                  onRouteClick={(key) => setActiveRoute(ROUTES_DATA[key])}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Route detail modal */}
      <RouteModal route={activeRoute} onClose={() => setActiveRoute(null)} />
    </div>
  );
}
