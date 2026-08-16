import { cn } from "@/lib/utils"

// Lightweight text renderer for CMS content.
// Supports: "## Heading", "- bullet", and blank-line separated paragraphs.
export function RichText({ content, className }: { content: string; className?: string }) {
  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)

  return (
    <div className={cn("space-y-5 leading-relaxed text-foreground/90", className)}>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="font-serif text-2xl font-bold text-foreground">
              {block.slice(3)}
            </h2>
          )
        }
        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="font-serif text-xl font-bold text-foreground">
              {block.slice(4)}
            </h3>
          )
        }
        const lines = block.split("\n")
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-accent">
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="text-pretty">
            {block}
          </p>
        )
      })}
    </div>
  )
}
