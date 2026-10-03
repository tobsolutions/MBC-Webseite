import { betterAuth } from "better-auth"
import { Pool } from "pg"

// BETTER_AUTH_URL wird beim Self-Hosting oft ohne Protokoll eingetragen
// (z. B. "tobsolutions.de" oder "tobsolutions.de:3000"). Ohne Protokoll ist der
// Wert keine gueltige URL – dann "http://" annehmen.
function parseAuthUrl(raw: string | undefined): URL | null {
  const value = (raw ?? "").trim().replace(/\/+$/, "")
  if (!value) return null
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `http://${value}`)
  } catch {
    return null
  }
}

function resolveBaseURL() {
  const configured = parseAuthUrl(process.env.BETTER_AUTH_URL)
  if (configured) return configured.origin
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL
}

function resolveTrustedOrigins() {
  const origins: string[] = []
  if (process.env.NODE_ENV === "development") {
    if (process.env.V0_RUNTIME_URL) origins.push(process.env.V0_RUNTIME_URL)
    // The v0 preview is served from ephemeral sandbox domains that differ from
    // V0_RUNTIME_URL, so trust the v0 preview host patterns (wildcards are
    // supported by Better Auth) plus localhost for local development.
    origins.push(
      "https://*.vercel.run",
      "https://*.v0.build",
      "https://*.v0.dev",
      "http://localhost:3000",
    )
  } else {
    if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
      origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }

  // Self-Hosting (Docker/Plesk): Seite ist oft mit und ohne "www" erreichbar.
  // Beide Varianten der BETTER_AUTH_URL zulassen, sonst schlaegt der Login mit
  // "Invalid origin" fehl.
  // Zusaetzlich http/https und den Container-Port (Standard 3000) zulassen, damit
  // der direkte Aufruf ueber z. B. http://domain:3000 ebenso funktioniert wie
  // der Aufruf ueber den Plesk-Proxy (https://domain).
  const url = parseAuthUrl(process.env.BETTER_AUTH_URL)
  if (url) {
    const bareHost = url.hostname.replace(/^www\./, "")
    const hosts = [bareHost, `www.${bareHost}`]
    const appPort = process.env.PORT || "3000"
    const ports = new Set(["", url.port, appPort])
    for (const protocol of ["http:", "https:"]) {
      for (const host of hosts) {
        for (const port of ports) {
          origins.push(`${protocol}//${host}${port ? `:${port}` : ""}`)
        }
      }
    }
  }

  // Weitere erlaubte Adressen, kommagetrennt (z. B. Test-Subdomain).
  for (const origin of (process.env.TRUSTED_ORIGINS ?? "").split(",")) {
    const trimmed = origin.trim().replace(/\/+$/, "")
    if (trimmed) origins.push(trimmed)
  }

  return origins
}

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: resolveBaseURL(),
  trustedOrigins: resolveTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "mitglied",
        input: false,
      },
    },
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
