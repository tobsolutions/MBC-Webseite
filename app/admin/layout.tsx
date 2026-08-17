import type { ReactNode } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  FileStack,
  Newspaper,
  CalendarDays,
  FolderOpen,
  ImageIcon,
  Users,
  Mail,
  Settings,
  ArrowLeft,
} from "lucide-react"
import { requireAdmin } from "@/lib/session"
import { getAdminStats } from "@/lib/queries"
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav"
import { SignOutButton } from "@/components/sign-out-button"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin("/admin")
  const stats = await getAdminStats()

  const items: DashboardNavItem[] = [
    { href: "/admin", label: "Übersicht", icon: <LayoutDashboard className="size-4" /> },
    { href: "/admin/seiten", label: "Seiten", icon: <FileStack className="size-4" /> },
    { href: "/admin/aktuelles", label: "Aktuelles", icon: <Newspaper className="size-4" /> },
    { href: "/admin/termine", label: "Termine", icon: <CalendarDays className="size-4" /> },
    { href: "/admin/dokumente", label: "Dokumente", icon: <FolderOpen className="size-4" /> },
    { href: "/admin/galerie", label: "Galerie", icon: <ImageIcon className="size-4" /> },
    { href: "/admin/mitglieder", label: "Mitglieder", icon: <Users className="size-4" /> },
    {
      href: "/admin/nachrichten",
      label: "Nachrichten",
      icon: <Mail className="size-4" />,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
    },
    { href: "/admin/einstellungen", label: "Einstellungen", icon: <Settings className="size-4" /> },
  ]

  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:py-10">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="lg:sticky lg:top-10">
          <div className="mb-6 border-b border-border pb-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Verwaltung</p>
            <p className="mt-2 font-serif text-lg font-bold leading-tight">MBC Backend</p>
            <p className="text-xs text-muted-foreground">{user.name}</p>
          </div>

          <DashboardNav items={items} />

          <div className="mt-6 flex flex-col gap-1 border-t border-border pt-4">
            <Link
              href="/intern"
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Mitgliederbereich
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
