"use server"

import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { Resend } from "resend"
import type { ContactResult } from "@/lib/contact-types"

const CONTACT_RECIPIENT = "info@mbc-bellenberg.de"
let resendClient: Resend | null = null

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY ist nicht gesetzt.")
  resendClient ??= new Resend(process.env.RESEND_API_KEY)
  return resendClient
}

function escapeHtml(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
}

function escapeHeader(input: string) {
  return input.replace(/[\r\n]/g, " ").trim()
}

const textToHtml = (input: string) => escapeHtml(input).replace(/\r?\n/g, "<br>")

// Dieselbe verifizierte Absenderadresse wie beim bestehenden Mailversand verwenden.
// CONTACT_FROM_EMAIL kann bei Bedarf durch eine andere verifizierte Adresse ersetzt werden.
const CONTACT_FROM =
  process.env.CONTACT_FROM_EMAIL ??
  process.env.DIGEST_FROM_EMAIL ??
  "MBC Bellenberg <info@mbc-bellenberg.de>"

async function sendContactEmail({ id, name, email, subject, message }: { id: number; name: string; email: string; subject: string; message: string }) {
  const result = await getResend().emails.send(
    {
      from: CONTACT_FROM,
      to: [CONTACT_RECIPIENT],
      replyTo: email,
      subject: `Kontaktformular${subject ? `: ${escapeHeader(subject)}` : ""}`,
      html: `<h2>Neue Nachricht über das Kontaktformular</h2><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>E-Mail:</strong> ${escapeHtml(email)}</p>${subject ? `<p><strong>Betreff:</strong> ${escapeHtml(subject)}</p>` : ""}<p>${textToHtml(message)}</p>`,
      text: `Neue Nachricht über das Kontaktformular\\n\\nName: ${name}\\nE-Mail: ${email}${subject ? `\\nBetreff: ${subject}` : ""}\\n\\n${message}`,
    },
    { idempotencyKey: `contact-message/${id}` },
  )
  if (result.error) throw new Error(result.error.message)
}


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

  const payload = {
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    subject: subject.slice(0, 200),
    message,
  }

  let saved: { id: number }
  try {
    const [row] = await db.insert(contactMessages).values(payload).returning({ id: contactMessages.id })
    if (!row) throw new Error("Die Nachricht wurde nicht gespeichert.")
    saved = row
  } catch (error) {
    console.error("[v0] contact message database insert failed:", error)
    return { ok: false, error: "Die Nachricht konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut." }
  }

  try {
    await sendContactEmail({ id: saved.id, ...payload })
  } catch (error) {
    // Die Nachricht bleibt im Adminbereich erhalten, auch wenn Resend gerade
    // nicht erreichbar ist oder die Absenderdomain ablehnt.
    const detail = error instanceof Error ? error.message : String(error)
    console.error("[v0] contact email delivery failed:", detail)
    return { ok: false, error: "Die Nachricht wurde gespeichert, konnte aber nicht per E-Mail versendet werden." }
  }

  return { ok: true }
}
