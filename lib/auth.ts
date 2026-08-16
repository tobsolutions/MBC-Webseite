import { betterAuth } from "better-auth"
import { Pool } from "pg"

function resolveBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
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
