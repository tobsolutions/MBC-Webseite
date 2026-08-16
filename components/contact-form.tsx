"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { submitContactMessage, type ContactResult } from "@/app/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Wird gesendet…" : (<><Send className="size-4" /> Nachricht senden</>)}
    </Button>
  )
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactResult | null, FormData>(submitContactMessage, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) {
      toast.success("Vielen Dank! Ihre Nachricht wurde übermittelt.")
      formRef.current?.reset()
    } else if (state && !state.ok && state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" placeholder="Ihr Name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="ihre@email.de" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Betreff</Label>
        <Input id="subject" name="subject" placeholder="Worum geht es?" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Nachricht</Label>
        <Textarea id="message" name="message" required rows={6} placeholder="Ihre Nachricht an uns…" />
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Firma (bitte leer lassen)</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />
    </form>
  )
}
