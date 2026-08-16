"use server"

import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"

export type ContactResult = { ok: boolean; error?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitContactMessage(_prev: ContactResult | null, formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const subject = String(formData.get("subject") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()
  // Honeypot field — bots fill this, humans don't see it.
  const honeypot = String(formData.get("company") ?? "").trim()

  if (honeypot) return { ok: true } // silently drop bot submissions

  if (!name || name.length < 2) return { ok: false, error: "Bitte geben Sie Ihren Namen an." }
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." }
  if (!message || message.length < 10)
    return { ok: false, error: "Bitte schreiben Sie eine etwas ausführlichere Nachricht (mind. 10 Zeichen)." }
  if (message.length > 5000) return { ok: false, error: "Die Nachricht ist zu lang." }

  try {
    await db.insert(contactMessages).values({
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      subject: subject.slice(0, 200),
      message,
    })
    return { ok: true }
  } catch (e) {
    console.error("[v0] contact insert failed:", e)
    return { ok: false, error: "Die Nachricht konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut." }
  }
}
