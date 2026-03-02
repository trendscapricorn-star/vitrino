import SignupForm from "./SignupForm"

export const metadata = {
  title: "Sign Up | Vitrino",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Create Your Account
        </h1>

        <SignupForm />
      </div>
    </div>
  )
}