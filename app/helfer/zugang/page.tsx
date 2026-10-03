import Link from "next/link"
import { redirect } from "next/navigation"
import { getHelperAccess } from "@/lib/helper-access"
import { HelperLoginForm } from "@/components/helper-login-form"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Helferzugang – Ausstellung | MBC Bellenberg e.V.",
  robots: { index: false, follow: false },
}

export default async function HelperAccessPage() {
  if (await getHelperAccess()) redirect("/helfer")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-primary px-4 py-12">
      <Link
        href="/"
        className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-primary-foreground/70 transition-colors hover:text-primary-foreground"
      >
        &larr; Zur Startseite
      </Link>
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Ausstellung</p>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">Helferzugang</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Infos und Schichtplan für Ausstellungshelfer. Bitte geben Sie das Passwort ein, das Sie vom Verein erhalten
            haben.
          </p>
        </div>
        <HelperLoginForm />
        <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Vereinsmitglied?{" "}
          <Link href="/login?redirect=/helfer" className="font-medium text-accent hover:underline">
            Mit Mitgliedskonto anmelden
          </Link>
        </p>
      </Card>
    </main>
  )
}
