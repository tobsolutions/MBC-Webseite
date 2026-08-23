import { requireUser } from "@/lib/session"
import { getUserDigestPreference } from "@/lib/queries"
import { ROLE_LABELS } from "@/lib/roles"
import { NotificationToggle } from "@/components/notification-toggle"

export const metadata = {
  title: "Mein Profil – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function ProfilPage() {
  const current = await requireUser("/intern/profil")
  const notifyDigest = await getUserDigestPreference(current.id)

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Konto</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Mein Profil</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Ihre persönlichen Angaben und Benachrichtigungseinstellungen.
        </p>
      </header>

      <section className="mt-8 space-y-8">
        <div>
          <h2 className="font-serif text-lg font-bold">Angaben</h2>
          <dl className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="text-sm font-medium">{current.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted-foreground">E-Mail</dt>
              <dd className="text-sm font-medium">{current.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Rolle</dt>
              <dd className="text-sm font-medium">{ROLE_LABELS[current.role] ?? current.role}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold">Benachrichtigungen</h2>
          <div className="mt-3">
            <NotificationToggle initialEnabled={notifyDigest} />
          </div>
        </div>
      </section>
    </div>
  )
}
