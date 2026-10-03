import { requireUser } from "@/lib/session"
import { SchichtplanView } from "@/components/schichtplan-view"

export const metadata = {
  title: "Schichtplan Ausstellung – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function SchichtplanPage() {
  await requireUser("/intern/schichtplan")
  return <SchichtplanView />
}
