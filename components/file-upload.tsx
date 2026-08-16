"use client"

import { useRef, useState } from "react"
import { Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export type UploadResult = {
  url: string
  pathname: string
  fileName: string
  fileSize: number
}

export function FileUpload({
  kind,
  accept,
  label = "Datei auswählen",
  currentUrl,
  onUploaded,
  onClear,
  preview = false,
}: {
  kind: "bilder" | "dokumente"
  accept?: string
  label?: string
  currentUrl?: string | null
  onUploaded: (result: UploadResult) => void
  onClear?: () => void
  preview?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("kind", kind)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Upload fehlgeschlagen")
      }
      const data: UploadResult = await res.json()
      setFileName(data.fileName)
      onUploaded(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Wird hochgeladen…" : label}
        </Button>
        {(fileName || currentUrl) && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            {fileName ?? "Datei vorhanden"}
            {onClear && (
              <button
                type="button"
                onClick={() => {
                  setFileName(null)
                  onClear()
                }}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Entfernen"
              >
                <X className="size-4" />
              </button>
            )}
          </span>
        )}
      </div>
      {preview && currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl || "/placeholder.svg"} alt="Vorschau" className="mt-2 h-32 w-auto rounded-sm border border-border object-cover" />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
