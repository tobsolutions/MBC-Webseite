import "server-only"
import { db } from "@/lib/db"
import { pages, news, events, documents, images, galleryAlbums, contactMessages, user, settings } from "@/lib/db/schema"
import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm"
import type { Role } from "@/lib/roles"
import { visibleScopesForRole as visibleScopesFor } from "@/lib/roles"

// ---- Public pages ----------------------------------------------------------
export type NavPage = {
  slug: string
  title: string
  children: { slug: string; title: string }[]
}

// Navigation als Baum: Top-Level-Seiten mit ihren untergeordneten Seiten (fuer Dropdowns).
export async function getPublicNavPages(): Promise<NavPage[]> {
  const rows = await db
    .select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      parentId: pages.parentId,
    })
    .from(pages)
    .where(and(eq(pages.visibility, "public"), eq(pages.published, true), eq(pages.showInNav, true)))
    .orderBy(asc(pages.sortOrder), asc(pages.title))

  const tops = rows.filter((r) => r.parentId == null)
  return tops.map((top) => ({
    slug: top.slug,
    title: top.title,
    children: rows
      .filter((r) => r.parentId === top.id)
      .map((c) => ({ slug: c.slug, title: c.title })),
  }))
}

export async function getPublicPage(slug: string) {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.visibility, "public"), eq(pages.published, true)))
    .limit(1)
  return rows[0] ?? null
}

// Untergeordnete Seiten einer Elternseite inkl. Kurztext und Titelbild (fuer die Auflistung).
export async function getChildPages(parentId: number) {
  return db
    .select({
      slug: pages.slug,
      title: pages.title,
      excerpt: pages.excerpt,
      coverImage: pages.coverImage,
    })
    .from(pages)
    .where(and(eq(pages.parentId, parentId), eq(pages.visibility, "public"), eq(pages.published, true)))
    .orderBy(asc(pages.sortOrder), asc(pages.title))
}

// ---- News ------------------------------------------------------------------
export async function getPublishedNews(limit?: number) {
  const q = db
    .select()
    .from(news)
    .where(eq(news.published, true))
    .orderBy(desc(news.publishedAt))
  if (limit) return q.limit(limit)
  return q
}

export async function getNewsItem(id: number) {
  const rows = await db.select().from(news).where(eq(news.id, id)).limit(1)
  return rows[0] ?? null
}

// ---- Events ----------------------------------------------------------------
export async function getPublicEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.visibility, "public"))
    .orderBy(asc(events.startAt))
}

export async function getUpcomingPublicEvents(limit = 4) {
  return db
    .select()
    .from(events)
    .where(and(eq(events.visibility, "public"), gte(events.startAt, new Date())))
    .orderBy(asc(events.startAt))
    .limit(limit)
}

export async function getPastPublicEvents(limit = 20) {
  return db
    .select()
    .from(events)
    .where(and(eq(events.visibility, "public"), lt(events.startAt, new Date())))
    .orderBy(desc(events.startAt))
    .limit(limit)
}

// Events filtered by which visibility scopes a user may see.
export async function getEventsForScopes(scopes: string[]) {
  return db
    .select()
    .from(events)
    .where(inArray(events.visibility, scopes))
    .orderBy(asc(events.startAt))
}

// ---- Gallery (Alben) -------------------------------------------------------
// Alle Galerie-Alben mit Anzahl der enthaltenen Bilder (fuer die Uebersicht).
export async function getGalleryAlbums() {
  return db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      title: galleryAlbums.title,
      description: galleryAlbums.description,
      coverImage: galleryAlbums.coverImage,
      sortOrder: galleryAlbums.sortOrder,
      imageCount: sql<number>`count(${images.id})::int`,
    })
    .from(galleryAlbums)
    .leftJoin(images, eq(images.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id)
    .orderBy(asc(galleryAlbums.sortOrder), asc(galleryAlbums.title))
}

// Ein Album per Slug inkl. aller zugeordneten Bilder (fuer die Unterseite).
export async function getGalleryAlbum(slug: string) {
  const rows = await db.select().from(galleryAlbums).where(eq(galleryAlbums.slug, slug)).limit(1)
  const album = rows[0]
  if (!album) return null
  const albumImages = await db
    .select()
    .from(images)
    .where(eq(images.albumId, album.id))
    .orderBy(asc(images.sortOrder), desc(images.createdAt))
  return { album, images: albumImages }
}

