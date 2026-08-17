import type { ReactNode } from "react"
import { SiteHeader, type NavItem } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPublicNavPages } from "@/lib/queries"
import { getCurrentUser } from "@/lib/session"

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [cmsPages, user] = await Promise.all([getPublicNavPages(), getCurrentUser()])

  const navItems: NavItem[] = [
    { href: "/", label: "Startseite" },
    ...cmsPages.map((p) => ({ href: `/seite/${p.slug}`, label: p.title })),
    { href: "/galerie", label: "Galerie" },
    { href: "/termine", label: "Termine" },
    { href: "/kontakt", label: "Kontakt" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader navItems={navItems} isAuthenticated={!!user} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
