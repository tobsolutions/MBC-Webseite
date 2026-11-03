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
  multiple = false,
}: {
  kind: "bilder" | "dokumente"
  accept?: string
  label?: string
  currentUrl?: string | null
  onUploaded: (result: UploadResult) => void
  onClear?: () => void
  preview?: boolean
  multiple?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function prepareImage(file: File) {
    if (kind !== "bilder" || !file.type.startsWith("image/")) return file

    const bitmap = await createImageBitmap(file)
    const longestSide = Math.max(bitmap.width, bitmap.height)
    if (longestSide < 1200) {
      setWarning(`Das Bild hat nur ${bitmap.width} × ${bitmap.height} Pixel. Für eine gute Darstellung werden mindestens 1200 Pixel an der langen Seite empfohlen.`)
    } else {
      setWarning(null)
    }

    if (longestSide <= 1200) {
      bitmap.close()
      return file
    }

    const scale = 1200 / longestSide
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88))
    if (!blob) throw new Error("Das Bild konnte nicht verarbeitet werden.")
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" })
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    setError(null)
    setWarning(null)
    try {
      for (const [index, file] of files.entries()) {
        const preparedFile = await prepareImage(file)
        const fd = new FormData()
        fd.append("file", preparedFile)
        fd.append("kind", kind)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Upload von ${file.name} fehlgeschlagen`)
        }
        const data: UploadResult = await res.json()
        setFileName(data.fileName)
        onUploaded(data)
        setUploadProgress({ current: index + 1, total: files.length })
      }
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
        multiple={multiple}
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
      {uploading && uploadProgress.total > 0 && (
        <div className="space-y-1.5" aria-live="polite">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bilder werden hochgeladen …</span>
            <span>{uploadProgress.current} von {uploadProgress.total}</span>
          </div>
          <progress
            className="h-2 w-full overflow-hidden rounded-full"
            value={uploadProgress.current}
            max={uploadProgress.total}
            aria-label="Uploadfortschritt"
          />
        </div>
      )}
      {warning && <p className="text-sm text-amber-700 dark:text-amber-300">{warning}</p>}
      {preview && currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl || "/placeholder.svg"} alt="Vorschau" className="mt-2 h-32 w-auto rounded-sm border border-border object-cover" />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
