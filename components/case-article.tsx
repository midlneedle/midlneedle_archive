'use client'

import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import styles from './case-article.module.css'
import type { CaseArticleBlock } from '@/lib/case-article'

interface CaseArticleProps {
  title: string
  blocks: CaseArticleBlock[]
  footnotes: string[]
  publishedAt: string
}

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

function toHeadingSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'section'
}

function renderInline(
  text: string,
  footnoteCounter: { current: number },
  onFootnoteNavigate: (event: MouseEvent<HTMLAnchorElement>) => void
) {
  const segments = text.split(/(\\\*)/)
  const nodes: ReactNode[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment === '\\*') {
      footnoteCounter.current += 1

      let precedingText = ''
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1]
        if (typeof lastNode === 'string') {
          const match = lastNode.match(/(\S+(?:\s+\S+)?)$/)
          if (match) {
            precedingText = match[1]
            nodes[nodes.length - 1] = lastNode.slice(0, -precedingText.length)
          }
        }
      }

      if (precedingText) {
        nodes.push(precedingText)
        nodes.push(' ')
      }

      nodes.push(
        <a
          key={`fn-${footnoteCounter.current}-${nodes.length}`}
          id={`fnref-${footnoteCounter.current}`}
          href={`#fn-${footnoteCounter.current}`}
          data-footnote-ref
          aria-label={`Сноска ${footnoteCounter.current}`}
          className={styles.footnoteRef}
          onClick={onFootnoteNavigate}
        >
          <span className={styles.footnoteNumber}>{footnoteCounter.current}</span>
        </a>
      )
      continue
    }

    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = boldRegex.exec(segment))) {
      if (match.index > lastIndex) {
        nodes.push(segment.slice(lastIndex, match.index))
      }
      nodes.push(<strong key={`b-${match.index}-${nodes.length}`}>{match[1]}</strong>)
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < segment.length) {
      nodes.push(segment.slice(lastIndex))
    }
  }

  return nodes
}

function CaseArticleToc({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <aside className={styles.toc} aria-label="Навигация по статье">
      <div className={styles.tocList}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`type-card-caption ${styles.tocItem} ${
              item.level === 3 ? styles.tocItemSublevel : ''
            } ${activeId === item.id ? styles.tocItemActive : ''}`}
          >
            {item.text}
          </button>
        ))}
      </div>
    </aside>
  )
}

export function CaseArticle({ title, blocks, footnotes, publishedAt }: CaseArticleProps) {
  const footnoteCounter = { current: 0 }
  const { items: tocItems, idByBlockIndex } = useMemo(() => {
    const nextItems: TocItem[] = []
    const seen = new Map<string, number>()
    const indexToId = new Map<number, string>()

    blocks.forEach((block, blockIndex) => {
      if (block.type !== 'heading' && block.type !== 'subheading') {
        return
      }

      const baseId = toHeadingSlug(block.text)
      const count = (seen.get(baseId) ?? 0) + 1
      seen.set(baseId, count)
      const id = count === 1 ? baseId : `${baseId}-${count}`
      const level = block.type === 'heading' ? 2 : 3

      nextItems.push({
        id,
        text: block.text,
        level,
      })
      indexToId.set(blockIndex, id)
    })

    return { items: nextItems, idByBlockIndex: indexToId }
  }, [blocks])
  const [activeTocId, setActiveTocId] = useState(tocItems[0]?.id ?? '')
  const [isTocVisible, setIsTocVisible] = useState(false)

  useEffect(() => {
    if (tocItems.length === 0) {
      return
    }

    const headingNodes = tocItems
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null)

    if (headingNodes.length === 0) {
      return
    }

    const activationViewportRatio = 0.68
    const revealOffset = 40
    let ticking = false

    const updateActiveSection = () => {
      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight
      const activationLine = viewportHeight * activationViewportRatio

      setIsTocVisible(scrollTop > revealOffset)

      let currentId = headingNodes[0].id

      for (const node of headingNodes) {
        if (node.getBoundingClientRect().top <= activationLine) {
          currentId = node.id
        } else {
          break
        }
      }

      setActiveTocId((previousId) => (previousId === currentId ? previousId : currentId))
    }

    const scheduleUpdate = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        updateActiveSection()
        ticking = false
      })
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [tocItems])

  const handleTocNavigate = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return

    const top = target.getBoundingClientRect().top + window.scrollY - 112
    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  }

  const handleFootnoteNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute('href')
    if (!href?.startsWith('#')) return

    const target = document.querySelector<HTMLElement>(href)
    if (!target) return

    event.preventDefault()
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    window.history.pushState(null, '', href)
  }

  return (
    <main className="min-h-screen bg-background">
      {tocItems.length > 0 ? (
        <div className={`${styles.tocWrap} ${isTocVisible ? styles.tocVisible : ''}`}>
          <CaseArticleToc items={tocItems} activeId={activeTocId} onNavigate={handleTocNavigate} />
        </div>
      ) : null}
      <div className="mx-auto max-w-2xl">
        <section>
            <header className="flex flex-col">
              <h2 className="type-card-title text-foreground">{title}</h2>
              <div className={`type-card-caption ${styles.meta}`}>{publishedAt}</div>
            </header>

            <article data-article-content className={`mt-[var(--space-text)] ${styles.article}`}>
              {blocks.map((block, index) => {
                if (block.type === 'heading') {
                  const headingId = idByBlockIndex.get(index)
                  return (
                    <h2
                      key={`h-${index}`}
                      id={headingId}
                      className={`type-card-title text-foreground ${styles.sectionTitle}`}
                    >
                      {block.text}
                    </h2>
                  )
                }

                if (block.type === 'subheading') {
                  const headingId = idByBlockIndex.get(index)
                  return (
                    <h3
                      key={`h3-${index}`}
                      id={headingId}
                      className={`type-card-title text-foreground ${styles.cardTitle}`}
                    >
                      {block.text}
                    </h3>
                  )
                }

                if (block.type === 'media') {
                  return (
                    <div key={`m-${index}`} className={`${styles.placeholder} ${block.aspect}`}>
                      <span className="type-card-caption text-muted-foreground">{block.label}</span>
                    </div>
                  )
                }

                return (
                  <p
                    key={`p-${index}`}
                    className={`type-article text-foreground ${styles.paragraph}`}
                  >
                    {renderInline(block.text, footnoteCounter, handleFootnoteNavigate)}
                  </p>
                )
              })}
            </article>

            {footnotes.length > 0 ? (
              <section className={styles.footnotes} data-footnotes>
                <ol className={styles.footnotesList} data-prose-type="list">
                  {footnotes.map((note, index) => (
                    <li
                      key={`fn-item-${index}`}
                      className={styles.footnoteItem}
                      id={`fn-${index + 1}`}
                      data-index={index + 1}
                      data-prose-type="text"
                    >
                      {renderInline(note, { current: 0 }, handleFootnoteNavigate)}
                      <a
                        href={`#fnref-${index + 1}`}
                        data-footnote-backref
                        className={styles.footnoteBackref}
                        aria-label={`Назад к упоминанию сноски ${index + 1}`}
                        onClick={handleFootnoteNavigate}
                      >
                        ↩
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
        </section>
      </div>
    </main>
  )
}
