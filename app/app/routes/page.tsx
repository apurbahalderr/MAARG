import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteCard from "@/components/RouteCard";
import SectionHeader from "@/components/SectionHeader";
import Icon from "@/components/Icon";
import Link from "next/link";

export default function RoutesPage() {
  const routesData = [
    {
      id: "route-1",
      routeName: "Route 1 (Bhalukpong – Dirang – Tawang)",
      status: "safe" as const,
      riskProbability: "18%",
      eta: "8h 05m",
      distance: "448 km",
      isRecommended: true,
      recommendationReason:
        "Lowest predicted disruption probability based on rainfall forecasts and verified stable-slope telemetry.",
      riskReasons: [
        "Optimal terrain slope gradient along the Bhalukpong highway",
        "Clear road surface with no active landslide warnings",
        "Stable weather window predicted for the next 12 hours",
        "High emergency-response accessibility if needed",
      ],
      recentIncidents: [{ title: "Minor road clearance completed", time: "3 days ago" }],
      expectedRecovery: "Fully operational · no delay expected",
    },
    {
      id: "route-2",
      routeName: "Route 2 (Orang – Kalaktang Corridor)",
      status: "medium" as const,
      riskProbability: "46%",
      eta: "7h 20m",
      distance: "412 km",
      isRecommended: false,
      recommendationReason:
        "Shorter distance but subject to moderate weather risk and ongoing bridge-reinforcement work.",
      riskReasons: [
        "Moderate rainfall expected in mountain passes within 4 hours",
        "Narrow hill section near Kalaktang prone to mudslides",
        "Ongoing infrastructure maintenance on a single-lane bridge",
      ],
      recentIncidents: [
        { title: "Heavy rainfall reported in high pass", time: "Yesterday" },
        { title: "Single-lane traffic bottleneck", time: "12 hours ago" },
      ],
      expectedRecovery: "Approximately 6–8 hours to clear bottleneck",
    },
    {
      id: "route-3",
      routeName: "Route 3 (Udalguri Direct Pass)",
      status: "high" as const,
      riskProbability: "82%",
      eta: "6h 40m",
      distance: "385 km",
      isRecommended: false,
      recommendationReason:
        "Fastest distance, but high risk due to a recent active landslide blockage and severe storm warnings.",
      riskReasons: [
        "Active landslide reported 2 days ago blocking the outer lane",
        "Heavy rainfall yesterday causing flash mudflow",
        "High terrain-slope instability score (8.4/10)",
        "Severe road-disruption probability over 80%",
      ],
      recentIncidents: [
        { title: "Active landslide reported near km 142", time: "2 days ago" },
        { title: "Heavy torrential rainfall & debris flow", time: "Yesterday" },
      ],
      expectedRecovery: "Approximately 18–24 hours for heavy-machinery clearing",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-[13px] text-muted" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Icon name="chevronRight" size={13} className="text-subtle" />
            <span className="font-semibold text-navy">Route risk comparison</span>
          </nav>

          <SectionHeader
            badge="AI evaluation"
            title="Candidate route comparison"
            subtitle="Comparing candidate transit corridors for Guwahati to Tawang. MAARG prioritises safety and risk minimisation over raw distance."
          />

          {/* Routing principle banner */}
          <div className="mb-8 flex items-start gap-4 rounded-[10px] border border-primary/20 bg-primary/5 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Icon name="lightbulb" size={22} />
            </span>
            <div>
              <h4 className="text-base font-semibold text-navy">Key MAARG routing principle</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-sm">
                Note that <strong className="text-ink">Route 3 is the fastest</strong> (6h 40m) but
                carries an <strong className="text-danger">82% high-risk</strong> disruption
                probability. MAARG recommends <strong className="text-ink">Route 1 (8h 05m)</strong>{" "}
                because safety, terrain stability, and cargo protection take absolute priority for
                critical logistics.
              </p>
            </div>
          </div>

          {/* Route cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {routesData.map((route) => (
              <RouteCard key={route.id} {...route} />
            ))}
          </div>

          {/* Report link */}
          <div className="mx-auto mt-10 max-w-2xl rounded-[10px] border border-line bg-surface p-8 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-wash text-saffron-600">
              <Icon name="alertTriangle" size={22} />
            </span>
            <h4 className="text-base font-semibold text-navy">Noticed a new hazard on your route?</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-sm">
              Help keep North East routes safe by submitting an official field report with a precise
              location tag.
            </p>
            <div className="mt-5">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 rounded-md bg-india px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-india-600"
              >
                <span>Report an incident now</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
