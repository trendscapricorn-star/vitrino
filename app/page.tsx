import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* Header */}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="text-xl font-semibold">
            Vitrino
          </div>

          <div className="flex gap-4">

            <Link href="/login" className="text-sm hover:underline">
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

      </section>



      {/* Industries */}

      <section className="py-16 bg-white border-t">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-semibold mb-8">
            Used by businesses across industries
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm text-gray-600">

            <div className="bg-zinc-50 p-4 rounded-lg">Garments</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Hardware</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Electronics</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Textiles</div>
            <div className="bg-zinc-50 p-4 rounded-lg">Wholesale</div>

          </div>

        </div>

      </section>



      {/* How it works */}

      <section className="py-20 bg-zinc-50 border-t">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-12">
            How Vitrino Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <div className="text-3xl font-bold mb-3">1</div>
              <p>Create your catalog</p>
            </div>

            <div>
              <div className="text-3xl font-bold mb-3">2</div>
              <p>Connect brands or distributors</p>
            </div>

            <div>
              <div className="text-3xl font-bold mb-3">3</div>
              <p>Share with retailers instantly</p>
            </div>

          </div>

        </div>

      </section>



      {/* Explainer */}

      <section className="py-20 bg-white border-t">

        <div className="max-w-7xl mx-auto px-6 space-y-20">


          {/* What is Vitrino */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_28%20PM.png"
              className="rounded-xl shadow-md hover:shadow-xl transition"
            />

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                What is Vitrino?
              </h2>

              <p className="text-gray-600">
                Vitrino is a digital catalog platform that helps manufacturers
                and distributors showcase products and share catalogs instantly.
              </p>

            </div>

          </div>



          {/* Manufacturers */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Built for Manufacturers
              </h2>

              <p className="text-gray-600">
                Upload products once and instantly share your branded catalog
                with distributors and retailers.
              </p>

            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_22%20PM.png"
              className="rounded-xl shadow-md hover:shadow-xl transition"
            />

          </div>



          {/* Launch */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_14%20PM.png"
              className="rounded-xl shadow-md hover:shadow-xl transition"
            />

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Launch in 15 Minutes
              </h2>

              <p className="text-gray-600">
                Setup your product catalog quickly and start sharing products immediately.
              </p>

            </div>

          </div>



          {/* Distributors */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Perfect for Distributors
              </h2>

              <p className="text-gray-600">
                Combine multiple manufacturers into one multi-brand catalog.
              </p>

            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_09%20PM.png"
              className="rounded-xl shadow-md hover:shadow-xl transition"
            />

          </div>



          {/* Connect */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_56%20PM.png"
              className="rounded-xl shadow-md hover:shadow-xl transition"
            />

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Connect Manufacturers
              </h2>

              <p className="text-gray-600">
                Request manufacturers and instantly showcase their products.
              </p>

            </div>

          </div>



          {/* Benefits */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Why Businesses Use Vitrino
              </h2>

              <p className="text-gray-600">
                Share catalogs instantly, notify buyers and manage multi-brand
                catalogs easily.
              </p>

            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_45%20PM.png"
              className="rounded-xl shadow-md hover:shadow-xl transition"
            />

          </div>

        </div>

      </section>



      {/* Comparison */}

      <section className="py-20 bg-zinc-50 border-t">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-semibold mb-10">
            Why Vitrino beats WhatsApp catalogs
          </h2>

          <table className="w-full text-sm border rounded-lg overflow-hidden">

            <thead className="bg-zinc-100">
              <tr>
                <th className="p-4 text-left">Feature</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Vitrino</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-t">
                <td className="p-4 text-left">Product organization</td>
                <td>❌</td>
                <td>✔</td>
              </tr>

              <tr className="border-t">
                <td className="p-4 text-left">Filters</td>
                <td>❌</td>
                <td>✔</td>
              </tr>

              <tr className="border-t">
                <td className="p-4 text-left">Notifications</td>
                <td>❌</td>
                <td>✔</td>
              </tr>

              <tr className="border-t">
                <td className="p-4 text-left">Multi-brand catalogs</td>
                <td>❌</td>
                <td>✔</td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>



      {/* CTA */}

      <section className="py-20 text-center bg-white border-t">

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