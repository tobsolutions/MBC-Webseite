import Link from "next/link"
import { Plus, Pencil, Eye, EyeOff } from "lucide-react"
import { getAllPages } from "@/lib/queries"
import { deletePage } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteButton } from "@/components/admin/delete-button"

export const metadata = { title: "Seiten – Verwaltung | MBC Bellenberg" }

const VIS_LABEL: Record<string, string> = {
  public: "Öffentlich",
  mitglied: "Mitglieder",
  ausstellungshelfer: "Ausstellungshelfer",
}

export default async function AdminPages() {
  const pages = await getAllPages()
  const titleById = new Map(pages.map((p) => [p.id, p.title]))

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Inhalte</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Seiten</h1>
        </div>
        <Button asChild>
          <Link href="/admin/seiten/neu">
            <Plus className="size-4" /> Neue Seite
          </Link>
        </Button>
      </header>

      <Card className="divide-y divide-border">
        {pages.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Noch keine Seiten angelegt.</p>
        ) : (
          pages.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.title}</span>
                  {p.parentId && titleById.has(p.parentId) && (
                    <Badge variant="outline">Unterseite von {titleById.get(p.parentId)}</Badge>
                  )}
                  <Badge variant="secondary">{VIS_LABEL[p.visibility] ?? p.visibility}</Badge>
                  {p.published ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="size-3.5" /> sichtbar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <EyeOff className="size-3.5" /> Entwurf
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/seiten/${p.id}`}>
                    <Pencil className="size-4" /> Bearbeiten
                  </Link>
                </Button>
                <DeleteButton
                  onDelete={async () => {
                    "use server"
                    return deletePage(p.id)
                  }}
                  iconOnly
                  title={`„${p.title}" löschen?`}
                />
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
