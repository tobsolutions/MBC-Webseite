import "server-only"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Absender: eigene verifizierte Domain bevorzugt, sonst Resend-Testabsender.
export const DIGEST_FROM = process.env.DIGEST_FROM_EMAIL ?? "MBC Bellenberg <onboarding@resend.dev>"

// Oeffentliche Basis-URL fuer Links in E-Mails.
export function resolveAppURL(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL ?? "http://localhost:3000"
}

export type DigestItem = {
  title: string
  meta: string
}

type DigestData = {
  events: DigestItem[]
  documents: DigestItem[]
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderSection(heading: string, items: DigestItem[]): string {
  if (items.length === 0) return ""
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;color:#1a1a1a;">${escapeHtml(i.title)}</div>
          <div style="font-size:13px;color:#666;margin-top:2px;">${escapeHtml(i.meta)}</div>
        </td>
      </tr>`,
    )
    .join("")
  return `
    <h2 style="font-size:16px;color:#1a1a1a;margin:24px 0 4px;">${escapeHtml(heading)}</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
}

export function renderDigestHtml(data: DigestData): string {
  const appUrl = resolveAppURL()
  const eventsHtml = renderSection("Neue Termine", data.events)
  const documentsHtml = renderSection("Neue Dokumente", data.documents)
  return `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;max-width:560px;">
            <tr><td>
              <h1 style="font-size:20px;margin:0 0 4px;">MBC Bellenberg – Neuigkeiten</h1>
              <p style="font-size:14px;color:#666;margin:0 0 8px;">Ihre tägliche Zusammenfassung neuer Termine und Dokumente im Mitgliederbereich.</p>
              ${eventsHtml}
              ${documentsHtml}
              <div style="margin-top:32px;">
                <a href="${appUrl}/intern" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;">Zum Mitgliederbereich</a>
              </div>
              <p style="font-size:12px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
                Sie erhalten diese E-Mail, weil Sie die tägliche Zusammenfassung in Ihrem Profil aktiviert haben.
                Sie können dies jederzeit unter <a href="${appUrl}/intern/profil" style="color:#666;">Profil</a> wieder deaktivieren.
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendDigestEmail(to: string, data: DigestData): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: DIGEST_FROM,
      to,
      subject: "MBC Bellenberg – Neue Termine und Dokumente",
      html: renderDigestHtml(data),
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler" }
  }
}
