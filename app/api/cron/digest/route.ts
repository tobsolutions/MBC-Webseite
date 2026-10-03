import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { runDailyDigest } from "@/lib/digest"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Wird taeglich vom Vercel-Cron aufgerufen. Schutz ueber CRON_SECRET (Bearer-Token).
export async function GET() {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = (await headers()).get("authorization")
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const result = await runDailyDigest()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
