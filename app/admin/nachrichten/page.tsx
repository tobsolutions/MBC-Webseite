import { getContactMessages } from "@/lib/queries"
import { MessagesManager } from "@/components/admin/messages-manager"

export const metadata = { title: "Nachrichten – Verwaltung | MBC Bellenberg" }

export default async function AdminMessages() {
  const messages = await getContactMessages()
  return <MessagesManager messages={messages} />
}
