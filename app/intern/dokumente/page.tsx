import { FileText, FileDown } from "lucide-react"
import { requireUser } from "@/lib/session"
import { getInternalDocuments } from "@/lib/queries"
import { formatDate, formatFileSize } from "@/lib/format"

export const metadata = {
  title: "Dokumente – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function InternDocumentsPage() {
  const user = await requireUser("/intern/dokumente")
  const documents = await getInternalDocuments(user.role)

  // Group by category
  const groups = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    const key = doc.category || "Allgemein"
    ;(acc[key] ??= []).push(doc)
    return acc
  }, {})
  const categories = Object.keys(groups).sort((a, b) => a.localeCompare(b, "de"))

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Downloads</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Dokumente</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Satzung, Protokolle, Formulare und weitere interne Unterlagen.
        </p>
      </header>

      {documents.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Es sind noch keine Dokumente hinterlegt.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{cat}</h2>
              <div className="mt-3 divide-y divide-border border-t border-border">
                {groups[cat].map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-4"
                  >
                    <FileText className="size-5 shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium group-hover:text-accent">{doc.title}</h3>
                      {doc.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{doc.description}</p>
                      )}
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {doc.fileName}
                        {doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ""} · {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    <FileDown className="size-4 shrink-0 text-muted-foreground group-hover:text-accent" />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
