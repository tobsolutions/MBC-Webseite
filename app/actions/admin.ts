"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { del } from "@vercel/blob"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/session"
import { db } from "@/lib/db"
import { OUTLOOK_CALENDAR_KEY } from "@/lib/settings-keys"
import {
  pages,
  news,
  events,
  documents,
  images,
  galleryAlbums,
  contactMessages,
  user,
  account,
  settings,
} from "@/lib/db/schema"

export type ActionResult = { ok: boolean; error?: string }

const VISIBILITIES = ["public", "mitglied", "ausstellungshelfer"] as const
function normVisibility(v: FormDataEntryValue | null): string {
  const s = String(v ?? "public")
  return (VISIBILITIES as readonly string[]).includes(s) ? s : "public"
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ---------------------------------------------------------------- Pages -----
export async function savePage(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = str(formData.get("id"))
  const title = str(formData.get("title"))
  if (!title) return { ok: false, error: "Titel ist erforderlich." }

  let slug = slugify(str(formData.get("slug")) || title)
  if (!slug) slug = `seite-${Date.now()}`

  // Uebergeordnete Seite; niemals sich selbst als Elternteil zulassen.
  const parentIdRaw = str(formData.get("parentId"))
  const parsedParent = parentIdRaw ? Number.parseInt(parentIdRaw, 10) : null
  const parentId = parsedParent && parsedParent !== Number(id) ? parsedParent : null

  const values = {
    slug,
    title,
    content: str(formData.get("content")),
    excerpt: str(formData.get("excerpt")),
    coverImage: str(formData.get("coverImage")) || null,
    parentId,
    visibility: normVisibility(formData.get("visibility")),
    sortOrder: Number.parseInt(str(formData.get("sortOrder")) || "0", 10) || 0,
    showInNav: formData.get("showInNav") === "on",
    published: formData.get("published") === "on",
    updatedAt: new Date(),
  }

  let parentSlug: string | null = null
  try {
    if (id) {
      await db.update(pages).set(values).where(eq(pages.id, Number(id)))
    } else {
      await db.insert(pages).values(values)
    }
    // Slug der Elternseite fuer gezielte Revalidierung ermitteln.
    if (parentId) {
      const parentRows = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, parentId)).limit(1)
      parentSlug = parentRows[0]?.slug ?? null
    }
  } catch {
    return { ok: false, error: "Der Slug wird bereits verwendet." }
  }

  revalidatePath("/admin/seiten")
  revalidatePath("/")
  revalidatePath(`/seite/${slug}`)
  revalidatePath(`/intern/seite/${slug}`)
  if (parentSlug) revalidatePath(`/seite/${parentSlug}`)
  return { ok: true }
}

export async function deletePage(id: number): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(pages).where(eq(pages.id, id))
  revalidatePath("/admin/seiten")
  revalidatePath("/")
  return { ok: true }
}

// ----------------------------------------------------------------- News -----
export async function saveNews(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = str(formData.get("id"))
  const title = str(formData.get("title"))
  if (!title) return { ok: false, error: "Titel ist erforderlich." }

  const publishedAtRaw = str(formData.get("publishedAt"))
  const values = {
    title,
    excerpt: str(formData.get("excerpt")),
    content: str(formData.get("content")),
    image: str(formData.get("image")) || null,
    published: formData.get("published") === "on",
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : new Date(),
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(news).set(values).where(eq(news.id, Number(id)))
  } else {
    await db.insert(news).values(values)
  }

  revalidatePath("/admin/aktuelles")
  revalidatePath("/seite/verein")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteNews(id: number): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(news).where(eq(news.id, id))
  revalidatePath("/admin/aktuelles")
  revalidatePath("/seite/verein")
  return { ok: true }
}

// --------------------------------------------------------------- Events -----
export async function saveEvent(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = str(formData.get("id"))
  const title = str(formData.get("title"))
  const startRaw = str(formData.get("startAt"))
  if (!title) return { ok: false, error: "Titel ist erforderlich." }
  if (!startRaw) return { ok: false, error: "Startdatum ist erforderlich." }

  const endRaw = str(formData.get("endAt"))
  const values = {
    title,
    description: str(formData.get("description")),
    location: str(formData.get("location")) || null,
    startAt: new Date(startRaw),
    endAt: endRaw ? new Date(endRaw) : null,
    allDay: formData.get("allDay") === "on",
    visibility: normVisibility(formData.get("visibility")),
    clubInternal: formData.get("clubInternal") === "on",
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(events).set(values).where(eq(events.id, Number(id)))
  } else {
    await db.insert(events).values(values)
  }

  revalidatePath("/admin/termine")
  revalidatePath("/termine")
  revalidatePath("/intern/termine")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(events).where(eq(events.id, id))
  revalidatePath("/admin/termine")
  revalidatePath("/termine")
  revalidatePath("/intern/termine")
  return { ok: true }
}

