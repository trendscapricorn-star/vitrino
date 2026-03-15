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

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="text-xl font-bold">
            Vitrino
          </div>

          <div className="flex gap-4">

            <Link href="/login" className="text-sm font-medium hover:underline">
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

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        <h1 className="text-5xl font-bold mb-6">
          The Smart Catalog Platform
        </h1>

        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Manufacturers upload products once. Distributors combine multiple
          brands into one powerful catalog for retailers.
        </p>

        <Link
          href="/signup"
          className="bg-black text-white px-8 py-3 rounded-xl"
        >
          Create Your Catalog
        </Link>

      </section>


      {/* Product Explainer Sections */}

      <section className="py-24 bg-white border-t">

        <div className="max-w-7xl mx-auto px-6 space-y-28">


          {/* Image 1 */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_45%20PM.png"
              className="rounded-xl shadow-lg w-full"
            />

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                What is Vitrino?
              </h2>

              <p className="text-gray-600">
                Vitrino is a digital catalog platform designed for
                manufacturers and distributors to showcase products and share
                catalogs instantly.
              </p>

            </div>

          </div>



          {/* Image 2 */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Built for Manufacturers
              </h2>

              <p className="text-gray-600">
                Upload products once and instantly share your branded
                catalog with distributors and retailers.
              </p>

            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_56%20PM.png"
              className="rounded-xl shadow-lg w-full"
            />

          </div>



          {/* Image 3 */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_09%20PM.png"
              className="rounded-xl shadow-lg w-full"
            />

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Launch in Minutes
              </h2>

              <p className="text-gray-600">
                Create your digital product catalog in under 15 minutes with
                AI-assisted product organization.
              </p>

            </div>

          </div>



          {/* Image 4 */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Perfect for Distributors
              </h2>

              <p className="text-gray-600">
                Combine multiple manufacturers into one catalog and share it
                easily with retailers.
              </p>

            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_14%20PM.png"
              className="rounded-xl shadow-lg w-full"
            />

          </div>



          {/* Image 5 */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_22%20PM.png"
              className="rounded-xl shadow-lg w-full"
            />

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Connect with Manufacturers
              </h2>

              <p className="text-gray-600">
                Request access from manufacturers and instantly showcase their
                products without uploading anything.
              </p>

            </div>

          </div>



          {/* Image 6 */}

          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>

              <h2 className="text-3xl font-semibold mb-4">
                Why Businesses Use Vitrino
              </h2>

              <p className="text-gray-600">
                Setup catalogs in minutes, send product notifications, and
                manage multi-brand catalogs easily.
              </p>

            </div>

            <img
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_28%20PM.png"
              className="rounded-xl shadow-lg w-full"
            />

          </div>



        </div>

      </section>


      {/* Footer */}

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vitrino
      </footer>


    </div>
  );
}