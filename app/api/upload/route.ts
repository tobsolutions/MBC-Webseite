import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"

// Admin-only upload endpoint. Files are stored in a private Blob store and
// delivered through /api/file so member documents stay access-controlled.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const kind = (formData.get("kind") as string | null) ?? "bilder" // "bilder" | "dokumente"

    if (!file) {
      return NextResponse.json({ error: "Keine Datei übermittelt" }, { status: 400 })
    }

    const folder = kind === "dokumente" ? "dokumente" : "bilder"
    const safeName = file.name.replace(/[^\w.\-]+/g, "_")
    const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
      access: "private",
      addRandomSuffix: true,
    })

    return NextResponse.json({
      pathname: blob.pathname,
      url: `/api/file?pathname=${encodeURIComponent(blob.pathname)}`,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 })
  }
}
