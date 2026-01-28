interface SectionHeaderProps {
  title: string
  iconSrc?: string
  iconAlt?: string
  pixelVariant?: "playground" | "cases" | "connect"
}

export function SectionHeader({
  title,
  iconSrc,
  iconAlt = "",
  pixelVariant,
}: SectionHeaderProps) {
  return (
    <h2 className="type-title mb-[var(--space-text)] inline-flex items-center gap-0 text-foreground">
      <span>{title}</span>
      {pixelVariant ? (
        <span
          aria-hidden="true"
          className={`title-pixel title-pixel--${pixelVariant}`}
        />
      ) : null}
      {iconSrc ? (
        <span className="pointer-events-none ml-0 translate-x-0 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-[0.2em]">
          <img src={iconSrc} alt={iconAlt} className="h-[1em] w-[1em]" />
        </span>
      ) : null}
    </h2>
  )
}
