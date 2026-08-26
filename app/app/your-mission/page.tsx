import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteStatusBadge from "@/components/RouteStatusBadge";
import Icon, { type IconName } from "@/components/Icon";

const MISSION_STATS: { label: string; value: string; icon: IconName; mono?: boolean }[] = [
  { label: "Cargo", value: "Medical supplies", icon: "shieldCheck" },
  { label: "Cargo weight", value: "2,500 kg", icon: "gauge", mono: true },
  { label: "Truck registration", value: "AS01AB1234", icon: "truck", mono: true },
  { label: "Assigned driver", value: "Ramesh Kumar", icon: "user" },
];

export default function DriverMissionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-india/20 bg-india/10 px-3 py-1 text-xs font-semibold text-india">
                  <Icon name="truck" size={13} />
                  Government logistics fleet
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-line bg-danger-bg px-3 py-1 text-xs font-bold uppercase tracking-wide text-danger">
                  <Icon name="alertTriangle" size={13} />
                  Critical priority
                </span>
              </div>
              <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Active assigned driver mission
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                Pre-assigned government transportation parameters &amp; live GNSS accessibility
                recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/routes"
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-600"
              >
                <Icon name="layers" size={15} />
                View all routes
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-navy shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                <Icon name="alertTriangle" size={15} />
                Report incident
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-5">
              {/* Mission parameters */}
              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                <div className="tricolor-strip" aria-hidden="true" />
                <div className="p-6 sm:p-8">
                  <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Active mission ID
                      </span>
                      <h2 className="mt-0.5 font-mono text-2xl font-extrabold tracking-tight text-navy">
                        MAARG-1024
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-safe-line bg-safe-bg px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-safe">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-safe" />
                      In transit
                    </span>
                  </div>

                  {/* From -> To */}
                  <div className="mb-5 rounded-xl border border-line bg-canvas p-5">
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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
                            From (origin)
                          </span>
                          <p className="text-base font-bold text-ink">Guwahati (Assam Hub)</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
                            To (destination)
                          </span>
                          <p className="text-base font-bold text-ink">Tawang (Arunachal Sector)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stat grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {MISSION_STATS.map((s) => (
                      <div key={s.label} className="rounded-xl border border-line bg-canvas p-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          <Icon name={s.icon} size={13} className="text-subtle" />
                          {s.label}
                        </span>
                        <p className={`mt-1 text-base font-bold text-ink ${s.mono ? "font-mono tabular-nums" : ""}`}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Priority row */}
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
                        Priority level
                      </span>
                      <p className="text-sm font-extrabold text-danger sm:text-base">Critical emergency</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
                        Assigned route
                      </span>
                      <p className="text-sm font-bold text-safe sm:text-base">Route 1 · safest</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation box */}
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                      <span className="h-[3px] w-5 rounded-full bg-saffron" />
                      MAARG recommendation
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-navy">Route 1 (Bhalukpong Corridor)</h3>
                  </div>
                  <RouteStatusBadge status="safe" size="md" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-line bg-canvas p-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      <Icon name="gauge" size={13} /> Risk probability
                    </span>
                    <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-safe">18%</p>
                  </div>
                  <div className="rounded-xl border border-line bg-canvas p-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      <Icon name="clock" size={13} /> Estimated ETA
                    </span>
                    <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-navy">8h 05m</p>
                  </div>
                </div>

                <p className="mt-4 flex gap-2.5 rounded-xl border border-line bg-wash p-4 text-xs leading-relaxed text-muted sm:text-sm">
                  <Icon name="lightbulb" size={16} className="mt-0.5 shrink-0 text-saffron-600" />
                  <span>
                    Route 1 has the lowest predicted disruption probability based on real-time
                    rainfall sensors, mountain-slope telemetry, historical landslide datasets, and
                    verified field reports.
                  </span>
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
                  <Link
                    href="/routes"
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 sm:text-sm"
                  >
                    <Icon name="layers" size={15} />
                    View all routes
                  </Link>
                  <Link
                    href="/report"
                    className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3.5 text-xs font-semibold text-navy shadow-sm transition-colors hover:border-primary hover:text-primary sm:text-sm"
                  >
                    <Icon name="alertTriangle" size={15} />
                    Report incident
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column: map */}
            <div className="w-full lg:col-span-7">
              <MapPlaceholder
                origin="Guwahati"
                destination="Tawang"
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
