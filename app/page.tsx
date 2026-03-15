import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* HEADER */}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-semibold">Vitrino</div>

          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:underline">Login</Link>

            <Link
              href="/signup"
              className="bg-black text-white px-4 py-1.5 rounded-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>



      {/* HERO */}

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



      {/* INDUSTRIES */}

      <section className="py-10 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <h2 className="text-lg font-semibold mb-6">
            Works for any product-based business
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs text-gray-600">

            <div className="bg-zinc-100 p-3 rounded">Garments</div>
            <div className="bg-zinc-100 p-3 rounded">Footwear</div>
            <div className="bg-zinc-100 p-3 rounded">Toys</div>
            <div className="bg-zinc-100 p-3 rounded">Bakery</div>
            <div className="bg-zinc-100 p-3 rounded">Hardware</div>
            <div className="bg-zinc-100 p-3 rounded">Electrical</div>

            <div className="bg-zinc-100 p-3 rounded">Furniture</div>
            <div className="bg-zinc-100 p-3 rounded">Home Decor</div>
            <div className="bg-zinc-100 p-3 rounded">Stationery</div>
            <div className="bg-zinc-100 p-3 rounded">Medical</div>
            <div className="bg-zinc-100 p-3 rounded">Electronics</div>
            <div className="bg-zinc-100 p-3 rounded">Agriculture</div>

          </div>
        </div>
      </section>



      {/* HOW IT WORKS */}

      <section className="py-12 bg-zinc-50 border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <h2 className="text-xl font-semibold mb-8">
            How Vitrino Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-sm">

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">1. Upload Products</h3>
              <p className="text-gray-600">
                Manufacturers upload products with attributes, images and pricing.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">2. Organize Catalog</h3>
              <p className="text-gray-600">
                Products get structured with filters like price, category,
                attributes and tags.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">3. Share Instantly</h3>
              <p className="text-gray-600">
                Send catalog links or generate PDFs instantly for retailers.
              </p>
            </div>

          </div>
        </div>
      </section>



      {/* REAL WORLD SCENARIOS */}

      <section className="py-12 border-t bg-white">
        <div className="max-w-6xl mx-auto px-4">

          <h2 className="text-xl font-semibold text-center mb-10">
            Real-world product discovery made simple
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-sm">

            {/* SHIRTS */}

            <div className="bg-zinc-50 border rounded-lg p-5">
              <h3 className="font-semibold mb-2">
                Apparel distributor request
              </h3>

              <p className="text-gray-600 mb-2">
                A retailer asks:
              </p>

              <p className="italic text-gray-700 mb-3">
                "Show cotton shirts between ₹500-₹600, half sleeves,
                regular collar, solid colours."
              </p>

              <p className="text-gray-600">
                With Vitrino you simply apply filters and instantly see
                all matching designs. Share the catalog link or generate
                a PDF in seconds.
              </p>
            </div>



            {/* TOYS */}

            <div className="bg-zinc-50 border rounded-lg p-5">
              <h3 className="font-semibold mb-2">
                Toy distributor request
              </h3>

              <p className="italic text-gray-700 mb-3">
                "Show toys ₹400-₹500 for boys. Non-electronic.
                Educational, board game or sports related."
              </p>

              <p className="text-gray-600">
                Apply filters for price, type and category. The exact
                products appear instantly. Send the catalog link and
                let the buyer browse easily.
              </p>
            </div>



            {/* BAKERY */}

            <div className="bg-zinc-50 border rounded-lg p-5">
              <h3 className="font-semibold mb-2">
                Bakery wholesaler request
              </h3>

              <p className="italic text-gray-700 mb-3">
                "Show eggless cakes under ₹300 suitable for birthdays."
              </p>

              <p className="text-gray-600">
                Filter by price, product type and attributes. The
                correct options appear instantly and can be shared
                through a catalog link.
              </p>
            </div>



            {/* HARDWARE */}

            <div className="bg-zinc-50 border rounded-lg p-5">
              <h3 className="font-semibold mb-2">
                Hardware distributor request
              </h3>

              <p className="italic text-gray-700 mb-3">
                "Show stainless steel door handles between ₹200-₹400."
              </p>

              <p className="text-gray-600">
                Apply price and material filters to instantly find
                matching products and send them to the customer.
              </p>
            </div>

          </div>
        </div>
      </section>



      {/* KEY BENEFITS */}

      <section className="py-12 bg-zinc-50 border-t">
        <div className="max-w-5xl mx-auto px-4 text-center">

          <h2 className="text-xl font-semibold mb-8">
            Why Businesses Choose Vitrino
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-sm">

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">Start selling instantly</h3>
              <p className="text-gray-600">
                Products become available to distributors immediately
                after upload.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">No overselling</h3>
              <p className="text-gray-600">
                Everyone always sees the latest product information.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">Instant updates</h3>
              <p className="text-gray-600">
                Manufacturers update once and distributors see it
                instantly.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">Generate PDFs</h3>
              <p className="text-gray-600">
                Create product catalogs or quotations in seconds.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">Smart filters</h3>
              <p className="text-gray-600">
                Buyers can quickly find the exact product they need.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-5">
              <h3 className="font-semibold mb-2">Product notifications</h3>
              <p className="text-gray-600">
                Notify buyers instantly about new launches.
              </p>
            </div>

          </div>
        </div>
      </section>



      {/* PRICING */}

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



      {/* FOOTER */}

      <footer className="border-t bg-white py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Vitrino
      </footer>

    </main>
  );
}