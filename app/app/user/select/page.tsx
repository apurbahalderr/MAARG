import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountTypeCard from "@/components/AccountTypeCard";
import SectionHeader from "@/components/SectionHeader";
import Icon from "@/components/Icon";
import Link from "next/link";

export default function UserSelectPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Icon name="chevronRight" size={13} className="text-subtle" />
            <span className="font-semibold text-navy">User portal selection</span>
          </nav>

          <SectionHeader
            badge="User portal"
            title="Choose your user type"
            subtitle="Select whether you are using MAARG for civilian travel planning or as a government-assigned essential-goods driver."
            centered
          />

          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            <AccountTypeCard
              badge="Civilian journeys"
              icon="car"
              title="Normal user"
              description="For families, students, office workers, and citizens who want to check route accessibility, view risk forecasts, and plan safe journeys across the North East."
              buttonText="Continue as User"
              href="/user/dashboard"
              variant="primary"
            />
            <AccountTypeCard
              badge="Essential-supply fleet"
              icon="truck"
              title="Truck driver"
              description="For government-assigned drivers transporting medical supplies, rations, and critical cargo across active assigned missions."
              buttonText="Continue as Driver"
              href="/your-mission"
              variant="india"
            />
          </div>

          {/* Quick notice */}
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
            <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted">
              <Icon name="landmark" size={16} className="text-india" />
              Are you an authorised government logistics manager?
              <Link
                href="/government"
                className="inline-flex items-center gap-1 font-bold text-india transition-colors hover:text-india-600"
              >
                Access Government / Authority portal
                <Icon name="arrowRight" size={14} />
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
