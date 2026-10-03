import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"
import { getCurrentUser } from "@/lib/session"
import { hasHelperCookie } from "@/lib/helper-access"
import { getHelperDocuments } from "@/lib/queries"

// Helfer (Passwortzugang) duerfen nur Dokumente mit Sichtbarkeit "ausstellungshelfer" laden.
async function isHelperDocument(pathname: string) {
  if (!(await hasHelperCookie())) return false
  const docs = await getHelperDocuments()
  return docs.some((doc) => {
    try {
      return new URL(doc.fileUrl, "http://localhost").searchParams.get("pathname") === pathname
    } catch {
      return false
    }
  })
}

// Serves files from the private Blob store.
// - Files under "dokumente/" require an authenticated member, or the helper password for helper documents.
// - Other files (gallery/cover images) are served openly for the public site.
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname) {
    return NextResponse.json({ error: "pathname fehlt" }, { status: 400 })
  }

  if (pathname.startsWith("dokumente/")) {
    const user = await getCurrentUser()
    if (!user && !(await isHelperDocument(pathname))) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 401 })
    }
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    })

    if (!result) {
      return new NextResponse("Nicht gefunden", { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Datei konnte nicht geladen werden" }, { status: 500 })
  }
}
