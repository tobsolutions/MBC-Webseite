import { cn } from "@/lib/utils"
import { toEditorHtml } from "@/lib/content-format"
import { sanitizeContentHtml } from "@/lib/sanitize-content"

// Renders CMS content. HTML from the editor is sanitized; older plain-text
// content ("## Heading", "- item", blank-line paragraphs) is converted first.
export function RichText({ content, className }: { content: string; className?: string }) {
  const html = sanitizeContentHtml(toEditorHtml(content))

  return (
    <div
      className={cn("cms-content leading-relaxed text-foreground/90", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
