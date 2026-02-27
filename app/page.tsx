import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">

      {/* 🔹 Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-semibold">
            Vitrino B2B
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
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Build Your Own B2B Product Catalog
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Create your professional wholesale catalog with categories,
          filters, attributes and branding — without building an e-commerce store.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-90"
          >
            Create Your Catalog
          </Link>

          <Link
            href="/login"
            className="border px-6 py-3 rounded-lg hover:bg-gray-100"
          >
            Vendor Login
          </Link>
        </div>
      </section>

      {/* 🔹 Features Section */}
      <section className="bg-white py-20 border-t">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">

          <div>
            <h3 className="text-lg font-semibold mb-3">
              🎨 Custom Branding
            </h3>
            <p className="text-gray-600 text-sm">
              Upload your logo, banner, contact details and make the page look
              completely yours.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">
              🗂 Smart Filters
            </h3>
            <p className="text-gray-600 text-sm">
              Organize products by category and attribute-based filters
              like fabric, size sets, sleeves and more.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">
              📩 Centralized Inquiry
            </h3>
            <p className="text-gray-600 text-sm">
              Buyers send one inquiry request for the vendor —
              no cart, no checkout complexity.
            </p>
          </div>

        </div>
      </section>

      {/* 🔹 CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to create your B2B catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-8 py-3 rounded-lg hover:opacity-90"
        >
          Start Free
        </Link>
      </section>

      {/* 🔹 Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vitrino B2B. All rights reserved.
      </footer>

    </div>
  );
}