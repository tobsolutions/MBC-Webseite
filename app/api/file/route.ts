import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"
import { getCurrentUser } from "@/lib/session"

// Serves files from the private Blob store.
// - Files under "dokumente/" require an authenticated member (any role).
// - Other files (gallery/cover images) are served openly for the public site.
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname) {
    return NextResponse.json({ error: "pathname fehlt" }, { status: 400 })
  }

  if (pathname.startsWith("dokumente/")) {
    const user = await getCurrentUser()
    if (!user) {
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
