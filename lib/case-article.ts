export type CaseArticleBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "media"; label: string; aspect: string }

export interface CaseArticleMediaInsertion {
  match: string
  label: string
  aspect: string
  position?: "before" | "after"
}

interface ParseCaseArticleOptions {
  mediaInsertions?: CaseArticleMediaInsertion[]
}

export function parseCaseArticle(
  raw: string,
  options: ParseCaseArticleOptions = {}
) {
  const blocks: CaseArticleBlock[] = []
  const footnotes: string[] = []
  let title = ""

  const chunks = raw
    .trim()
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  for (const chunk of chunks) {
    const headingMatch = chunk.match(/^\*\*([\s\S]+)\*\*$/)
    if (headingMatch) {
      const text = headingMatch[1].trim()
      if (!title) {
        title = text
      } else {
        blocks.push({ type: "heading", text })
      }
      continue
    }

    const normalized = chunk.replace(/\n+/g, " ").trim()
    const subheadingMatch = normalized.match(/^\*\*(.+?)\*\*\s*(.+)$/)
    if (subheadingMatch) {
      blocks.push({ type: "subheading", text: subheadingMatch[1].trim() })
      blocks.push({ type: "paragraph", text: subheadingMatch[2].trim() })
      continue
    }

    const footnoteMatch = normalized.match(/^\\?\*(?!\*)\s*(.+)$/)
    if (footnoteMatch) {
      footnotes.push(footnoteMatch[1].trim())
      continue
    }

    blocks.push({ type: "paragraph", text: normalized })
  }

  const insertions = options.mediaInsertions ?? []
  if (insertions.length === 0) {
    return { title, blocks, footnotes }
  }

  const withMedia: CaseArticleBlock[] = []
  for (const block of blocks) {
    if (block.type === "paragraph") {
      for (const insertion of insertions) {
        if (insertion.position !== "before") {
          continue
        }
        if (!block.text.includes(insertion.match)) {
          continue
        }

        withMedia.push({
          type: "media",
          label: insertion.label,
          aspect: insertion.aspect,
        })
      }
    }

    withMedia.push(block)

    if (block.type !== "paragraph") {
      continue
    }

    for (const insertion of insertions) {
      if (insertion.position === "before") {
        continue
      }
      if (!block.text.includes(insertion.match)) {
        continue
      }

      withMedia.push({
        type: "media",
        label: insertion.label,
        aspect: insertion.aspect,
      })
    }
  }

  return {
    title,
    blocks: withMedia,
    footnotes,
  }
}
