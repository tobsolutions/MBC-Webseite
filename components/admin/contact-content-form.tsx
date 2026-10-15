"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { saveContactContentPage } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function ContactContentForm({ currentPageId, pages }: { currentPageId: string; pages: { id: number; title: string; slug: string }[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveContactContentPage(data)
      if (result.ok) {
        setSaved(true)
        router.refresh()
      }
    })
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="contact-content-page">Inhalt unter dem Kontaktformular</Label>
        <select id="contact-content-page" name="pageId" defaultValue={currentPageId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Keine Seite einbetten</option>
          {pages.map((page) => <option key={page.id} value={page.id}>{page.title} (/{page.slug})</option>)}
        </select>
        <p className="text-xs text-muted-foreground">Nur öffentliche, veröffentlichte Seiten werden angeboten. Die Seite erscheint nicht automatisch im Menü.</p>
      </div>
      {saved && <p className="text-sm text-accent">Gespeichert.</p>}
      <Button type="submit" disabled={pending}><Save className="size-4" /> Speichern</Button>
    </form>
  )
}

export default ContactContentForm
