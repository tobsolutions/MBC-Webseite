import "server-only"
import { and, eq, gt } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, documents, user, settings } from "@/lib/db/schema"
import { DIGEST_LAST_RUN_KEY } from "@/lib/settings-keys"
import { sendDigestEmail, type DigestItem } from "@/lib/email"

export type DigestRunResult = {
  ok: boolean
  recipients: number
  sent: number
  failed: number
  newEvents: number
  newDocuments: number
  skipped?: string
  errors?: string[]
}

function formatEventMeta(startAt: Date, location: string | null): string {
  const date = startAt.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const parts = [date]
  if (location) parts.push(location)
  return parts.join(" · ")
}

// Zeitpunkt des letzten Laufs lesen; Standard: 24 Stunden zurueck.
async function getLastRun(): Promise<Date> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, DIGEST_LAST_RUN_KEY))
    .limit(1)
  const raw = rows[0]?.value
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date(Date.now() - 24 * 60 * 60 * 1000)
}

async function setLastRun(when: Date): Promise<void> {
  await db
    .insert(settings)
    .values({ key: DIGEST_LAST_RUN_KEY, value: when.toISOString(), updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: when.toISOString(), updatedAt: new Date() } })
}

// Sammelt Neuigkeiten seit dem letzten Lauf und verschickt sie an alle Opt-in-Mitglieder.
export async function runDailyDigest(): Promise<DigestRunResult> {
  const since = await getLastRun()
  const runStartedAt = new Date()

  const [newEventsRows, newDocsRows] = await Promise.all([
    db.select().from(events).where(gt(events.createdAt, since)),
    db.select().from(documents).where(gt(documents.createdAt, since)),
  ])

  const eventItems: DigestItem[] = newEventsRows.map((e) => ({
    title: e.title,
    meta: formatEventMeta(e.startAt, e.location),
  }))
  const documentItems: DigestItem[] = newDocsRows.map((d) => ({
    title: d.title,
    meta: d.category ? `Kategorie: ${d.category}` : "Neues Dokument",
  }))

  // Nichts Neues: Lauf-Zeitstempel trotzdem aktualisieren, keine Mails.
  if (eventItems.length === 0 && documentItems.length === 0) {
    await setLastRun(runStartedAt)
    return {
      ok: true,
      recipients: 0,
      sent: 0,
      failed: 0,
      newEvents: 0,
      newDocuments: 0,
      skipped: "Keine neuen Inhalte seit dem letzten Lauf.",
    }
  }

  // Empfaenger: nur Mitglieder mit aktiviertem Opt-in und verifizierter E-Mail.
  const recipients = await db
    .select({ email: user.email })
    .from(user)
    .where(and(eq(user.notifyDigest, true), eq(user.emailVerified, true)))

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const r of recipients) {
    const res = await sendDigestEmail(r.email, { events: eventItems, documents: documentItems })
    if (res.ok) {
      sent++
    } else {
      failed++
      if (res.error) errors.push(`${r.email}: ${res.error}`)
    }
  }

  await setLastRun(runStartedAt)

  return {
    ok: true,
    recipients: recipients.length,
    sent,
    failed,
    newEvents: eventItems.length,
    newDocuments: documentItems.length,
    errors: errors.length > 0 ? errors : undefined,
  }
}
