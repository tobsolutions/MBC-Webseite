import Link from "next/link"
import { Mail, MapPin } from "lucide-react"

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent font-mono text-sm font-bold text-accent-foreground">
              MBC
            </span>
            <span className="font-serif text-sm font-bold uppercase tracking-wide">
              Modellbauclub Bellenberg e.V.
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            Ein Verein für technisch Interessierte, handwerklich Geschickte und kreative Köpfe.
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary-foreground/60">Kontakt</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>Vereinsheim, 89287 Bellenberg</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <Link href="/kontakt" className="hover:text-primary-foreground">
                Kontaktformular
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary-foreground/60">Rechtliches</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li>
              <Link href="/seite/impressum" className="hover:text-primary-foreground">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/seite/datenschutz" className="hover:text-primary-foreground">
                Datenschutz
              </Link>
            </li>
            <li>
              <Link href="/intern" className="hover:text-primary-foreground">
                Mitgliederbereich
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/50 sm:flex-row">
          <p>© {year} Modellbauclub Bellenberg e.V. Alle Rechte vorbehalten.</p>
          <p className="font-mono uppercase tracking-widest">Bellenberg · Bayern</p>
        </div>
      </div>
    </footer>
  )
}