// ------------------------------------------------------------ Documents -----
export async function saveDocument(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const title = str(formData.get("title"))
  const fileUrl = str(formData.get("fileUrl"))
  const fileName = str(formData.get("fileName"))
  if (!title) return { ok: false, error: "Titel ist erforderlich." }
  if (!fileUrl || !fileName) return { ok: false, error: "Bitte eine Datei hochladen." }

  await db.insert(documents).values({
    title,
    description: str(formData.get("description")),
    fileUrl,
    fileName,
    fileSize: Number.parseInt(str(formData.get("fileSize")) || "0", 10) || null,
    category: str(formData.get("category")) || "allgemein",
    visibility: normVisibility(formData.get("visibility")) === "public" ? "mitglied" : normVisibility(formData.get("visibility")),
    uploadedBy: str(formData.get("uploadedBy")) || null,
  })

  revalidatePath("/admin/dokumente")
  revalidatePath("/intern/dokumente")
  return { ok: true }
}

export async function deleteDocument(id: number): Promise<ActionResult> {
  await requireAdmin()
  const rows = await db.select().from(documents).where(eq(documents.id, id)).limit(1)
  const doc = rows[0]
  if (doc?.fileUrl) {
    const pathname = doc.fileUrl.split("pathname=")[1]
    if (pathname) {
      try {
        await del(decodeURIComponent(pathname))
      } catch (e) {
        console.error("Blob delete failed:", e)
      }
    }
  }
  await db.delete(documents).where(eq(documents.id, id))
  revalidatePath("/admin/dokumente")
  revalidatePath("/intern/dokumente")
  return { ok: true }
}

// ---------------------------------------------------- Gallery albums --------
export async function saveGalleryAlbum(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const id = str(formData.get("id"))
  const title = str(formData.get("title"))
  if (!title) return { ok: false, error: "Titel ist erforderlich." }

  let slug = slugify(str(formData.get("slug")) || title)
  if (!slug) slug = `album-${Date.now()}`

  const values = {
    slug,
    title,
    description: str(formData.get("description")),
    coverImage: str(formData.get("coverImage")) || null,
    sortOrder: Number.parseInt(str(formData.get("sortOrder")) || "0", 10) || 0,
    updatedAt: new Date(),
  }

  try {
    if (id) {
      await db.update(galleryAlbums).set(values).where(eq(galleryAlbums.id, Number(id)))
    } else {
      await db.insert(galleryAlbums).values(values)
    }
  } catch {
    return { ok: false, error: "Der Slug wird bereits verwendet." }
  }

  revalidatePath("/admin/galerie")
  revalidatePath("/galerie")
  revalidatePath(`/galerie/${slug}`)
  return { ok: true }
}

export async function deleteGalleryAlbum(id: number): Promise<ActionResult> {
  await requireAdmin()
  // Zuerst alle Bilder des Albums aus dem Blob-Speicher entfernen.
  const albumImages = await db.select().from(images).where(eq(images.albumId, id))
  for (const img of albumImages) {
    if (img.url) {
      const pathname = img.url.split("pathname=")[1]
      if (pathname) {
        try {
          await del(decodeURIComponent(pathname))
        } catch (e) {
          console.error("Blob delete failed:", e)
        }
      }
    }
  }
  // Bilder werden per ON DELETE CASCADE mitgeloescht.
  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id))
  revalidatePath("/admin/galerie")
  revalidatePath("/galerie")
  return { ok: true }
}

// --------------------------------------------------------------- Images -----
export async function saveImage(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const url = str(formData.get("url"))
  const albumId = Number.parseInt(str(formData.get("albumId")), 10)
  if (!url) return { ok: false, error: "Bitte ein Bild hochladen." }
  if (!albumId) return { ok: false, error: "Bitte ein Album auswählen." }

  await db.insert(images).values({
    albumId,
    url,
    alt: str(formData.get("alt")),
    caption: str(formData.get("caption")) || null,
    sortOrder: Number.parseInt(str(formData.get("sortOrder")) || "0", 10) || 0,
  })

  // Falls das Album noch kein Titelbild hat, dieses Bild als Cover setzen.
  const albumRows = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, albumId)).limit(1)
  if (albumRows[0] && !albumRows[0].coverImage) {
    await db.update(galleryAlbums).set({ coverImage: url, updatedAt: new Date() }).where(eq(galleryAlbums.id, albumId))
  }

  revalidatePath("/admin/galerie")
  revalidatePath("/galerie")
  return { ok: true }
}

