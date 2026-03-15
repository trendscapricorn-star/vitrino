```tsx
import Link from "next/link";
import Image from "next/image";

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

        <h1 className="text-4xl font-bold mb-6">
          The Smart Catalog Platform
        </h1>

        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Manufacturers upload products once. Distributors combine multiple
          brands into one powerful catalog for retailers.
        </p>

        <Link
          href="/signup"
          className="bg-black text-white px-8 py-3 rounded-lg"
        >
          Create Your Catalog
        </Link>

      </section>


      {/* Explainer */}

      <section className="py-16 bg-white border-t">

        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* What is Vitrino */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <Image
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_28%20PM.png"
              width={1200}
              height={900}
              alt="What is Vitrino"
              className="rounded-xl shadow"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                What is Vitrino?
              </h2>

              <p className="text-gray-600">
                Vitrino is a digital catalog platform for manufacturers
                and distributors to showcase products and share catalogs
                instantly.
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
                Manufacturers upload products once and share their
                catalog instantly with distributors and retailers.
              </p>
            </div>

            <Image
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_22%20PM.png"
              width={1200}
              height={900}
              alt="Manufacturers"
              className="rounded-xl shadow"
            />

          </div>



          {/* Launch */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <Image
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_14%20PM.png"
              width={1200}
              height={900}
              alt="Launch in 15 minutes"
              className="rounded-xl shadow"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Launch in 15 Minutes
              </h2>

              <p className="text-gray-600">
                Setup your product catalog quickly and start sharing
                products with distributors and buyers.
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
                Combine multiple manufacturers into one powerful
                multi-brand catalog.
              </p>
            </div>

            <Image
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_30_09%20PM.png"
              width={1200}
              height={900}
              alt="Distributors"
              className="rounded-xl shadow"
            />

          </div>



          {/* Connect */}

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <Image
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_56%20PM.png"
              width={1200}
              height={900}
              alt="Connect manufacturers"
              className="rounded-xl shadow"
            />

            <div>
              <h2 className="text-3xl font-semibold mb-3">
                Connect Manufacturers
              </h2>

              <p className="text-gray-600">
                Request manufacturers for access and instantly
                showcase their products.
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
                Share catalogs instantly, notify buyers of new
                launches and manage multi-brand catalogs easily.
              </p>
            </div>

            <Image
              src="https://gurnaesxznoppfzdcwmh.supabase.co/storage/v1/object/public/Banner/ChatGPT%20Image%20Mar%2015,%202026,%2011_29_45%20PM.png"
              width={1200}
              height={900}
              alt="Benefits"
              className="rounded-xl shadow"
            />

          </div>

        </div>

      </section>


      {/* Footer */}

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vitrino
      </footer>

    </main>
  );
}
```
