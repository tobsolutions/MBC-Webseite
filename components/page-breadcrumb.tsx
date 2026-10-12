import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type Crumb = { href: string; label: string }

export function PageBreadcrumb({
  items,
  current,
  className,
}: {
  items: Crumb[]
  current: string
  className?: string
}) {
  return (
    <nav aria-label="Brotkrümelnavigation" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-1.5">
            <Link href={item.href} className="transition-colors hover:text-foreground hover:underline">
              {item.label}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
          </li>
        ))}
        <li>
          <span aria-current="page" className="font-medium text-foreground">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}
