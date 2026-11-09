import { NextRequest, NextResponse } from "next/server"
import { getSetting } from "@/lib/queries"
import { HELPER_LINK_SECRET_KEY } from "@/lib/settings-keys"
import { createHelperToken, HELPER_COOKIE, helperCookieOptions, verifyHelperPassword } from "@/lib/helper-access"

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/helfer/schichtplan") return NextResponse.next()
  const secret = request.nextUrl.searchParams.get("secret")
  if (!secret) return NextResponse.next()

  const stored = await getSetting(HELPER_LINK_SECRET_KEY)
  if (!stored || !(await verifyHelperPassword(secret, stored))) {
    return NextResponse.next()
  }

  const cleanUrl = request.nextUrl.clone()
  cleanUrl.searchParams.delete("secret")
  const response = NextResponse.redirect(cleanUrl)
  response.cookies.set(HELPER_COOKIE, createHelperToken(stored), helperCookieOptions)
  return response
}

export const config = {
  matcher: ["/helfer/schichtplan"],
}
