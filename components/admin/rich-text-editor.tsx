"use client"

import { useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toEditorHtml } from "@/lib/content-format"

type ToolbarButtonProps = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  active?: boolean
  disabled?: boolean
}

function ToolbarButton({ label, icon: Icon, onClick, active, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/10 text-primary",
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

function Separator() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
}

export function RichTextEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string
  defaultValue?: string | null
  placeholder?: string
}) {
  const [html, setHtml] = useState(() => toEditorHtml(defaultValue))
  const [sourceMode, setSourceMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
    ],
    content: html,
    editorProps: {
      attributes: {
        class: "cms-content min-h-72 px-4 py-3 text-sm leading-relaxed focus:outline-none",
        ...(placeholder ? { "aria-label": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  })

  function toggleSourceMode() {
    if (sourceMode && editor) {
      editor.commands.setContent(html, { emitUpdate: false })
    }
    setSourceMode((v) => !v)
  }

  function setLink(ed: Editor) {
    const previous = ed.getAttributes("link").href as string | undefined
    const url = window.prompt("Link-Adresse (z. B. https://… oder mailto:…)", previous ?? "https://")
    if (url === null) return
    if (url.trim() === "") {
      ed.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    const external = /^https?:\/\//i.test(url)
    ed.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim(), target: external ? "_blank" : null })
      .run()
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("kind", "bilder")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Upload fehlgeschlagen")
      editor.chain().focus().setImage({ src: data.url, alt: file.name.replace(/\.[^.]+$/, "") }).run()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const ed = editor
  const disabled = !ed || sourceMode

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40">
      <input type="hidden" name={name} value={html} />

      <div
        role="toolbar"
        aria-label="Formatierung"
        className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-2 py-1.5"
      >
        <ToolbarButton
          label="Absatz"
          icon={Pilcrow}
          disabled={disabled}
          active={ed?.isActive("paragraph")}
          onClick={() => ed?.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          label="Überschrift"
          icon={Heading2}
          disabled={disabled}
          active={ed?.isActive("heading", { level: 2 })}
          onClick={() => ed?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Zwischenüberschrift"
          icon={Heading3}
          disabled={disabled}
          active={ed?.isActive("heading", { level: 3 })}
          onClick={() => ed?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <Separator />
        <ToolbarButton
          label="Fett"
          icon={Bold}
          disabled={disabled}
          active={ed?.isActive("bold")}
          onClick={() => ed?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Kursiv"
          icon={Italic}
          disabled={disabled}
          active={ed?.isActive("italic")}
          onClick={() => ed?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Unterstrichen"
          icon={Underline}
          disabled={disabled}
          active={ed?.isActive("underline")}
          onClick={() => ed?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Durchgestrichen"
          icon={Strikethrough}
          disabled={disabled}
          active={ed?.isActive("strike")}
          onClick={() => ed?.chain().focus().toggleStrike().run()}
        />
        <Separator />
        <ToolbarButton
          label="Aufzählung"
          icon={List}
          disabled={disabled}
          active={ed?.isActive("bulletList")}
          onClick={() => ed?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Nummerierte Liste"
          icon={ListOrdered}
          disabled={disabled}
          active={ed?.isActive("orderedList")}
          onClick={() => ed?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Zitat"
          icon={Quote}
          disabled={disabled}
          active={ed?.isActive("blockquote")}
          onClick={() => ed?.chain().focus().toggleBlockquote().run()}
        />
        <Separator />
        <ToolbarButton
          label="Linksbündig"
          icon={AlignLeft}
          disabled={disabled}
          active={ed?.isActive({ textAlign: "left" })}
          onClick={() => ed?.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          label="Zentriert"
          icon={AlignCenter}
          disabled={disabled}
          active={ed?.isActive({ textAlign: "center" })}
          onClick={() => ed?.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          label="Rechtsbündig"
          icon={AlignRight}
          disabled={disabled}
          active={ed?.isActive({ textAlign: "right" })}
          onClick={() => ed?.chain().focus().setTextAlign("right").run()}
        />
        <Separator />
        <ToolbarButton
          label="Link einfügen"
          icon={Link2}
          disabled={disabled}
          active={ed?.isActive("link")}
          onClick={() => ed && setLink(ed)}
        />
        <ToolbarButton
          label="Link entfernen"
          icon={Unlink}
          disabled={disabled || !ed?.isActive("link")}
          onClick={() => ed?.chain().focus().extendMarkRange("link").unsetLink().run()}
        />
        <ToolbarButton
          label={uploading ? "Bild wird hochgeladen" : "Bild einfügen"}
          icon={uploading ? Loader2 : ImageIcon}
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolbarButton
          label="Trennlinie"
          icon={Minus}
          disabled={disabled}
          onClick={() => ed?.chain().focus().setHorizontalRule().run()}
        />
        <Separator />
        <ToolbarButton
          label="Rückgängig"
          icon={Undo2}
          disabled={disabled || !ed?.can().undo()}
          onClick={() => ed?.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Wiederholen"
          icon={Redo2}
          disabled={disabled || !ed?.can().redo()}
          onClick={() => ed?.chain().focus().redo().run()}
        />

        <button
          type="button"
          onClick={toggleSourceMode}
          aria-pressed={sourceMode}
          className={cn(
            "ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            sourceMode && "bg-primary/10 text-primary",
          )}
        >
          <Code2 className="size-4" />
          {sourceMode ? "Zurück zum Editor" : "HTML"}
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={handleImage} />

      {sourceMode ? (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          aria-label="HTML-Quelltext"
          className="block min-h-72 w-full resize-y bg-background px-4 py-3 font-mono text-xs leading-relaxed focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {uploadError && <p className="border-t border-input px-4 py-2 text-xs text-destructive">{uploadError}</p>}
    </div>
  )
}
