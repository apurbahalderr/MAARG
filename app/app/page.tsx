import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountTypeCard from "@/components/AccountTypeCard";
import SectionHeader from "@/components/SectionHeader";
import MapPlaceholder from "@/components/MapPlaceholder";
import Icon, { type IconName } from "@/components/Icon";

const HAZARDS: { label: string; icon: IconName }[] = [
  { label: "Heavy rainfall", icon: "cloudRain" },
  { label: "Landslides", icon: "mountain" },
  { label: "Road damage", icon: "cone" },
  { label: "Bridge & infrastructure", icon: "bridge" },
];

const CAPABILITIES: { title: string; desc: string; icon: IconName }[] = [
  {
    title: "Route intelligence",
    desc: "AI-assisted route risk analysis and alternate recommendations, ranked by safety over speed.",
    icon: "route",
  },
  {
    title: "Disruption prediction",
    desc: "Forecasts disruptions from weather models, terrain slope, historical incidents, and field telemetry.",
    icon: "barChart",
  },
  {
    title: "Logistics tracking",
    desc: "Monitors government-assigned vehicles carrying medical supplies, food grains, and critical cargo.",
    icon: "truck",
  },
  {
    title: "Incident reporting",
    desc: "Lets authenticated drivers and field staff report blockages with precise location tags.",
    icon: "alertTriangle",
  },
  {
    title: "Dynamic ETA",
    desc: "Estimates realistic arrival times accounting for gradient, weather impact, and checkpoint delays.",
    icon: "clock",
  },
  {
    title: "Accessibility overview",
    desc: "A clear region-wide view of accessible, partially accessible, and disrupted transit corridors.",
    icon: "globe",
  },
];

const WORKFLOW: { step: string; name: string; desc: string; icon: IconName }[] = [
  { step: "01", name: "Monitor", desc: "Sensors, satellite weather and field reports", icon: "signal" },
  { step: "02", name: "Predict", desc: "AI models analyse landslide and rainfall risk", icon: "activity" },
  { step: "03", name: "Compare", desc: "Evaluate safety, distance and ETA per route", icon: "layers" },
  { step: "04", name: "Optimise", desc: "Recommend the safest path by cargo priority", icon: "route" },
  { step: "05", name: "Track", desc: "Live GNSS tracking and milestone alerts", icon: "navigation" },
  { step: "06", name: "Respond", desc: "Reroute vehicles and dispatch response crews", icon: "shieldCheck" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1">
        {/* ================= HERO ================= */}
        <section className="w-full border-b border-line bg-surface">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Left content */}
              <div className="lg:col-span-5">
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-primary">
                  North Eastern Region intelligence platform
                </p>
                <h1 className="mt-3 text-[34px] font-bold leading-[1.14] tracking-tight text-ink sm:text-[44px]">
                  Smarter routes.<br />
                  Safer logistics.<br />
                  <span className="text-primary">Stronger connectivity.</span>
                </h1>
                <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted">
                  MAARG applies AI, GIS, and real-time field data to predict road risks, optimise
                  logistics missions, and keep transport accessible across the North Eastern Region.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#choose"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    Choose your portal
                    <Icon name="arrowRight" size={16} />
                  </a>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
                  >
                    See how it works
                  </a>
                </div>

                {/* Hazard focus */}
                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
                    Built to anticipate
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5">
                    {HAZARDS.map((h) => (
                      <span key={h.label} className="inline-flex items-center gap-1.5 text-[13.5px] text-muted">
                        <Icon name={h.icon} size={16} className="text-primary" />
                        {h.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right visual */}
              <div className="w-full lg:col-span-7">
                <MapPlaceholder
                  origin="Guwahati"
                  destination="Tawang"
                  recommendedRouteName="Route 1 (Bhalukpong–Dirang)"
                  recommendedRisk="18%"
                  recommendedEta="8h 05m"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= CHOOSE PORTAL (prominent, high on page) ============= */}
        <section id="choose" className="w-full border-b border-line bg-canvas">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-8 lg:px-12">
            <SectionHeader
              badge="Get started"
              title="Choose how you'll use MAARG"
              subtitle="Two entry points, tailored to what you do. Select the portal that matches your role."
              centered
            />

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              <AccountTypeCard
                size="lg"
                badge="Authorised access"
                icon="landmark"
                title="Government / Authority"
                description="For state transport, disaster-response, and essential-goods supply teams."
                features={[
                  "Create and assign logistics missions",
                  "Register trucks, drivers and cargo priorities",
                  "Monitor the fleet live via GNSS / NavIC",
                  "Issue road-hazard and landslide advisories",
                ]}
                buttonText="Enter Government portal"
                href="/government"
                variant="india"
              />
              <AccountTypeCard
                size="lg"
                badge="Public & logistics"
                icon="users"
                title="User & Driver"
                description="For citizens planning journeys and government-assigned drivers on active missions."
                features={[
                  "Check route accessibility and risk forecasts",
                  "Plan safe civilian journeys across the NER",
                  "Access your assigned driver mission",
                  "Report road incidents from the field",
                ]}
                buttonText="Continue as User / Driver"
                href="/user/select"
                variant="primary"
              />
            </div>
          </div>
        </section>

        {/* ================= CAPABILITIES ================= */}
        <section id="about" className="w-full border-b border-line bg-surface">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-8 lg:px-12">
            <SectionHeader
              badge="Capabilities"
              title="What the platform does"
              subtitle="Six core capabilities that keep essential supplies moving and journeys safe across difficult terrain."
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[10px] border border-line bg-surface p-6 transition-colors hover:border-line-strong"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-wash text-primary">
                    <Icon name={feature.icon} size={22} />
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold text-navy">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="w-full border-b border-line bg-canvas">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-8 lg:px-12">
            <SectionHeader
              badge="Workflow"
              title="How MAARG operates"
              subtitle="An end-to-end pipeline that keeps logistics missions moving safely, from monitoring to response."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW.map((item) => (
                <div key={item.step} className="rounded-[10px] border border-line bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-wash text-primary">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span className="font-mono text-[13px] font-semibold tabular-nums text-subtle">
                      {item.step}
                    </span>
                  </div>
                  <h4 className="mt-4 text-[17px] font-semibold text-navy">{item.name}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CLOSING CTA ================= */}
        <section className="w-full bg-surface">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-8 lg:px-12">
            <div className="flex flex-col items-center justify-between gap-5 rounded-[10px] border border-line bg-canvas p-8 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="text-xl font-semibold text-navy">Ready to plan a safer route?</h3>
                <p className="mt-1.5 text-sm text-muted">
                  Pick your portal to check accessibility, manage missions, or report a road incident.
                </p>
              </div>
              <a
                href="#choose"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Choose your portal
                <Icon name="arrowRight" size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
