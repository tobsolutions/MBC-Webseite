import type { Metadata } from "next"
import { Mail, MapPin, Clock } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Kontakt · Modellbauclub Bellenberg e.V.",
}

export default function KontaktPage() {
  return (
    <div>
      <PageHero
        title="Kontakt"
        eyebrow="Schreiben Sie uns"
        subtitle="Interesse an einer Mitgliedschaft, an einem Besuch oder einfach eine Frage? Wir freuen uns auf Ihre Nachricht."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-serif text-2xl font-bold">So erreichen Sie uns</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Nutzen Sie das Formular oder besuchen Sie uns zu einem unserer Vereinsabende.
            </p>
            <ul className="mt-8 space-y-6">
              <li className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary text-accent">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <p className="font-medium">Vereinsheim</p>
                  <p className="text-sm text-muted-foreground">89287 Bellenberg, Bayern</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary text-accent">
                  <Clock className="size-5" />
                </span>
                <div>
                  <p className="font-medium">Vereinsabend</p>
                  <p className="text-sm text-muted-foreground">Jeden Freitag ab 19:00 Uhr</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary text-accent">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="font-medium">E-Mail</p>
                  <p className="text-sm text-muted-foreground">info@mbc-bellenberg.de</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-card p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
