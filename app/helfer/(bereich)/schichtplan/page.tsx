import { requireHelperAccess } from "@/lib/helper-access"
import { SchichtplanView } from "@/components/schichtplan-view"

export const metadata = {
  title: "Schichtplan Ausstellung – Helferbereich | MBC Bellenberg e.V.",
}

export default async function HelperSchichtplanPage() {
  await requireHelperAccess()
  return <SchichtplanView />
}