export async function deleteImage(id: number): Promise<ActionResult> {
  await requireAdmin()
  const rows = await db.select().from(images).where(eq(images.id, id)).limit(1)
  const img = rows[0]
  if (img?.url) {
    const pathname = img.url.split("pathname=")[1]
    if (pathname) {
      try {
        await del(decodeURIComponent(pathname))
      } catch (e) {
        console.error("Blob delete failed:", e)
      }
    }
  }
  await db.delete(images).where(eq(images.id, id))
  revalidatePath("/admin/galerie")
  revalidatePath("/galerie")
  return { ok: true }
}

// -------------------------------------------------------------- Members -----
export async function createMember(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const name = str(formData.get("name"))
  const email = str(formData.get("email")).toLowerCase()
  const password = String(formData.get("password") ?? "")
  const role = str(formData.get("role")) || "mitglied"
  if (!name || !email) return { ok: false, error: "Name und E-Mail sind erforderlich." }
  if (password.length < 8) return { ok: false, error: "Das Passwort muss mindestens 8 Zeichen haben." }

  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  if (existing.length > 0) return { ok: false, error: "Diese E-Mail ist bereits vergeben." }

  const ctx = await auth.$context
  const hashed = await ctx.password.hash(password)
  const userId = randomUUID()
  const now = new Date()

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: ["admin", "mitglied", "ausstellungshelfer"].includes(role) ? role : "mitglied",
    createdAt: now,
    updatedAt: now,
  })
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  })

  revalidatePath("/admin/mitglieder")
  return { ok: true }
}

export async function updateMemberRole(userId: string, role: string): Promise<ActionResult> {
  await requireAdmin()
  if (!["admin", "mitglied", "ausstellungshelfer"].includes(role)) {
    return { ok: false, error: "Ungültige Rolle." }
  }
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId))
  revalidatePath("/admin/mitglieder")
  return { ok: true }
}

export async function resetMemberPassword(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  const userId = str(formData.get("userId"))
  const password = String(formData.get("password") ?? "")
  if (password.length < 8) return { ok: false, error: "Das Passwort muss mindestens 8 Zeichen haben." }

  const ctx = await auth.$context
  const hashed = await ctx.password.hash(password)
  const existing = await db
    .select({ id: account.id })
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1)

  if (existing.length > 0) {
    await db.update(account).set({ password: hashed, updatedAt: new Date() }).where(eq(account.userId, userId))
  } else {
    await db.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  revalidatePath("/admin/mitglieder")
  return { ok: true }
}

export async function deleteMember(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (admin.id === userId) return { ok: false, error: "Sie können sich nicht selbst löschen." }
  await db.delete(user).where(eq(user.id, userId))
  revalidatePath("/admin/mitglieder")
  return { ok: true }
}

// ------------------------------------------------------------- Messages -----
export async function toggleMessageRead(id: number, isRead: boolean): Promise<ActionResult> {
  await requireAdmin()
  await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id))
  revalidatePath("/admin/nachrichten")
  return { ok: true }
}

export async function deleteMessage(id: number): Promise<ActionResult> {
  await requireAdmin()
  await db.delete(contactMessages).where(eq(contactMessages.id, id))
  revalidatePath("/admin/nachrichten")
  return { ok: true }
}

// ------------------------------------------------------------- Settings -----
export async function saveOutlookCalendarUrl(formData: FormData): Promise<ActionResult> {
  await requireAdmin()
  let url = str(formData.get("url"))

  // Leere Eingabe = Verknuepfung entfernen
  if (url) {
    if (url.startsWith("webcal://")) url = "https://" + url.slice("webcal://".length)
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return { ok: false, error: "Bitte eine gültige URL eingeben." }
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { ok: false, error: "Die URL muss mit https:// beginnen." }
    }
  }

  await db
    .insert(settings)
    .values({ key: OUTLOOK_CALENDAR_KEY, value: url, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: url, updatedAt: new Date() } })

  revalidatePath("/admin/einstellungen")
  revalidatePath("/intern/termine")
  return { ok: true }
}
