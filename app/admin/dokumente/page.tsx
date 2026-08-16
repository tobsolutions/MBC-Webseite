import { getAllDocuments } from "@/lib/queries"
import { DocumentsManager } from "@/components/admin/documents-manager"

export const metadata = { title: "Dokumente – Verwaltung | MBC Bellenberg" }

export default async function AdminDocuments() {
  const items = await getAllDocuments()
  return <DocumentsManager items={items} />
}
