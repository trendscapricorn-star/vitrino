import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* Header */}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-semibold">Vitrino</div>

          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:underline">
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-black text-white px-4 py-1.5 rounded-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>



      {/* Hero */}

      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          The Smart Catalog Platform
        </h1>

        <p className="text-gray-600 max-w-xl mx-auto mb-6 text-sm">
          Manufacturers upload products once. Distributors combine multiple
          brands into one powerful catalog for retailers and buyers.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/signup"
            className="bg-black text-white px-6 py-2 rounded-md text-sm"
          >
            Create Catalog
          </Link>

          <Link
            href="/login"
            className="border px-6 py-2 rounded-md text-sm"
          >
            Vendor Login
          </Link>
        </div>
      </section>



      {/* Industries */}

      <section className="py-10 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <h2 className="text-lg font-semibold mb-6">
            Works for any product-based business
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs text-gray-600">

            <div className="bg-zinc-100 p-3 rounded">Garments</div>
            <div className="bg-zinc-100 p-3 rounded">Footwear</div>
            <div className="bg-zinc-100 p-3 rounded">Jewellery</div>
            <div className="bg-zinc-100 p-3 rounded">Cosmetics</div>
            <div className="bg-zinc-100 p-3 rounded">Toys</div>
            <div className="bg-zinc-100 p-3 rounded">Bakery</div>

            <div className="bg-zinc-100 p-3 rounded">Hardware</div>
            <div className="bg-zinc-100 p-3 rounded">Electrical</div>
            <div className="bg-zinc-100 p-3 rounded">Tools</div>
            <div className="bg-zinc-100 p-3 rounded">Automotive</div>
            <div className="bg-zinc-100 p-3 rounded">Furniture</div>
            <div className="bg-zinc-100 p-3 rounded">Home Decor</div>

            <div className="bg-zinc-100 p-3 rounded">Medical Supplies</div>
            <div className="bg-zinc-100 p-3 rounded">Stationery</div>
            <div className="bg-zinc-100 p-3 rounded">Electronics</div>
            <div className="bg-zinc-100 p-3 rounded">Packaging</div>
            <div className="bg-zinc-100 p-3 rounded">Agriculture</div>
            <div className="bg-zinc-100 p-3 rounded">Wholesale</div>

          </div>

        </div>
      </section>



      {/* Explainer */}

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-12">


          {/* What is Vitrino */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_28%20PM.png"
              className="rounded-lg shadow"
            />

            <div>
              <h3 className="text-xl font-semibold mb-2">
                What is Vitrino
              </h3>

              <p className="text-gray-600 text-sm">
                Vitrino helps manufacturers and distributors showcase products
                through structured digital catalogs with filters, sorting and
                easy browsing.
              </p>
            </div>
          </div>



          {/* Manufacturers */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Built for Manufacturers
              </h3>

              <p className="text-gray-600 text-sm">
                Upload products once and instantly share your branded catalog
                with distributors and retailers.
              </p>
            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_22%20PM.png"
              className="rounded-lg shadow"
            />
          </div>



          {/* Launch */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_14%20PM.png"
              className="rounded-lg shadow"
            />

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Launch in 15 Minutes
              </h3>

              <p className="text-gray-600 text-sm">
                Setup your product catalog quickly and start sharing products
                instantly.
              </p>
            </div>
          </div>



          {/* Distributors */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Perfect for Distributors
              </h3>

              <p className="text-gray-600 text-sm">
                Combine multiple manufacturers into a single multi-brand catalog.
              </p>
            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_09%20PM.png"
              className="rounded-lg shadow"
            />
          </div>



          {/* Connect */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_56%20PM.png"
              className="rounded-lg shadow"
            />

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Connect Manufacturers
              </h3>

              <p className="text-gray-600 text-sm">
                Request manufacturers and instantly showcase their products.
              </p>
            </div>
          </div>



          {/* Benefits */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Why Businesses Use Vitrino
              </h3>

              <p className="text-gray-600 text-sm">
                Share catalogs instantly, send product notifications,
                and manage multi-brand catalogs easily.
              </p>
            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_45%20PM.png"
              className="rounded-lg shadow"
            />
          </div>

        </div>
      </section>



      {/* Pricing / Subscription */}

      <section className="py-12 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <h2 className="text-xl font-semibold mb-6">
            Simple Subscription
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="border rounded-lg p-4 bg-zinc-50">
              <h3 className="font-semibold text-sm mb-2">Monthly</h3>
              <p className="text-2xl font-bold mb-3">₹399</p>

              <Link
                href="/signup"
                className="bg-black text-white px-5 py-2 rounded text-sm"
              >
                Start
              </Link>
            </div>



            <div className="border-2 border-black rounded-lg p-4 bg-white">
              <h3 className="font-semibold text-sm mb-2">Quarterly</h3>
              <p className="text-2xl font-bold mb-3">₹1,099</p>

              <Link
                href="/signup"
                className="bg-black text-white px-5 py-2 rounded text-sm"
              >
                Choose
              </Link>
            </div>



            <div className="border rounded-lg p-4 bg-zinc-50">
              <h3 className="font-semibold text-sm mb-2">Yearly</h3>
              <p className="text-2xl font-bold mb-3">₹3,999</p>

              <Link
                href="/signup"
                className="bg-black text-white px-5 py-2 rounded text-sm"
              >
                Choose
              </Link>
            </div>

          </div>

        </div>
      </section>



      {/* CTA */}

      <section className="py-10 text-center">
        <h2 className="text-lg font-semibold mb-4">
          Ready to launch your catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-8 py-2 rounded-md text-sm"
        >
          Start Free
        </Link>
      </section>



      {/* Footer */}

      <footer className="border-t bg-white py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Vitrino
      </footer>

    </main>
  );
}