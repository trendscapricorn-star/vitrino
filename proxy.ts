
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in → allow (auth layer handles it)
  if (!user) return res

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("auth_user_id", user.id)
    .single()

  if (!company) return res

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("company_id", company.id)
    .single()

  if (!subscription) return res

  const now = new Date()

  const isTrialValid =
    subscription.status === "trialing" &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) > now

  const isActiveValid =
    subscription.status === "active" &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) > now

  const pathname = req.nextUrl.pathname
  const isDashboardRoot = pathname === "/dashboard"

  // If subscription invalid → redirect to dashboard root
  if (!isTrialValid && !isActiveValid && !isDashboardRoot) {
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