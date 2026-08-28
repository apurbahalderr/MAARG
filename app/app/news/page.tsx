import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsFeed from "@/components/NewsFeed";
import SectionHeader from "@/components/SectionHeader";

export default function NewsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
      <Navbar />

      <main id="main" className="w-full flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          
          <SectionHeader
            badge="Live Feed"
            title="Public Disaster & Weather Advisories"
            subtitle="Real-time aggregation of news and alerts affecting logistics and transport across the North Eastern Region. Open for public awareness."
          />

          <div className="mx-auto mt-10 max-w-4xl">
            <NewsFeed />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
