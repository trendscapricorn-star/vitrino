import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vitrino | Product Catalog Platform for Manufacturers & Distributors",
  description:
    "Manufacturers create digital catalogs. Distributors combine multiple brands in one app. Launch your catalog in minutes.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* Header */}

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
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
            >
              Get Started
            </Link>

          </div>
        </div>
      </header>

      {/* Hero */}

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          The Catalog Platform for Manufacturers & Distributors
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Manufacturers create digital product catalogs.  
          Distributors combine multiple brands into one powerful catalog app.
        </p>

        <div className="flex justify-center gap-4">

          <Link
            href="/signup"
            className="bg-black text-white px-8 py-3 rounded-lg hover:opacity-90 transition"
          >
            Create Your Catalog
          </Link>

          <Link
            href="/login"
            className="border px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Vendor Login
          </Link>

        </div>

        <p className="text-xs text-gray-500 mt-6">
          ⚡ 7-day free trial • No setup required • Cancel anytime
        </p>

      </section>

      {/* Two Roles Section */}

      <section className="bg-white py-20 border-t">

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">

          {/* Manufacturer */}

          <div className="border rounded-xl p-10 bg-zinc-50">

            <h2 className="text-xl font-semibold mb-4">
              For Manufacturers
            </h2>

            <ul className="text-sm text-gray-600 space-y-3">

              <li>✔ Upload products once</li>
              <li>✔ Organize using categories & filters</li>
              <li>✔ Share your branded catalog link</li>
              <li>✔ Send new product notifications</li>
              <li>✔ Allow distributors to showcase your products</li>

            </ul>

            <p className="text-sm text-gray-500 mt-6">
              Example: vitrino.in/yourbrand
            </p>

          </div>

          {/* Distributor */}

          <div className="border rounded-xl p-10 bg-zinc-50">

            <h2 className="text-xl font-semibold mb-4">
              For Distributors
            </h2>

            <ul className="text-sm text-gray-600 space-y-3">

              <li>✔ Combine multiple manufacturers</li>
              <li>✔ Show all brands in one catalog</li>
              <li>✔ Organized by company → category → product</li>
              <li>✔ Share your distributor app with retailers</li>
              <li>✔ Always synced with manufacturer updates</li>

            </ul>

          </div>

        </div>

      </section>

      {/* How It Works */}

      <section className="bg-zinc-50 py-20 border-t">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-semibold mb-12">
            How Vitrino Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-gray-600">

            <div>
              <div className="text-3xl font-bold mb-4">1</div>
              <p>Sign up as manufacturer or distributor</p>
            </div>

            <div>
              <div className="text-3xl font-bold mb-4">2</div>
              <p>Create or connect catalogs</p>
            </div>

            <div>
              <div className="text-3xl font-bold mb-4">3</div>
              <p>Share your catalog app with buyers</p>
            </div>

          </div>

        </div>

      </section>

      {/* Pricing */}

      <section className="bg-white py-20 border-t">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-12">
            Simple Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Monthly */}

            <div className="border rounded-xl p-8 bg-zinc-50">

              <h3 className="text-lg font-semibold mb-2">
                Monthly
              </h3>

              <p className="text-4xl font-bold mb-4">
                ₹399
              </p>

              <p className="text-sm text-gray-500 mb-6">
                per month
              </p>

              <Link
                href="/signup"
                className="bg-black text-white px-6 py-2 rounded-lg text-sm"
              >
                Start Monthly
              </Link>

            </div>

            {/* Quarterly */}

            <div className="border-2 border-black rounded-xl p-8">

              <h3 className="text-lg font-semibold mb-2">
                Quarterly
              </h3>

              <p className="text-4xl font-bold mb-4">
                ₹1,099
              </p>

              <p className="text-sm text-gray-500 mb-6">
                every 3 months
              </p>

              <Link
                href="/signup"
                className="bg-black text-white px-6 py-2 rounded-lg text-sm"
              >
                Choose Quarterly
              </Link>

            </div>

            {/* Yearly */}

            <div className="border rounded-xl p-8 bg-zinc-50">

              <h3 className="text-lg font-semibold mb-2">
                Yearly
              </h3>

              <p className="text-4xl font-bold mb-4">
                ₹3,999
              </p>

              <p className="text-sm text-gray-500 mb-6">
                per year
              </p>

              <Link
                href="/signup"
                className="bg-black text-white px-6 py-2 rounded-lg text-sm"
              >
                Choose Yearly
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* Final CTA */}

      <section className="py-20 text-center border-t bg-white">

        <h2 className="text-2xl font-semibold mb-6">
          Ready to launch your catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-10 py-4 rounded-lg hover:opacity-90 transition"
        >
          Start Free
        </Link>

      </section>

      {/* Footer */}

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">

        © {new Date().getFullYear()} Vitrino. All rights reserved.

        <div className="mt-2">
          Payments securely processed via Razorpay.
        </div>

      </footer>

    </div>
  );
}