import Image from "next/image"

export function PageHero({
  title,
  subtitle,
  image,
  eyebrow,
}: {
  title: string
  subtitle?: string
  image?: string | null
  eyebrow?: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
      {image && (
        <div className="absolute inset-0">
          <Image src={image || "/placeholder.svg"} alt="" fill priority className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/50" />
        </div>
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl text-balance font-serif text-3xl font-bold md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
