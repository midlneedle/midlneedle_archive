import { readFile } from "node:fs/promises"
import path from "node:path"
import { CaseArticle } from "@/components/case-article"
import {
  parseCaseArticle,
  type CaseArticleMediaInsertion,
} from "@/lib/case-article"

const ARTICLE_PATH = path.join(
  process.cwd(),
  "resourses",
  "cases",
  "watchface",
  "watchface_case.md"
)

const WATCHFACE_MEDIA_INSERTIONS: CaseArticleMediaInsertion[] = [
  {
    match: "картинка, к которой я хотел прийти",
    label: "Фото · Первый вотчфейс",
    aspect: "aspect-[4/3]",
  },
  {
    match: "я постарался привести все к более привычному современному пользователю интерфейсу",
    label: "Фото · Экран настроек",
    aspect: "aspect-[16/10]",
  },
  {
    match: "как лучше пользоваться нейронкой, чтобы ускорить перенос визуала в код",
    label: "Фото · Общий вид вотчфейса",
    aspect: "aspect-[3/2]",
  },
  {
    match: "стоит сказать, что большая часть времени была потрачена именно в попытках оптимизировать и отполировать анимацию",
    label: "Видео · Анимация запуска",
    aspect: "aspect-video",
  },
]

export default async function WatchfaceCasePage() {
  const raw = await readFile(ARTICLE_PATH, "utf8")
  const { title, blocks, footnotes } = parseCaseArticle(raw, {
    mediaInsertions: WATCHFACE_MEDIA_INSERTIONS,
  })

  return (
    <CaseArticle
      title={title}
      blocks={blocks}
      footnotes={footnotes}
      publishedAt="18 декабря 2025"
    />
  )
}
