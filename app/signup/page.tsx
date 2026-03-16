import SignupForm from "./SignupForm"

export const metadata = {
  title: "Sign Up | Vitrino",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">

        <h1 className="text-2xl font-semibold mb-2 text-center">
          Create Your Account
        </h1>

        <p className="text-sm text-zinc-500 text-center mb-6">
          Choose how you want to use Vitrino
        </p>

        {/* ROLE EXPLANATION */}

        <div className="mb-6 space-y-3 text-sm">

          <div className="border rounded p-3">
            <p className="font-medium">Manufacturer</p>
            <p className="text-zinc-500">
              Create your product catalog, manage categories,
              products and variants, and approve distributors
              who want to sell your products.
            </p>
          </div>

          <div className="border rounded p-3">
            <p className="font-medium">Distributor</p>
            <p className="text-zinc-500">
              Connect with manufacturers, access their catalogs,
              share products with retailers, and place orders.
            </p>
          </div>

        </div>

        <SignupForm />

      </div>
    </div>
  )
}