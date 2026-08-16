const dateFmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const dateShortFmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const timeFmt = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
})

const weekdayFmt = new Intl.DateTimeFormat("de-DE", { weekday: "long" })
const monthYearFmt = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" })

export function formatDate(d: Date | string) {
  return dateFmt.format(new Date(d))
}

export function formatDateShort(d: Date | string) {
  return dateShortFmt.format(new Date(d))
}

export function formatTime(d: Date | string) {
  return timeFmt.format(new Date(d))
}

export function formatWeekday(d: Date | string) {
  return weekdayFmt.format(new Date(d))
}

export function formatMonthYear(d: Date | string) {
  return monthYearFmt.format(new Date(d))
}

export function formatEventWhen(startAt: Date | string, endAt: Date | string | null, allDay: boolean) {
  const start = new Date(startAt)
  if (allDay) return `${formatDate(start)} · ganztägig`
  let s = `${formatDate(start)} · ${formatTime(start)} Uhr`
  if (endAt) {
    const end = new Date(endAt)
    const sameDay = start.toDateString() === end.toDateString()
    if (sameDay) s += ` – ${formatTime(end)} Uhr`
    else s += ` – ${formatDate(end)} ${formatTime(end)} Uhr`
  }
  return s
}

export function formatDateTime(d: Date | string) {
  return `${dateShortFmt.format(new Date(d))} · ${timeFmt.format(new Date(d))} Uhr`
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
