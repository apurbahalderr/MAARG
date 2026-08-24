import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-5xl">

        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-wide">
            MAARG
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Smart Logistics & Accessibility Intelligence Platform
          </p>

          <p className="text-slate-500 mt-2">
            North Eastern Region
          </p>
        </div>

        {/* Selection */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Government */}
          <Link
            href="/government/login"
            className="group"
          >
            <div className="border border-slate-700 bg-slate-900 rounded-2xl p-10
                            hover:border-blue-500 hover:bg-slate-800
                            transition-all duration-300">

              <div className="text-5xl mb-6">
                🏛️
              </div>

              <h2 className="text-2xl font-semibold">
                Government / Authority
              </h2>

              <p className="text-slate-400 mt-3">
                Manage logistics missions, assign trucks, monitor
                routes and respond to accessibility incidents.
              </p>

              <div className="mt-8 text-blue-400 group-hover:text-blue-300">
                Continue →
              </div>
            </div>
          </Link>

          {/* User */}
          <Link
            href="/user/select"
            className="group"
          >
            <div className="border border-slate-700 bg-slate-900 rounded-2xl p-10
                            hover:border-green-500 hover:bg-slate-800
                            transition-all duration-300">

              <div className="text-5xl mb-6">
                👤
              </div>

              <h2 className="text-2xl font-semibold">
                User
              </h2>

              <p className="text-slate-400 mt-3">
                Access route information, accessibility alerts,
                and logistics services.
              </p>

              <div className="mt-8 text-green-400 group-hover:text-green-300">
                Continue →
              </div>
            </div>
          </Link>

        </div>

        <p className="text-center text-slate-600 mt-12 text-sm">
          AI-Based Smart Logistics & Accessibility Intelligence Platform
        </p>

      </div>
    </main>
  );
}