import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export const runtime = "nodejs"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  /* 🔹 Get Auth User */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in → let auth layer handle
  if (!user) return res

  /* 🔹 Get Company */
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  // No company yet (signup mid-flow) → allow
  if (!company) return res

  /* 🔹 Get Subscription */
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("company_id", company.id)
    .maybeSingle()

  // No subscription yet → allow (user just created company)
  if (!subscription) return res

  const now = new Date()

  /* 🔹 Trial Valid */
  const isTrialValid =
    subscription.status === "trialing" &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) > now

  /* 🔹 Active Valid */
  const isActiveValid =
    subscription.status === "active" &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) > now

  /*
    🔒 IMPORTANT:
    status === "created" (paid but not activated)
    should NOT grant access
  */

  const hasValidAccess = isTrialValid || isActiveValid

  const pathname = req.nextUrl.pathname
  const isDashboardRoot = pathname === "/dashboard"

  if (!hasValidAccess && !isDashboardRoot) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    url.searchParams.set("expired", "true")
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}