// Pure, client-safe role helpers. No server-only imports (next/headers etc.)
// so this can be imported from both client and server components.

// Ausstellungshelfer sind keine Benutzerrolle mehr: Sie erhalten Zugriff ueber das
// gemeinsame Helfer-Passwort (siehe lib/helper-access.ts) ohne eigenes Konto.
export type Role = "admin" | "mitglied"

// Which content visibilities can a role see in the internal area?
export function visibleScopesForRole(role: Role): string[] {
  switch (role) {
    case "admin":
    case "mitglied":
      // Mitglieder sehen zusaetzlich alle Inhalte fuer Ausstellungshelfer.
      return ["public", "mitglied", "ausstellungshelfer"]
    default:
      return ["public"]
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  mitglied: "Mitglied",
}
