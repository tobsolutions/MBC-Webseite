"use client"

import { useActionState, useTransition } from "react"
import { AlertCircle, CheckCircle2, Loader2, Lock, Save } from "lucide-react"
import { disableHelperAccess, saveHelperPassword, type HelperFormState } from "@/app/actions/helper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function HelperPasswordForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState<HelperFormState, FormData>(saveHelperPassword, null)
  const [disabling, startDisable] = useTransition()

  return (
    <div className="space-y-4">
      <p
        className={`flex items-center gap-2 text-sm ${configured ? "text-foreground" : "text-muted-foreground"}`}
      >
        {configured ? (
          <CheckCircle2 className="size-4 shrink-0 text-accent" />
        ) : (
          <Lock className="size-4 shrink-0" />
        )}
        {configured
          ? "Der Helferzugang ist aktiv. Das aktuelle Passwort ist verschlüsselt gespeichert und kann nicht angezeigt werden."
          : "Der Helferzugang ist noch nicht freigeschaltet. Legen Sie ein Passwort fest, um ihn zu aktivieren."}
      </p>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="helper-new-password">{configured ? "Neues Passwort" : "Passwort"}</Label>
          <Input
            id="helper-new-password"
            name="password"
            type="text"
            autoComplete="off"
            minLength={6}
            required
            placeholder="mindestens 6 Zeichen"
          />
          <p className="text-xs text-muted-foreground">
            Nach dem Ändern müssen sich alle Helfer mit dem neuen Passwort erneut anmelden.
          </p>
        </div>

        {state?.error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" /> {state.error}
          </p>
        )}
        {state?.ok && (
          <p role="status" className="flex items-center gap-2 text-sm text-accent">
            <CheckCircle2 className="size-4 shrink-0" /> Passwort gespeichert.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Passwort speichern
          </Button>
          {configured && (
            <Button
              type="button"
              variant="outline"
              disabled={disabling}
              onClick={() => {
                if (!confirm("Helferzugang wirklich deaktivieren? Alle Helfer werden abgemeldet.")) return
                startDisable(async () => {
                  await disableHelperAccess()
                })
              }}
            >
              {disabling && <Loader2 className="size-4 animate-spin" />}
              Zugang deaktivieren
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
