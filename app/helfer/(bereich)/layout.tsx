import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarClock, FileText, LayoutDashboard, LogOut, Users } from "lucide-react"
import { requireHelperAccess } from "@/lib/helper-access"
import { getHelperNavPages } from "@/lib/queries"
import { lockHelperArea } from "@/app/actions/helper"
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function HelperLayout({ children }: { children: ReactNode }) {
  const access = await requireHelperAccess()
  const pages = await getHelperNavPages()

  const items: DashboardNavItem[] = [
    { href: "/helfer", label: "Übersicht", icon: <LayoutDashboard className="size-4" /> },
    { href: "/helfer/schichtplan", label: "Schichtplan Ausstellung", icon: <CalendarClock className="size-4" /> },
    ...pages.map((p) => ({
      href: `/helfer/seite/${p.slug}`,
      label: p.title,
      icon: <FileText className="size-4" />,
    })),
  ]

  const linkClass =
    "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"

  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:py-10">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="lg:sticky lg:top-10">
          <div className="mb-6 border-b border-border pb-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Helferbereich</p>
            <p className="mt-2 font-serif text-lg font-bold leading-tight">Ausstellung</p>
            <p className="text-xs text-muted-foreground">
              {access.via === "member" ? "Zugriff über Mitgliedskonto" : "Zugriff per Helfer-Passwort"}
            </p>
          </div>

          <DashboardNav items={items} />

          <div className="mt-6 flex flex-col gap-1 border-t border-border pt-4">
            {access.via === "member" && (
              <Link href="/intern" className={linkClass}>
                <Users className="size-4" /> Mitgliederbereich
              </Link>
            )}
            <Link href="/" className={linkClass}>
              <ArrowLeft className="size-4" /> Zur Webseite
            </Link>
            {access.via === "password" && (
              <form action={lockHelperArea}>
                <button type="submit" className={`${linkClass} w-full`}>
                  <LogOut className="size-4" /> Abmelden
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
