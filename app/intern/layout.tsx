import type { ReactNode } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  CalendarClock,
  FolderOpen,
  ArrowLeft,
  ShieldCheck,
  UserCog,
} from "lucide-react"
import { requireUser, ROLE_LABELS } from "@/lib/session"
import { getInternalNavPages } from "@/lib/queries"
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav"
import { SignOutButton } from "@/components/sign-out-button"

export default async function InternLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/intern")
  const pages = await getInternalNavPages(user.role)

  const schichtplanItem: DashboardNavItem = {
    href: "/intern/schichtplan",
    label: "Schichtplan Ausstellung",
    icon: <CalendarClock className="size-4" />,
  }

  // CMS-Seiten in Menuepunkte umwandeln und den Schichtplan-Link direkt oberhalb
  // der Seite "Infos fuer Ausstellungshelfer" (Slug helfer-infos) einfuegen.
  const pageItems: DashboardNavItem[] = []
  for (const p of pages) {
    if (p.slug === "helfer-infos") pageItems.push(schichtplanItem)
    pageItems.push({
      href: `/intern/seite/${p.slug}`,
      label: p.title,
      icon: <FileText className="size-4" />,
    })
  }
  // Falls die Helfer-Seite nicht in der Navigation ist, den Schichtplan ans Ende anhaengen.
  if (!pages.some((p) => p.slug === "helfer-infos")) pageItems.push(schichtplanItem)

  const items: DashboardNavItem[] = [
    { href: "/intern", label: "Übersicht", icon: <LayoutDashboard className="size-4" /> },
    { href: "/intern/termine", label: "Termine", icon: <CalendarDays className="size-4" /> },
    { href: "/intern/dokumente", label: "Dokumente", icon: <FolderOpen className="size-4" /> },
    ...pageItems,
  ]

  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:py-10">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="lg:sticky lg:top-10">
          <div className="mb-6 border-b border-border pb-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Mitgliederbereich</p>
            <p className="mt-2 font-serif text-lg font-bold leading-tight">{user.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>

          <DashboardNav items={items} />

          <div className="mt-6 flex flex-col gap-1 border-t border-border pt-4">
            <Link
              href="/intern/profil"
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <UserCog className="size-4" /> Mein Profil
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-secondary"
              >
                <ShieldCheck className="size-4" /> Verwaltung
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Zur Webseite
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
