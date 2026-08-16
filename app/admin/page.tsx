import Link from "next/link"
import {
  FileStack,
  Newspaper,
  CalendarDays,
  FolderOpen,
  ImageIcon,
  Users,
  Mail,
} from "lucide-react"
import { getAdminStats, getContactMessages } from "@/lib/queries"
import { formatDateTime } from "@/lib/format"
import { Card } from "@/components/ui/card"

export const metadata = { title: "Übersicht – Verwaltung | MBC Bellenberg" }

export default async function AdminHome() {
  const [stats, messages] = await Promise.all([getAdminStats(), getContactMessages()])
  const recent = messages.slice(0, 5)

  const cards = [
    { href: "/admin/seiten", label: "Seiten", value: stats.pages, icon: FileStack },
    { href: "/admin/aktuelles", label: "Beiträge", value: stats.news, icon: Newspaper },
    { href: "/admin/termine", label: "Termine", value: stats.events, icon: CalendarDays },
    { href: "/admin/dokumente", label: "Dokumente", value: stats.documents, icon: FolderOpen },
    { href: "/admin/galerie", label: "Bilder", value: stats.images, icon: ImageIcon },
    { href: "/admin/mitglieder", label: "Mitglieder", value: stats.members, icon: Users },
  ]

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Dashboard</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-balance">Verwaltung</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Willkommen im Backend. Hier verwalten Sie alle Inhalte der Vereinswebseite.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="flex items-center gap-4 p-4 transition-colors hover:border-accent">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-secondary">
                <c.icon className="size-5 text-accent" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold leading-none">{c.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <Mail className="size-5 text-accent" /> Neueste Nachrichten
          </h2>
          <Link href="/admin/nachrichten" className="text-sm font-medium text-accent hover:underline">
            Alle ansehen
          </Link>
        </div>
        <Card className="divide-y divide-border">
          {recent.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Noch keine Nachrichten.</p>
          ) : (
            recent.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {m.name}
                    {!m.isRead && (
                      <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                        neu
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{m.subject || m.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  )
}
