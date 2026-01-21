interface SectionHeaderProps {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="font-semibold mt-14 mb-7 text-foreground">
      {title}
    </h2>
  )
}
