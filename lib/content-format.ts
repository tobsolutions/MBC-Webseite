export function isHtmlContent(content: string) {
  return /^\s*<[a-z][\s\S]*>/i.test(content)
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Converts the older plain-text format ("## Heading", "- item", blank-line paragraphs) to HTML. */
export function legacyTextToHtml(content: string) {
  return content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) return `<h3>${escapeHtml(block.slice(4))}</h3>`
      if (block.startsWith("## ")) return `<h2>${escapeHtml(block.slice(3))}</h2>`
      if (block.startsWith("# ")) return `<h2>${escapeHtml(block.slice(2))}</h2>`
      const lines = block.split("\n")
      if (lines.every((l) => l.startsWith("- "))) {
        return `<ul>${lines.map((l) => `<li><p>${escapeHtml(l.slice(2))}</p></li>`).join("")}</ul>`
      }
      return `<p>${lines.map(escapeHtml).join("<br>")}</p>`
    })
    .join("")
}

export function toEditorHtml(content: string | null | undefined) {
  if (!content) return ""
  return isHtmlContent(content) ? content : legacyTextToHtml(content)
}
