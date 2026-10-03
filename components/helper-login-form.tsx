"use client"

import { useActionState } from "react"
import { AlertCircle, KeyRound, Loader2 } from "lucide-react"
import { unlockHelperArea, type HelperFormState } from "@/app/actions/helper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function HelperLoginForm() {
  const [state, formAction, pending] = useActionState<HelperFormState, FormData>(unlockHelperArea, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="helper-password">Passwort</Label>
        <Input
          id="helper-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? "helper-password-error" : undefined}
        />
      </div>

      {state?.error && (
        <p
          id="helper-password-error"
          role="alert"
          className="flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Zugang öffnen
      </Button>
    </form>
  )
}
