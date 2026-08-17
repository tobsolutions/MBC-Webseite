"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react"
import { saveOutlookCalendarUrl } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Status = { ok: true; count: number } | { ok: false; error: string } | null

export function OutlookCalendarForm({
  currentUrl,
  status,
}: {
  currentUrl: string
  status: Status
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await saveOutlookCalendarUrl(fd)
      if (res.ok) {
        setSaved(true)
        router.refresh()
      } else {
        setError(res.error ?? "Fehler beim Speichern.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="url">ICS-Kalender-URL (Outlook / Microsoft 365)</Label>
        <Input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          defaultValue={currentUrl}
          placeholder="https://outlook.office365.com/owa/calendar/.../calendar.ics"
        />
        <p className="text-xs text-muted-foreground">
          Fügen Sie den veröffentlichten ICS-Link ein. Zum Entfernen das Feld leeren und speichern.
        </p>
      </div>

      {currentUrl && status && (
        <div
          className={
            status.ok
              ? "flex items-start gap-2 rounded-md border border-border bg-secondary/50 p-3 text-sm"
              : "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
          }
        >
          {status.ok ? (
            <>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                Verbindung erfolgreich – <strong>{status.count}</strong>{" "}
                {status.count === 1 ? "Termin" : "Termine"} im Zeitfenster gefunden.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>{status.error}</span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && !error && <p className="text-sm text-accent">Gespeichert.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Speichern
      </Button>
    </form>
  )
}
