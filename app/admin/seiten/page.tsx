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

type PageRow = Awaited<ReturnType<typeof getAllPages>>[number]
type OrderedPage = PageRow & { treeDepth: number }

export default async function AdminPages() {
  const pages = await getAllPages()
  const titleById = new Map(pages.map((p) => [p.id, p.title]))
  const publicPages = orderAsFrontendTree(pages.filter((p) => p.visibility === "public"))
  const internalPages = orderAsFrontendTree(pages.filter((p) => p.visibility !== "public"))

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

      {pages.length === 0 ? (
        <Card>
          <p className="p-4 text-sm text-muted-foreground">Noch keine Seiten angelegt.</p>
        </Card>
      ) : (
        <>
          <PageGroup
            title="Öffentliche Seiten"
            description="In derselben Hierarchie und Reihenfolge wie im Frontend-Menü."
            pages={publicPages}
            titleById={titleById}
            showVisibility={false}
          />
          <PageGroup
            title="Mitglieder & Ausstellungshelfer"
            description="In derselben Hierarchie und Reihenfolge wie im jeweiligen internen Menü."
            pages={internalPages}
            titleById={titleById}
            showVisibility
          />
        </>
      )}
    </div>
  )
}

function orderAsFrontendTree(pages: PageRow[]): OrderedPage[] {
  const ids = new Set(pages.map((page) => page.id))
  const children = new Map<number | null, PageRow[]>()

  for (const page of pages) {
    const parentId = page.parentId !== null && ids.has(page.parentId) ? page.parentId : null
    const siblings = children.get(parentId) ?? []
    siblings.push(page)
    children.set(parentId, siblings)
  }

  for (const siblings of children.values()) {
    siblings.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "de"))
  }

  const ordered: OrderedPage[] = []
  const visited = new Set<number>()
  function walk(parentId: number | null, depth: number) {
    for (const page of children.get(parentId) ?? []) {
      if (visited.has(page.id)) continue
      visited.add(page.id)
      ordered.push(Object.assign({}, page, { treeDepth: depth }) as OrderedPage)
      walk(page.id, depth + 1)
    }
  }

  walk(null, 0)
  return ordered
}

function PageGroup({
  title,
  description,
  pages,
  titleById,
  showVisibility,
}: {
  title: string
  description: string
  pages: OrderedPage[]
  titleById: Map<number, string>
  showVisibility: boolean
}) {
  const headingId = `gruppe-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 id={headingId} className="font-serif text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {pages.length} {pages.length === 1 ? "Seite" : "Seiten"}
        </span>
      </div>

      <Card className="divide-y divide-border">
        {pages.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Keine Seiten in dieser Gruppe.</p>
        ) : (
          pages.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-3 border-l-2 border-transparent p-4"
              style={{ paddingLeft: `${1 + p.treeDepth * 1.5}rem` }}
              data-depth={p.treeDepth}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.title}</span>
                  {p.parentId && titleById.has(p.parentId) && (
                    <Badge variant="outline">Unterseite von {titleById.get(p.parentId)}</Badge>
                  )}
                  {showVisibility && (
                    <Badge variant="secondary">{VIS_LABEL[p.visibility] ?? p.visibility}</Badge>
                  )}
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
    </section>
  )
}
