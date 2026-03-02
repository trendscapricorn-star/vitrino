import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* 🔹 Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-semibold">
            Vitrino
          </div>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 🔹 Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Your Logo. Your Webpage. Your Catalog.
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Launch your own branded product catalog with smart filters and
          organized categories — live in under 15 minutes.
          No coding. No e-commerce complexity.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-black text-white px-8 py-3 rounded-lg hover:opacity-90"
          >
            Create Your Catalog
          </Link>

          <Link
            href="/login"
            className="border px-8 py-3 rounded-lg hover:bg-gray-100"
          >
            Vendor Login
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          ⚡ 7-day free trial • No setup required • Cancel anytime
        </p>
      </section>

      {/* 🔹 Features Section */}
      <section className="bg-white py-20 border-t">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">

          <div>
            <h3 className="text-lg font-semibold mb-3">
              🌐 Your Dedicated Webpage
            </h3>
            <p className="text-gray-600 text-sm">
              Get your own branded link like vitrino.in/yourbrand
              to share instantly with buyers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">
              🎨 Your Logo & Branding
            </h3>
            <p className="text-gray-600 text-sm">
              Upload your logo, banner, and business details —
              make the catalog completely yours.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">
              🗂 Smart Product Filters
            </h3>
            <p className="text-gray-600 text-sm">
              Organize products using custom attributes and filters
              so buyers can find what they need instantly.
            </p>
          </div>

        </div>
      </section>

      {/* 🔹 Difference Section */}
      <section className="bg-zinc-50 py-20 border-t">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-semibold mb-6">
            Built for Product Businesses — Not E-commerce Stores
          </h2>

          <p className="text-gray-600 mb-10">
            Vitrino is designed for businesses that need a structured,
            professional catalog without shopping carts or payment gateways.
            Just showcase your products and receive direct inquiries.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>⚡ Live in under 15 minutes</div>
            <div>🤖 AI-assisted product setup</div>
            <div>📩 Direct buyer inquiries</div>
          </div>

        </div>
      </section>

      {/* 🔹 CTA Section */}
      <section className="py-20 text-center border-t bg-white">
        <h2 className="text-2xl font-semibold mb-6">
          Ready to launch your own branded catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-10 py-4 rounded-lg hover:opacity-90"
        >
          Start Free
        </Link>
      </section>

      {/* 🔹 Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vitrino. All rights reserved.
      </footer>

    </div>
  );
}