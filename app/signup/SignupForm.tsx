"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupForm() {
  const supabase = supabaseBrowser;

  const [step, setStep] = useState<"form" | "otp" | "plan">("form");

  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [gst, setGst] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSignup() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setStep("otp");

    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        alert(error.message);
        return;
      }

      // After verification, user is logged in
      setStep("plan");

    } finally {
      setLoading(false);
    }
  }

  async function insertCompany() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const normalizedSlug = normalizeSlug(slug);

    const { data, error } = await supabase
      .from("companies")
      .insert({
        auth_user_id: user.id,
        display_name: companyName,
        slug: normalizedSlug,
        gst_number: gst || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes("duplicate")) {
        throw new Error("Slug already taken");
      }
      throw error;
    }

    return data;
  }

  async function startTrial() {
    try {
      setLoading(true);

      const company = await insertCompany();

      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 7);

      await supabase.from("subscriptions").insert({
        company_id: company.id,
        status: "trialing",
        trial_ends_at: trialEnds,
      });

      window.location.href = "/dashboard";

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === "form") {
    return (
      <>
        <h2 className="text-xl font-semibold mb-6">
          Create Your Business Account
        </h2>

        <input
          className="border w-full p-2 mb-3 rounded"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value);
            setSlug(normalizeSlug(e.target.value));
          }}
        />

        <input
          className="border w-full p-2 mb-3 rounded"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(normalizeSlug(e.target.value))}
        />

        <input
          className="border w-full p-2 mb-3 rounded"
          placeholder="GST Number (optional)"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
        />

        <textarea
          className="border w-full p-2 mb-3 rounded"
          placeholder="Business Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="border w-full p-2 mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border w-full p-2 mb-3 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          className="border w-full p-2 mb-4 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </>
    );
  }

  if (step === "otp") {
    return (
      <>
        <h2 className="text-xl font-semibold mb-6">
          Verify Email
        </h2>

        <input
          className="border w-full p-2 mb-4 rounded"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </>
    );
  }

  if (step === "plan") {
    return (
      <>
        <h2 className="text-xl font-semibold mb-6">
          Choose Your Plan
        </h2>

        <button
          onClick={startTrial}
          className="w-full border p-3 rounded mb-3"
        >
          Start 7-Day Free Trial
        </button>

        <button
          className="w-full bg-black text-white p-3 rounded"
        >
          Purchase Plan
        </button>
      </>
    );
  }

  return null;
}