// ---------------------------------------------------------------------------
// Internal reads (role-scoped). There is no RLS — always filter by scope.
// ---------------------------------------------------------------------------
export async function getInternalNavPages(role: Role) {
  // Oeffentliche Seiten gehoeren nicht in den Mitgliederbereich.
  const scopes = visibleScopesFor(role).filter((s) => s !== "public")
  return db
    .select({ slug: pages.slug, title: pages.title })
    .from(pages)
    .where(and(inArray(pages.visibility, scopes), eq(pages.published, true)))
    .orderBy(asc(pages.sortOrder), asc(pages.title))
}

export async function getInternalPage(slug: string, role: Role) {
  // Oeffentliche Seiten gehoeren nicht in den Mitgliederbereich.
  const scopes = visibleScopesFor(role).filter((s) => s !== "public")
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), inArray(pages.visibility, scopes), eq(pages.published, true)))
    .limit(1)
  return rows[0] ?? null
}

export async function getInternalUpcomingEvents(role: Role, limit?: number) {
  const scopes = [...visibleScopesFor(role), "public"]
  const q = db
    .select()
    .from(events)
    .where(and(inArray(events.visibility, scopes), gte(events.startAt, new Date())))
    .orderBy(asc(events.startAt))
  if (limit) return q.limit(limit)
  return q
}

export async function getInternalEvents(role: Role) {
  const scopes = [...visibleScopesFor(role), "public"]
  return db
    .select()
    .from(events)
    .where(inArray(events.visibility, scopes))
    .orderBy(asc(events.startAt))
}

export async function getInternalDocuments(role: Role) {
  const scopes = visibleScopesFor(role)
  return db
    .select()
    .from(documents)
    .where(inArray(documents.visibility, scopes))
    .orderBy(desc(documents.createdAt))
}

// ---------------------------------------------------------------------------
// Admin reads (full access)
// ---------------------------------------------------------------------------
export async function getAllPages() {
  return db.select().from(pages).orderBy(asc(pages.sortOrder), asc(pages.title))
}

export async function getPageById(id: number) {
  const rows = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getAllNews() {
  return db.select().from(news).orderBy(desc(news.publishedAt))
}

export async function getNewsById(id: number) {
  const rows = await db.select().from(news).where(eq(news.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getAllEvents() {
  return db.select().from(events).orderBy(asc(events.startAt))
}

export async function getEventById(id: number) {
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getAllDocuments() {
  return db.select().from(documents).orderBy(desc(documents.createdAt))
}

export async function getAllGalleryAlbums() {
  return db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      title: galleryAlbums.title,
      description: galleryAlbums.description,
      coverImage: galleryAlbums.coverImage,
      sortOrder: galleryAlbums.sortOrder,
      imageCount: sql<number>`count(${images.id})::int`,
    })
    .from(galleryAlbums)
    .leftJoin(images, eq(images.albumId, galleryAlbums.id))
    .groupBy(galleryAlbums.id)
    .orderBy(asc(galleryAlbums.sortOrder), asc(galleryAlbums.title))
}

export async function getGalleryAlbumById(id: number) {
  const rows = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1)
  const album = rows[0]
  if (!album) return null
  const albumImages = await db
    .select()
    .from(images)
    .where(eq(images.albumId, album.id))
    .orderBy(asc(images.sortOrder), desc(images.createdAt))
  return { album, images: albumImages }
}

export async function getAllMembers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.name))
}

export async function getContactMessages() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt))
}

// ---- Settings --------------------------------------------------------------
export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, key)).limit(1)
  return rows[0]?.value ?? null
}

export async function getAdminStats() {
  const [p, n, e, d, i, m, msgs] = await Promise.all([
    db.select({ id: pages.id }).from(pages),
    db.select({ id: news.id }).from(news),
    db.select({ id: events.id }).from(events),
    db.select({ id: documents.id }).from(documents),
    db.select({ id: galleryAlbums.id }).from(galleryAlbums),
    db.select({ id: user.id }).from(user),
    db.select({ id: contactMessages.id }).from(contactMessages).where(eq(contactMessages.isRead, false)),
  ])
  return {
    pages: p.length,
    news: n.length,
    events: e.length,
    documents: d.length,
    images: i.length,
    members: m.length,
    unreadMessages: msgs.length,
  }
}
