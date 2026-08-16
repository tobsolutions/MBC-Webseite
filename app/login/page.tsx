import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { LoginForm } from "@/components/login-form"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Anmelden – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  const user = await getCurrentUser()
  if (user) redirect(redirectTo || "/intern")

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
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Mitgliederbereich
          </p>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">
            Anmelden
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Zugang zum internen Bereich des Modellbauclubs Bellenberg e.V.
          </p>
        </div>
        <LoginForm redirectTo={redirectTo || "/intern"} />
      </Card>
    </main>
  )
}
