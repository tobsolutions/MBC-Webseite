import { notFound } from "next/navigation"
import { getPageById } from "@/lib/queries"
import { PageEditor } from "@/components/admin/page-editor"

export const metadata = { title: "Seite bearbeiten – Verwaltung | MBC Bellenberg" }

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === "neu"
  const page = isNew ? null : await getPageById(Number(id))
  if (!isNew && !page) notFound()

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Inhalte</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">
          {isNew ? "Neue Seite" : "Seite bearbeiten"}
        </h1>
      </header>
      <PageEditor page={page} />
    </div>
  )
}
