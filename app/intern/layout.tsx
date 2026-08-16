import type { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, FileText, CalendarDays, FolderOpen, ArrowLeft, ShieldCheck } from "lucide-react"
import { requireUser, ROLE_LABELS } from "@/lib/session"
import { getInternalNavPages } from "@/lib/queries"
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav"
import { SignOutButton } from "@/components/sign-out-button"

export default async function InternLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/intern")
  const pages = await getInternalNavPages(user.role)

  const items: DashboardNavItem[] = [
    { href: "/intern", label: "Übersicht", icon: <LayoutDashboard className="size-4" /> },
    { href: "/intern/termine", label: "Termine", icon: <CalendarDays className="size-4" /> },
    { href: "/intern/dokumente", label: "Dokumente", icon: <FolderOpen className="size-4" /> },
    ...pages.map((p) => ({
      href: `/intern/seite/${p.slug}`,
      label: p.title,
      icon: <FileText className="size-4" />,
    })),
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
