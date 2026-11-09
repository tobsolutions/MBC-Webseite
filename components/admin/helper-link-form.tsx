"use client"

import { useActionState, useState } from "react"
import { CheckCircle2, Link2, Save } from "lucide-react"
import { saveHelperLinkSecret, type HelperFormState } from "@/app/actions/helper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function HelperLinkForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<HelperFormState, FormData>(saveHelperLinkSecret, null)
  const [secret, setSecret] = useState("")
  const link = secret.length >= 16 && typeof window !== "undefined"
    ? `${window.location.origin}/helfer/schichtplan?secret=${encodeURIComponent(secret)}`
    : null

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {configured ? "Ein Direktlink-Secret ist hinterlegt. Beim Speichern eines neuen Secrets werden alte Links ungültig." : "Noch kein Direktlink-Secret eingerichtet."}
      </p>
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="helper-link-secret">Neues Secret</Label>
          <Input id="helper-link-secret" name="secret" value={secret} onChange={(event) => setSecret(event.target.value)} minLength={16} autoComplete="off" required placeholder="mindestens 16 Zeichen" />
        </div>
        <Button type="submit" disabled={pending}><Save className="size-4" /> Secret speichern</Button>
      </form>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state?.ok && link && (
        <div className="space-y-2 rounded-md border border-accent/30 bg-accent/5 p-3">
          <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="size-4 text-accent" /> Direktlink erstellt</p>
          <div className="flex gap-2">
            <Input readOnly value={link} aria-label="Direktlink zum Schichtplan" />
            <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(link)}><Link2 className="size-4" /> Kopieren</Button>
          </div>
        </div>
      )}
    </div>
  )
}
