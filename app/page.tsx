import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vitrino | Product Catalog Platform",
  description:
    "Manufacturers create digital catalogs. Distributors combine multiple brands into one catalog app.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-100 text-zinc-900">

      {/* Header */}

      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="text-xl font-bold tracking-tight">
            Vitrino
          </div>

          <div className="flex gap-4 items-center">

            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition"
            >
              Get Started
            </Link>

          </div>
        </div>
      </header>


      {/* Hero */}

      <section className="max-w-6xl mx-auto px-6 py-28 text-center">

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          The Smart Catalog Platform
          <span className="block text-gray-500 mt-2">
            for Manufacturers & Distributors
          </span>
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Manufacturers upload products once. Distributors combine multiple
          brands into one powerful catalog app for retailers.
        </p>

        <div className="flex justify-center gap-4">

          <Link
            href="/signup"
            className="bg-black text-white px-8 py-3 rounded-xl hover:scale-105 transition shadow-lg"
          >
            Create Your Catalog
          </Link>

          <Link
            href="/login"
            className="border px-8 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            Vendor Login
          </Link>

        </div>

        <p className="text-xs text-gray-500 mt-6">
          ⚡ 7-day free trial • No setup required • Cancel anytime
        </p>

      </section>


      {/* Social Proof */}

      <section className="bg-white border-t py-16">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <p className="text-sm text-gray-500 mb-10">
            Used by businesses across multiple industries
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-sm text-gray-600">

            <div className="bg-zinc-50 p-4 rounded-lg">Garments</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Hardware</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Electronics</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Textiles</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Building Materials</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Wholesale Trade</div>

          </div>

        </div>

      </section>


      {/* Trust Section */}

      <section className="bg-white border-t py-20">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-12">
            Why Businesses Use Vitrino
          </h2>

          <div className="grid md:grid-cols-4 gap-10 text-gray-600 text-sm">

            <div className="bg-zinc-50 p-6 rounded-xl shadow hover:shadow-md transition">
              ⚡ Launch catalogs in minutes
            </div>

            <div className="bg-zinc-50 p-6 rounded-xl shadow hover:shadow-md transition">
              📱 Works perfectly on mobile
            </div>

            <div className="bg-zinc-50 p-6 rounded-xl shadow hover:shadow-md transition">
              🔍 Smart filters for products
            </div>

            <div className="bg-zinc-50 p-6 rounded-xl shadow hover:shadow-md transition">
              🔔 Product notifications
            </div>

          </div>

        </div>

      </section>


      {/* Role Cards */}

      <section className="bg-white py-24 border-t">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">

          <div className="border rounded-2xl p-10 bg-gradient-to-b from-white to-zinc-50 shadow hover:shadow-xl transition">

            <h2 className="text-xl font-semibold mb-6">
              🏭 For Manufacturers
            </h2>

            <ul className="text-sm text-gray-600 space-y-3">
              <li>✔ Upload products once</li>
              <li>✔ Create categories & filters</li>
              <li>✔ Share branded catalog link</li>
              <li>✔ Send product notifications</li>
              <li>✔ Allow distributors to showcase products</li>
            </ul>

            <p className="text-sm text-gray-400 mt-6">
              Example: vitrino.in/yourbrand
            </p>

          </div>


          <div className="border rounded-2xl p-10 bg-gradient-to-b from-white to-zinc-50 shadow hover:shadow-xl transition">

            <h2 className="text-xl font-semibold mb-6">
              📦 For Distributors
            </h2>

            <ul className="text-sm text-gray-600 space-y-3">
              <li>✔ Combine multiple manufacturers</li>
              <li>✔ Multi-brand catalog app</li>
              <li>✔ Company → Category → Product structure</li>
              <li>✔ Perfect for retailers & dealers</li>
              <li>✔ Always synced with manufacturer updates</li>
            </ul>

          </div>

        </div>

      </section>


      {/* How It Works */}

      <section className="py-24 bg-zinc-50 border-t">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-16">
            How Vitrino Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">

            <div className="bg-white p-8 rounded-xl shadow">
              <div className="text-4xl font-bold mb-4">1</div>
              <p className="text-gray-600">
                Sign up as manufacturer or distributor
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow">
              <div className="text-4xl font-bold mb-4">2</div>
              <p className="text-gray-600">
                Upload or connect product catalogs
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow">
              <div className="text-4xl font-bold mb-4">3</div>
              <p className="text-gray-600">
                Share your catalog app with buyers
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* Pricing */}

      <section className="bg-white py-24 border-t">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-16">
            Simple Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="border rounded-2xl p-8 bg-zinc-50 shadow">
              <h3 className="text-lg font-semibold mb-2">Monthly</h3>
              <p className="text-4xl font-bold mb-4">₹399</p>
              <p className="text-sm text-gray-500 mb-6">per month</p>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg text-sm">
                Start Monthly
              </Link>
            </div>

            <div className="border-2 border-black rounded-2xl p-8 shadow-xl bg-white scale-105">
              <h3 className="text-lg font-semibold mb-2">Quarterly</h3>
              <p className="text-4xl font-bold mb-4">₹1,099</p>
              <p className="text-sm text-gray-500 mb-6">every 3 months</p>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg text-sm">
                Choose Quarterly
              </Link>
            </div>

            <div className="border rounded-2xl p-8 bg-zinc-50 shadow">
              <h3 className="text-lg font-semibold mb-2">Yearly</h3>
              <p className="text-4xl font-bold mb-4">₹3,999</p>
              <p className="text-sm text-gray-500 mb-6">per year</p>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg text-sm">
                Choose Yearly
              </Link>
            </div>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="py-24 text-center bg-gradient-to-r from-black to-zinc-800 text-white">

        <h2 className="text-3xl font-semibold mb-6">
          Ready to launch your catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-white text-black px-10 py-4 rounded-xl hover:scale-105 transition"
        >
          Start Free
        </Link>

      </section>


      {/* Footer */}

      <footer className="border-t bg-white py-8 text-center text-sm text-gray-500">

        © {new Date().getFullYear()} Vitrino. All rights reserved.

        <div className="mt-2">
          Payments securely processed via Razorpay.
        </div>

      </footer>

    </div>
  );
}