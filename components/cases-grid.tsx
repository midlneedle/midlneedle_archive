interface CaseItem {
  title: string
  date: string
  href?: string
}

interface CasesGridProps {
  cases: CaseItem[]
}

function CaseCard({ title, date, href }: CaseItem) {
  const content = (
    <div className="flex w-full items-center gap-[calc(var(--space-text)*0.5)] py-[calc(var(--space-text)*0.4)]">
      <span className="cases-item-title type-card-title text-foreground transition-colors duration-200">
        {title}
      </span>
      <span
        aria-hidden="true"
        className="h-px flex-1 bg-[var(--stroke)]"
      />
      <span className="type-card-title text-muted-foreground transition-colors duration-200 group-hover/item:text-foreground">
        {date}
      </span>
    </div>
  )

  return href ? (
    <a href={href} className="cases-item group/item block w-full">
      {content}
    </a>
  ) : (
    <div className="cases-item group/item">
      {content}
    </div>
  )
}

export function CasesGrid({ cases }: CasesGridProps) {
  return (
    <div className="cases-list group/list flex flex-col">
      {cases.map((item, index) => (
        <CaseCard key={`${item.title}-${index}`} {...item} />
      ))}
    </div>
  )
}
