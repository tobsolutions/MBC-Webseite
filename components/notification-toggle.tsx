"use client"

import { useState, useTransition } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { updateDigestPreference } from "@/app/actions/profile"

export function NotificationToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    const next = !enabled
    setEnabled(next) // optimistisch
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const res = await updateDigestPreference(next)
      if (res.ok) {
        setSaved(true)
      } else {
        setEnabled(!next) // zuruecksetzen bei Fehler
        setError(res.error ?? "Speichern fehlgeschlagen.")
      }
    })
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="font-medium">Tägliche Zusammenfassung per E-Mail</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Erhalten Sie einmal täglich eine E-Mail mit neuen Terminen und Dokumenten aus dem
          Mitgliederbereich. Sie können dies jederzeit hier ändern.
        </p>
        <div className="mt-2 flex h-4 items-center gap-1.5 text-xs">
          {pending && (
            <>
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Wird gespeichert …</span>
            </>
          )}
          {!pending && saved && (
            <>
              <CheckCircle2 className="size-3.5 text-accent" />
              <span className="text-accent">Gespeichert.</span>
            </>
          )}
          {!pending && error && <span className="text-destructive">{error}</span>}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Tägliche Zusammenfassung per E-Mail erhalten"
        onClick={toggle}
        disabled={pending}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 ${
          enabled ? "bg-accent" : "bg-input"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-background shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  )
}
