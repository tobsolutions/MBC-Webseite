// Pure, client-safe role helpers. No server-only imports (next/headers etc.)
// so this can be imported from both client and server components.

export type Role = "admin" | "mitglied" | "ausstellungshelfer"

// Which content visibilities can a role see in the internal area?
export function visibleScopesForRole(role: Role): string[] {
  switch (role) {
    case "admin":
      return ["public", "mitglied", "ausstellungshelfer"]
    case "mitglied":
      return ["public", "mitglied"]
    case "ausstellungshelfer":
      return ["public", "ausstellungshelfer"]
    default:
      return ["public"]
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  mitglied: "Mitglied",
  ausstellungshelfer: "Ausstellungshelfer",
}
