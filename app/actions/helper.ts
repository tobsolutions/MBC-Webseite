"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { getSetting } from "@/lib/queries"
import { requireAdmin } from "@/lib/session"
import { HELPER_PASSWORD_KEY } from "@/lib/settings-keys"
import {
  HELPER_COOKIE,
  createHelperToken,
  hashHelperPassword,
  helperCookieOptions,
  verifyHelperPassword,
} from "@/lib/helper-access"

export type HelperFormState = { ok?: boolean; error?: string } | null

export async function unlockHelperArea(_prev: HelperFormState, formData: FormData): Promise<HelperFormState> {
  const password = String(formData.get("password") ?? "")
  const stored = await getSetting(HELPER_PASSWORD_KEY)
  if (!stored) return { error: "Der Helferzugang ist derzeit nicht freigeschaltet." }

  const valid = password.length > 0 && (await verifyHelperPassword(password, stored))
  if (!valid) {
    // Kleine Verzoegerung erschwert das automatisierte Durchprobieren von Passwoertern.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { error: "Das Passwort ist nicht korrekt." }
  }

  ;(await cookies()).set(HELPER_COOKIE, createHelperToken(stored), helperCookieOptions)
  redirect("/helfer")
}

export async function lockHelperArea() {
  ;(await cookies()).set(HELPER_COOKIE, "", { ...helperCookieOptions, maxAge: 0 })
  redirect("/helfer/zugang")
}

export async function saveHelperPassword(_prev: HelperFormState, formData: FormData): Promise<HelperFormState> {
  await requireAdmin()
  const password = String(formData.get("password") ?? "")
  if (password.length < 6) return { error: "Das Passwort muss mindestens 6 Zeichen haben." }

  const value = await hashHelperPassword(password)
  await db
    .insert(settings)
    .values({ key: HELPER_PASSWORD_KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })

  revalidatePath("/admin/einstellungen")
  return { ok: true }
}

export async function disableHelperAccess(): Promise<HelperFormState> {
  await requireAdmin()
  await db.delete(settings).where(eq(settings.key, HELPER_PASSWORD_KEY))
  revalidatePath("/admin/einstellungen")
  return { ok: true }
}
