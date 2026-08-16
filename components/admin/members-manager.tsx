"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Save, KeyRound } from "lucide-react"
import { createMember, updateMemberRole, resetMemberPassword, deleteMember } from "@/app/actions/admin"
import { ROLE_LABELS, type Role } from "@/lib/roles"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DeleteButton } from "@/components/admin/delete-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type Member = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date | string
}

const ROLES: Role[] = ["admin", "mitglied", "ausstellungshelfer"]

function CreateDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createMember(fd)
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else setError(res.error ?? "Fehler beim Anlegen.")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Mitglied anlegen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neues Mitglied</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Name</Label>
            <Input id="m-name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-email">E-Mail</Label>
            <Input id="m-email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-pass">Passwort</Label>
            <Input id="m-pass" name="password" type="text" minLength={8} required />
            <p className="text-xs text-muted-foreground">Mindestens 8 Zeichen. Dem Mitglied mitteilen.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-role">Rolle</Label>
            <select
              id="m-role"
              name="role"
              defaultValue="mitglied"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Anlegen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({ member }: { member: Member }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await resetMemberPassword(fd)
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else setError(res.error ?? "Fehler.")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Passwort zurücksetzen">
          <KeyRound className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Passwort zurücksetzen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={member.id} />
          <p className="text-sm text-muted-foreground">
            Neues Passwort für <span className="font-medium text-foreground">{member.name}</span>.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="r-pass">Neues Passwort</Label>
            <Input id="r-pass" name="password" type="text" minLength={8} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RoleSelect({ member }: { member: Member }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <select
      value={member.role}
      disabled={pending}
      onChange={(e) => {
        const role = e.target.value
        startTransition(async () => {
          await updateMemberRole(member.id, role)
          router.refresh()
        })
      }}
      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  )
}

export function MembersManager({ members }: { members: Member[] }) {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Verein</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Mitglieder</h1>
        </div>
        <CreateDialog />
      </header>

      <Card className="divide-y divide-border">
        {members.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{m.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {m.email} · seit {formatDate(m.createdAt)}
              </p>
            </div>
            <RoleSelect member={m} />
            <ResetPasswordDialog member={m} />
            <DeleteButton
              onDelete={() => deleteMember(m.id)}
              iconOnly
              title={`„${m.name}" entfernen?`}
              description="Der Zugang und alle Anmeldedaten werden gelöscht."
            />
          </div>
        ))}
      </Card>
    </div>
  )
}
