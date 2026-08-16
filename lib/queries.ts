import "server-only"
import { db } from "@/lib/db"
import { pages, news, events, documents, images, contactMessages, user } from "@/lib/db/schema"
import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm"
import type { Role } from "@/lib/roles"
import { visibleScopesForRole as visibleScopesFor } from "@/lib/roles"

// ---- Public pages ----------------------------------------------------------
export async function getPublicNavPages() {
  return db
    .select({ slug: pages.slug, title: pages.title })
    .from(pages)
    .where(and(eq(pages.visibility, "public"), eq(pages.published, true), eq(pages.showInNav, true)))
    .orderBy(asc(pages.sortOrder), asc(pages.title))
}

export async function getPublicPage(slug: string) {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.visibility, "public"), eq(pages.published, true)))
    .limit(1)
  return rows[0] ?? null
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

// ---- Gallery ---------------------------------------------------------------
export async function getGalleryImages() {
  return db.select().from(images).orderBy(asc(images.album), asc(images.sortOrder), desc(images.createdAt))
}

// ---------------------------------------------------------------------------
// Internal reads (role-scoped). There is no RLS — always filter by scope.
// ---------------------------------------------------------------------------
export async function getInternalNavPages(role: Role) {
  const scopes = visibleScopesFor(role)
  return db
    .select({ slug: pages.slug, title: pages.title })
    .from(pages)
    .where(and(inArray(pages.visibility, scopes), eq(pages.published, true)))
    .orderBy(asc(pages.sortOrder), asc(pages.title))
}

export async function getInternalPage(slug: string, role: Role) {
  const scopes = visibleScopesFor(role)
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

export async function getAllImages() {
  return db.select().from(images).orderBy(asc(images.album), asc(images.sortOrder))
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

export async function getAdminStats() {
  const [p, n, e, d, i, m, msgs] = await Promise.all([
    db.select({ id: pages.id }).from(pages),
    db.select({ id: news.id }).from(news),
    db.select({ id: events.id }).from(events),
    db.select({ id: documents.id }).from(documents),
    db.select({ id: images.id }).from(images),
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
