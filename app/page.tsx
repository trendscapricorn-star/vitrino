import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* Header */}

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-semibold">Vitrino</div>

          <div className="flex gap-4">
            <Link href="/login" className="text-sm hover:underline">
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          The Smart Catalog Platform
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Manufacturers upload products once. Distributors combine multiple
          brands into one powerful catalog for retailers and buyers.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-black text-white px-8 py-3 rounded-lg"
          >
            Create Your Catalog
          </Link>

          <Link
            href="/login"
            className="border px-8 py-3 rounded-lg"
          >
            Vendor Login
          </Link>
        </div>
      </section>

      {/* Explainer */}

      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* What is Vitrino */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_28%20PM.png"
              className="rounded-xl shadow"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                What is Vitrino?
              </h2>

              <p className="text-gray-600">
                Vitrino is a digital catalog platform that helps manufacturers
                and distributors showcase products and share catalogs instantly.
              </p>
            </div>

          </div>



          {/* Manufacturers */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Built for Manufacturers
              </h2>

              <p className="text-gray-600">
                Upload products once and instantly share your branded catalog
                with distributors and retailers.
              </p>
            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_22%20PM.png"
              className="rounded-xl shadow"
            />

          </div>



          {/* Launch */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_14%20PM.png"
              className="rounded-xl shadow"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Launch in 15 Minutes
              </h2>

              <p className="text-gray-600">
                Setup your catalog quickly. Upload products, organize attributes
                and your digital catalog is ready to share.
              </p>
            </div>

          </div>



          {/* Distributors */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Perfect for Distributors
              </h2>

              <p className="text-gray-600">
                Combine multiple manufacturers into one powerful multi-brand
                catalog for retailers.
              </p>
            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_09%20PM.png"
              className="rounded-xl shadow"
            />

          </div>



          {/* Connect */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_56%20PM.png"
              className="rounded-xl shadow"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Connect Manufacturers
              </h2>

              <p className="text-gray-600">
                Request manufacturers for permission and instantly showcase
                their products in your distributor catalog.
              </p>
            </div>

          </div>



          {/* Benefits */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Why Businesses Use Vitrino
              </h2>

              <p className="text-gray-600">
                No more manually sending product images. Share catalogs instantly,
                notify buyers about launches and manage multi-brand catalogs easily.
              </p>
            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_45%20PM.png"
              className="rounded-xl shadow"
            />

          </div>

        </div>
      </section>



      {/* Pricing */}

      <section className="py-20 border-t bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-10">
            Simple Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-2">Monthly</h3>
              <p className="text-3xl font-bold mb-4">₹399</p>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg text-sm">
                Start Monthly
              </Link>
            </div>

            <div className="border-2 border-black rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-2">Quarterly</h3>
              <p className="text-3xl font-bold mb-4">₹1,099</p>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg text-sm">
                Choose Quarterly
              </Link>
            </div>

            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-2">Yearly</h3>
              <p className="text-3xl font-bold mb-4">₹3,999</p>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-lg text-sm">
                Choose Yearly
              </Link>
            </div>

          </div>

        </div>
      </section>



      {/* CTA */}

      <section className="py-20 text-center border-t bg-white">

        <h2 className="text-2xl font-semibold mb-6">
          Ready to launch your catalog?
        </h2>

        <Link
          href="/signup"
          className="bg-black text-white px-10 py-4 rounded-lg"
        >
          Start Free
        </Link>

      </section>



      {/* Footer */}

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vitrino
      </footer>

    </main>
  );
}