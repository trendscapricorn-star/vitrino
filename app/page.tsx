import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vitrino | Launch Your Product Catalog in 15 Minutes",
  description:
    "Create your own branded product catalog with smart filters and shareable webpage — live in under 15 minutes. No e-commerce complexity.",
};

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
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 🔹 Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Launch Your Own Branded Product Catalog in 15 Minutes
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Create your own professional catalog with your logo, your webpage,
          smart filters, and organized products — without building a full
          e-commerce store.
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

      {/* 🔹 Who It's For */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-8">
            Perfect For
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-sm text-gray-600">
            <div className="border rounded-lg p-6 bg-zinc-50">
              Manufacturers
            </div>
            <div className="border rounded-lg p-6 bg-zinc-50">
              Distributors
            </div>
            <div className="border rounded-lg p-6 bg-zinc-50">
              B2B Sellers
            </div>
            <div className="border rounded-lg p-6 bg-zinc-50">
              Product-Based Businesses
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 How It Works */}
      <section className="bg-zinc-50 py-20 border-t">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-gray-600">
            <div>
              <div className="text-3xl font-bold mb-4">1</div>
              <p>Create your account</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-4">2</div>
              <p>Upload products & set filters</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-4">3</div>
              <p>Share your catalog link</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Core Features */}
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

      {/* 🔹 Differentiator */}
      <section className="bg-zinc-50 py-20 border-t">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Built for Catalog Sharing — Not E-commerce Complexity
          </h2>

          <p className="text-gray-600 mb-10">
            No shopping carts. No payment gateway setup.
            Just a structured, professional product catalog ready to share.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>⚡ Live in under 15 minutes</div>
            <div>🤖 AI-assisted product setup</div>
            <div>🔐 Secure subscription-managed access</div>
          </div>
        </div>
      </section>

      {/* 🔹 Final CTA */}
      <section className="py-20 text-center border-t bg-white">
        <h2 className="text-2xl font-semibold mb-6">
          Ready to launch your branded catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-10 py-4 rounded-lg hover:opacity-90 transition"
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