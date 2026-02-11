import { readFile } from "node:fs/promises"
import path from "node:path"
import { CaseArticle } from "@/components/case-article"
import {
  parseCaseArticle,
  type CaseArticleMediaInsertion,
} from "@/lib/case-article"

const ARTICLE_PATH_RU = path.join(
  process.cwd(),
  "resourses",
  "cases",
  "watchface",
  "watchface_case.md"
)

const ARTICLE_PATH_EN = path.join(
  process.cwd(),
  "resourses",
  "cases",
  "watchface",
  "watchface_case_en.md"
)

const WATCHFACE_MEDIA_INSERTIONS_RU: CaseArticleMediaInsertion[] = [
  {
    match:
      "Это история о том, как я выпустил в свет свой небольшой продукт на весьма нишевый девайс, но ведь все когда-то начинается с малого не так ли?",
    label: "Фото · Обложка кейса",
    aspect: "aspect-video",
    position: "after",
  },
  {
    match: "картинка, к которой я хотел прийти",
    label: "Фото · Первый вотчфейс",
    aspect: "aspect-video",
  },
  {
    match: "я постарался привести все к более привычному современному пользователю интерфейсу",
    label: "Фото · Экран настроек",
    aspect: "aspect-video",
  },
  {
    match: "как лучше пользоваться нейронкой, чтобы ускорить перенос визуала в код",
    label: "Фото · Общий вид вотчфейса",
    aspect: "aspect-video",
  },
  {
    match: "стоит сказать, что большая часть времени была потрачена именно в попытках оптимизировать и отполировать анимацию",
    label: "Видео · Анимация запуска",
    aspect: "aspect-video",
  },
]

const WATCHFACE_MEDIA_INSERTIONS_EN: CaseArticleMediaInsertion[] = [
  {
    match:
      "This is a story about how I shipped a small product for a pretty niche device – but hey, everyone's gotta start somewhere, right?",
    label: "Photo · Case cover",
    aspect: "aspect-video",
    position: "after",
  },
  {
    match:
      "From the start, I had a clear vision: a crisp grid of chunky pixels where the digits themselves would \"glow\" while the rest stayed dim.",
    label: "Photo · First watchface",
    aspect: "aspect-video",
  },
  {
    match:
      "I also spent time on the settings page UI. Instead of the bare HTML you usually see in watchface configs, I tried to make it feel more familiar to modern users.",
    label: "Photo · Settings screen",
    aspect: "aspect-video",
  },
  {
    match:
      "The visual design was the easy part: by this point I had a Figma mockup and knew how to use AI to speed up translating design to code.",
    label: "Photo · General watchface view",
    aspect: "aspect-video",
  },
  {
    match:
      "Most of the time was actually spent trying to optimize and polish the animation.",
    label: "Video · Launch animation",
    aspect: "aspect-video",
  },
]

export default async function WatchfaceCasePage() {
  const [rawRu, rawEn] = await Promise.all([
    readFile(ARTICLE_PATH_RU, "utf8"),
    readFile(ARTICLE_PATH_EN, "utf8"),
  ])

  const ru = parseCaseArticle(rawRu, {
    mediaInsertions: WATCHFACE_MEDIA_INSERTIONS_RU,
  })
  const eng = parseCaseArticle(rawEn, {
    mediaInsertions: WATCHFACE_MEDIA_INSERTIONS_EN,
  })

  return (
    <CaseArticle
      content={{
        eng: {
          title: eng.title,
          blocks: eng.blocks,
          footnotes: eng.footnotes,
          publishedAt: "December 18, 2025",
        },
        ru: {
          title: ru.title,
          blocks: ru.blocks,
          footnotes: ru.footnotes,
          publishedAt: "18 декабря 2025",
        },
      }}
    />
  )
}
