"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { requireUser } from "@/lib/session"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export type ActionResult = { ok: boolean; error?: string }

// Speichert, ob der angemeldete Nutzer die taegliche Zusammenfassung erhalten moechte.
export async function updateDigestPreference(enabled: boolean): Promise<ActionResult> {
  const current = await requireUser()
  await db
    .update(user)
    .set({ notifyDigest: enabled, updatedAt: new Date() })
    .where(eq(user.id, current.id))
  revalidatePath("/intern/profil")
  return { ok: true }
}
