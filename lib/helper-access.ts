import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { getSetting } from "@/lib/queries"
import { getCurrentUser } from "@/lib/session"
import { HELPER_PASSWORD_KEY } from "@/lib/settings-keys"

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>

export const HELPER_COOKIE = "mbc_helfer"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export const helperCookieOptions = {
  httpOnly: true,
  secure: true,
  // Im Entwicklungsmodus laeuft die Vorschau in einem iframe und braucht SameSite=None.
  sameSite: (process.env.NODE_ENV === "production" ? "lax" : "none") as "lax" | "none",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
}

export async function hashHelperPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password.normalize("NFKC"), salt, 64)
  return `${salt.toString("hex")}:${key.toString("hex")}`
}

export async function verifyHelperPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":")
  if (!saltHex || !keyHex) return false
  const expected = Buffer.from(keyHex, "hex")
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function sign(expiresAt: number, passwordHash: string): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error("BETTER_AUTH_SECRET ist nicht gesetzt.")
  // Der Passwort-Hash fliesst in die Signatur ein: Ein neues Passwort macht alle alten Cookies ungueltig.
  return createHmac("sha256", secret).update(`${expiresAt}.${passwordHash}`).digest("base64url")
}

export function createHelperToken(passwordHash: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  return `${expiresAt}.${sign(expiresAt, passwordHash)}`
}

export async function hasHelperCookie(): Promise<boolean> {
  const token = (await cookies()).get(HELPER_COOKIE)?.value
  if (!token) return false
  const stored = await getSetting(HELPER_PASSWORD_KEY)
  if (!stored) return false

  const [expiresRaw, signature] = token.split(".")
  const expiresAt = Number(expiresRaw)
  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  const expected = Buffer.from(sign(expiresAt, stored))
  const actual = Buffer.from(signature)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// Angemeldete Mitglieder/Admins haben automatisch Zugriff, alle anderen brauchen das Helfer-Passwort.
export async function getHelperAccess(): Promise<{ via: "member" | "password" } | null> {
  const user = await getCurrentUser()
  if (user && (user.role === "admin" || user.role === "mitglied")) return { via: "member" }
  if (await hasHelperCookie()) return { via: "password" }
  return null
}

export async function requireHelperAccess() {
  const access = await getHelperAccess()
  if (!access) redirect("/helfer/zugang")
  return access
}
