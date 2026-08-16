import { getAllMembers } from "@/lib/queries"
import { MembersManager } from "@/components/admin/members-manager"

export const metadata = { title: "Mitglieder – Verwaltung | MBC Bellenberg" }

export default async function AdminMembers() {
  const members = await getAllMembers()
  return <MembersManager members={members} />
}
