"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mail, MailOpen } from "lucide-react"
import { toggleMessageRead, deleteMessage } from "@/app/actions/admin"
import { formatDateTime } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DeleteButton } from "@/components/admin/delete-button"

export type Message = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: Date | string
}

function ReadToggle({ message }: { message: Message }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleMessageRead(message.id, !message.isRead)
          router.refresh()
        })
      }
    >
      {message.isRead ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
      {message.isRead ? "Als ungelesen" : "Als gelesen"}
    </Button>
  )
}

export function MessagesManager({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Kommunikation</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Nachrichten</h1>
      </header>

      {messages.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">Noch keine Kontaktanfragen.</Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={m.isRead ? "p-4" : "border-accent p-4"}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{m.name}</span>
                    {!m.isRead && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                        neu
                      </span>
                    )}
                  </div>
                  <a href={`mailto:${m.email}`} className="text-sm text-accent hover:underline">
                    {m.email}
                  </a>
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
              </div>
              {m.subject && <p className="mt-3 font-medium">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
              <div className="mt-4 flex items-center gap-2">
                <ReadToggle message={m} />
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Ihre Anfrage"))}`}>
                    Antworten
                  </a>
                </Button>
                <DeleteButton onDelete={() => deleteMessage(m.id)} iconOnly title="Nachricht löschen?" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
