import { getAllNews } from "@/lib/queries"
import { NewsManager } from "@/components/admin/news-manager"

export const metadata = { title: "Aktuelles – Verwaltung | MBC Bellenberg" }

export default async function AdminNews() {
  const items = await getAllNews()
  return <NewsManager items={items} />
}
