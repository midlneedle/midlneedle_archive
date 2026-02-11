'use client'

import {
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import styles from './case-article.module.css'
import type { CaseArticleBlock } from '@/lib/case-article'

interface CaseArticleProps {
  content: {
    eng: {
      title: string
      blocks: CaseArticleBlock[]
      footnotes: string[]
      publishedAt: string
    }
    ru: {
      title: string
      blocks: CaseArticleBlock[]
      footnotes: string[]
      publishedAt: string
    }
  }
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

export function CaseArticle({ content }: CaseArticleProps) {
  const [language, setLanguage] = useState<'eng' | 'ru'>('eng')
  const currentContent = content[language]
  const { title, blocks, footnotes, publishedAt } = currentContent
  const footnoteCounter = { current: 0 }

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
      <div className="mx-auto max-w-2xl">
        <section>
            <header className="flex flex-col">
              <h2 className="type-card-title text-foreground">{title}</h2>
              <div className={`type-card-caption ${styles.meta}`}>
                <span className={styles.languageSwitch} aria-label="Article language">
                  <button
                    type="button"
                    className={`${styles.languageButton} ${
                      language === 'eng' ? styles.languageButtonActive : ''
                    }`}
                    onClick={() => setLanguage('eng')}
                    aria-pressed={language === 'eng'}
                  >
                    In english
                  </button>
                  <span aria-hidden="true" className={styles.languageSeparator}> / </span>
                  <button
                    type="button"
                    className={`${styles.languageButton} ${
                      language === 'ru' ? styles.languageButtonActive : ''
                    }`}
                    onClick={() => setLanguage('ru')}
                    aria-pressed={language === 'ru'}
                  >
                    На русском
                  </button>
                </span>
                <span aria-hidden="true">·</span>
                <span>{publishedAt}</span>
              </div>
            </header>

            <article data-article-content className={`mt-[var(--space-text)] ${styles.article}`}>
              {blocks.map((block, index) => {
                if (block.type === 'heading') {
                  return (
                    <h2
                      key={`h-${index}`}
                      className={`type-card-title text-foreground ${styles.sectionTitle}`}
                    >
                      {block.text}
                    </h2>
                  )
                }

                if (block.type === 'subheading') {
                  return (
                    <h3
                      key={`h3-${index}`}
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
