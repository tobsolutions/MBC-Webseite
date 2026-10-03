"use client"

import { useState, useTransition } from "react"
import { Loader2, Send } from "lucide-react"
import { triggerDigestNow } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"

export function DigestTestButton() {
  const [pending, startTransition] = useTransition()
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function run() {
    setInfo(null)
    setError(null)
    startTransition(async () => {
      const res = await triggerDigestNow()
      if (res.ok) setInfo(res.info ?? "Versand ausgeführt.")
      else setError(res.error ?? "Versand fehlgeschlagen.")
    })
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={run} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Zusammenfassung jetzt senden
      </Button>
      {info && <p className="text-sm text-accent">{info}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
