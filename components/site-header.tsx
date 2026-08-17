"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, LogIn, UserRound, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export type NavItem = { href: string; label: string; children?: NavItem[] }

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
          <Image
            src="/images/logo-mbc-weiss.png"
            alt="Modellbauclub Bellenberg e.V. Logo"
            width={2048}
            height={1081}
            priority
            className="h-11 w-auto"
          />
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
            const hasChildren = item.children && item.children.length > 0

            if (hasChildren) {
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-foreground/15 text-brand-foreground"
                        : "text-brand-foreground/75 hover:text-brand-foreground",
                    )}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-52 pt-1 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-md border border-border bg-popover py-1 shadow-lg">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-4 py-2 text-sm text-popover-foreground transition-colors hover:bg-secondary hover:text-accent",
                            pathname === child.href && "text-accent",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

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
                    <div key={item.href} className="flex flex-col">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                          active ? "bg-secondary text-accent" : "text-foreground hover:bg-secondary",
                        )}
                      >
                        {item.label}
                      </Link>
                      {item.children && item.children.length > 0 && (
                        <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "rounded-sm px-3 py-1.5 text-sm transition-colors",
                                pathname === child.href
                                  ? "text-accent"
                                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
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
