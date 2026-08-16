import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Role } from "@/lib/roles"

export type { Role } from "@/lib/roles"
export { visibleScopesForRole, ROLE_LABELS } from "@/lib/roles"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const u = session.user as { id: string; name: string; email: string; role?: string }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role as Role) ?? "mitglied",
  }
}

export async function requireUser(redirectTo = "/intern"): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  return user
}

export async function requireAdmin(redirectTo = "/admin"): Promise<SessionUser> {
  const user = await requireUser(redirectTo)
  if (user.role !== "admin") redirect("/intern")
  return user
}


