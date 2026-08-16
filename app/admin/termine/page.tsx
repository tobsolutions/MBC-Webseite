import { getAllEvents } from "@/lib/queries"
import { EventsManager } from "@/components/admin/events-manager"

export const metadata = { title: "Termine – Verwaltung | MBC Bellenberg" }

export default async function AdminEvents() {
  const items = await getAllEvents()
  return <EventsManager items={items} />
}
