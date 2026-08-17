"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, LogIn, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export type NavItem = { href: string; label: string }

export function SiteHeader({
  navItems,
  isAuthenticated,
}: {
  navItems: NavItem[]
  isAuthenticated: boolean
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-brand bg-brand text-brand-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-foreground font-mono text-sm font-bold tracking-tight text-brand">
            MBC
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-serif text-sm font-bold uppercase tracking-wide text-brand-foreground">
              Modellbauclub
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-brand-foreground/70">
              Bellenberg e.V.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-foreground/15 text-brand-foreground"
                    : "text-brand-foreground/75 hover:text-brand-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden bg-brand-foreground text-brand hover:bg-brand-foreground/90 sm:inline-flex"
          >
            <Link href="/intern">
              {isAuthenticated ? (
                <>
                  <UserRound className="size-4" /> Interner Bereich
                </>
              ) : (
                <>
                  <LogIn className="size-4" /> Mitglieder-Login
                </>
              )}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-brand-foreground hover:bg-brand-foreground/15 hover:text-brand-foreground lg:hidden"
                aria-label="Menü öffnen"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-1 font-serif uppercase tracking-wide">Navigation</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-secondary text-accent" : "text-foreground hover:bg-secondary",
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <Link
                  href="/intern"
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-sm bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                >
                  {isAuthenticated ? "Interner Bereich" : "Mitglieder-Login"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
