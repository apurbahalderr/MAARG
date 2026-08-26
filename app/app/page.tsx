import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountTypeCard from "@/components/AccountTypeCard";
import SectionHeader from "@/components/SectionHeader";
import MapPlaceholder from "@/components/MapPlaceholder";
import Icon, { type IconName } from "@/components/Icon";

const ABOUT_ITEMS: { title: string; desc: string; icon: IconName }[] = [
  { title: "Heavy rainfall", desc: "Monsoon cloudburst & flash-flood detection.", icon: "cloudRain" },
  { title: "Landslides", desc: "AI-predicted hillside slope instability risk.", icon: "mountain" },
  { title: "Road damage", desc: "Community & field-verified obstruction reporting.", icon: "cone" },
  { title: "Infrastructure", desc: "Bridge loading & corridor bottleneck monitoring.", icon: "bridge" },
];

const CAPABILITIES: { title: string; desc: string; icon: IconName }[] = [
  {
    title: "Route intelligence",
    desc: "AI-assisted route risk analysis and alternate recommendations, dynamically ranked by safety over speed.",
    icon: "route",
  },
  {
    title: "Disruption prediction",
    desc: "Forecasts disruptions from weather models, terrain slope, historical incident patterns, and field telemetry.",
    icon: "barChart",
  },
  {
    title: "Logistics tracking",
    desc: "Monitors government-assigned vehicles carrying essential medical supplies, food grains, and critical cargo.",
    icon: "truck",
  },
  {
    title: "Incident reporting",
    desc: "Lets authenticated drivers and field personnel report blockages with precise location tags and photographs.",
    icon: "alertTriangle",
  },
  {
    title: "Dynamic ETA",
    desc: "Estimates realistic arrival times accounting for gradients, weather impact, and real-time checkpoint delays.",
    icon: "clock",
  },
  {
    title: "Accessibility intelligence",
    desc: "A clear overview of accessible, partially accessible, and severely disrupted transit corridors region-wide.",
    icon: "globe",
  },
];

const WORKFLOW: { step: string; name: string; desc: string; icon: IconName }[] = [
  { step: "01", name: "Monitor", desc: "Sensors, satellite weather & field reports", icon: "signal" },
  { step: "02", name: "Predict", desc: "AI models analyse landslide & rainfall risk", icon: "activity" },
  { step: "03", name: "Compare", desc: "Evaluate safety, distance & ETA per route", icon: "layers" },
  { step: "04", name: "Optimise", desc: "Recommend the safest path by cargo priority", icon: "route" },
  { step: "05", name: "Track", desc: "Live GNSS tracking & milestone alerts", icon: "navigation" },
  { step: "06", name: "Respond", desc: "Reroute trucks & dispatch emergency crews", icon: "shieldCheck" },
];

const HERO_STATS = [
  { value: "8", unit: "States", label: "NER coverage", tone: "text-navy" },
  { value: "94.2%", unit: "", label: "Risk accuracy", tone: "text-india" },
  { value: "NavIC", unit: "ready", label: "GNSS / Mappls", tone: "text-primary" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1">
        {/* ================= HERO ================= */}
        <section className="relative w-full overflow-hidden border-b border-line bg-surface py-12 lg:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage: `linear-gradient(rgba(18,76,140,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(18,76,140,0.05) 1px, transparent 1px)`,
              backgroundSize: "44px 44px",
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left content */}
              <div className="space-y-6 lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-safe-line bg-safe-bg px-3.5 py-1 text-xs font-semibold text-safe">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-safe" />
                  <span>North Eastern Region Intelligence Platform</span>
                </div>

                <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl">
                  Smarter routes.
                  <br />
                  Safer logistics.
                  <br />
                  <span className="text-primary">Stronger connectivity.</span>
                </h1>

                <div className="tricolor-strip w-28 rounded-full" aria-hidden="true" />

                <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                  MAARG applies AI, GIS, real-time field data, and terrain
                  intelligence to predict road risks, optimise logistics
                  missions, and keep transport accessible across the North
                  Eastern Region.
                </p>

                <div className="flex flex-wrap gap-3.5 pt-1">
                  <a
                    href="#account-selection"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
                  >
                    Get started
                    <Icon name="arrowRight" size={16} />
                  </a>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    Explore MAARG
                  </a>
                </div>

                {/* Trust stats */}
                <div className="grid grid-cols-3 gap-4 border-t border-line pt-6 text-center sm:text-left">
                  {HERO_STATS.map((s) => (
                    <div key={s.label}>
                      <span className={`block font-mono text-xl font-bold tabular-nums sm:text-2xl ${s.tone}`}>
                        {s.value}
                        {s.unit && (
                          <span className="ml-1 text-sm font-semibold text-subtle">{s.unit}</span>
                        )}
                      </span>
                      <span className="text-xs text-muted">{s.label}</span>
                    </div>
                  ))}
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

        {/* ================= ABOUT ================= */}
        <section id="about" className="w-full bg-canvas py-16">
          <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
            <SectionHeader
              badge="About MAARG"
              title="Built for the North Eastern Region"
              subtitle="MAARG empowers government authorities, logistics operators, drivers, and citizens to navigate difficult terrain, extreme weather, and unpredictable mountain-road disruptions."
              centered
            />

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ABOUT_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all hover:border-line-strong hover:shadow-md"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-wash text-primary">
                    <Icon name={item.icon} size={24} />
                  </span>
                  <h4 className="text-base font-bold text-navy">{item.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CAPABILITIES ================= */}
        <section className="w-full border-y border-line bg-surface py-16">
          <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
            <SectionHeader
              badge="Capabilities"
              title="Intelligence platform capabilities"
              subtitle="Six core pillars built to ensure uninterrupted transport of essential supplies and continuous citizen-journey safety."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-line bg-canvas p-7 shadow-sm transition-all hover:border-primary/40 hover:bg-surface hover:shadow-md"
                >
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-primary shadow-sm transition-colors group-hover:border-primary/30">
                    <Icon name={feature.icon} size={24} />
                  </span>
                  <h3 className="text-lg font-bold text-navy">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="w-full bg-canvas py-16">
          <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
            <SectionHeader
              badge="Workflow"
              title="How MAARG operates"
              subtitle="An end-to-end operational pipeline that keeps logistics missions moving safely."
              centered
            />

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {WORKFLOW.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-line bg-surface p-6 text-center shadow-sm transition-all hover:border-line-strong hover:shadow-md"
                >
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-wash text-primary">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span className="mt-4 inline-block font-mono text-[11px] font-bold tabular-nums tracking-widest text-subtle">
                    STEP {item.step}
                  </span>
                  <h4 className="mt-1 text-lg font-bold text-navy">{item.name}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ACCOUNT SELECTION ================= */}
        <section id="account-selection" className="w-full border-t border-line bg-surface py-20">
          <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
            <SectionHeader
              badge="Get started"
              title="How would you like to use MAARG?"
              subtitle="Select your operational role to access dedicated tools and dashboards."
              centered
            />

            <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
              <AccountTypeCard
                badge="Authorised portal"
                icon="landmark"
                title="Government / Authority"
                description="Manage logistics missions, assign vehicles, monitor essential-goods transport, and respond to region-wide road disruptions."
                buttonText="Continue as Government"
                href="/government"
                variant="india"
              />
              <AccountTypeCard
                badge="Public & logistics"
                icon="user"
                title="User & Driver portal"
                description="Check route accessibility, plan civilian journeys, monitor field conditions, or access assigned driver logistics missions."
                buttonText="Continue as User"
                href="/user/select"
                variant="primary"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
