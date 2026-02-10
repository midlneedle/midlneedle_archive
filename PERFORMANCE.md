# Performance Notes

Текущее состояние производительности и production-практик проекта.

## Runtime модель

- Framework: Next.js App Router (`next@16`)
- Rendering: статический prerender для текущих маршрутов (`/`, `/cases/watchface`)
- Build: `next build` (Turbopack)
- Deploy target: Vercel (server/runtime возможности Next.js доступны)

## Что уже оптимизировано

1. Локальные шрифты через `next/font/local` (`app/layout.tsx`).
2. Видео загружаются лениво через `IntersectionObserver` и включают fallback-обработку.
3. Автоплей учитывает `prefers-reduced-motion` и `saveData` (`hooks/use-video-autoplay.ts`).
4. Иконки/asset paths централизованы через `withBasePath` (`lib/base-path.ts`).
5. Страницы собраны как статический контент на текущем наборе маршрутов.

## Важные замечания

- `<Image />` из `next/image` используется в компонентах, где это влияет на LCP/оптимизацию.
- Кастомный scroll-restore в runtime не используется: полагаемся на стандартное поведение App Router.
- Dev-инструменты (включая Agentation) остаются только для development-окружения.

## Проверка перед продом

```bash
npm run lint
npm run build
```

Обе команды должны проходить без ошибок и предупреждений.

## CI

Workflow `.github/workflows/nextjs.yml` выполняет:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

Это основной gating перед деплоем.
