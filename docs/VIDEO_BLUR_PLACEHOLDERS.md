# Video Loading Placeholders

## Как это работает

При загрузке видео показываются:
1. Единый цветовой фон `#353b42` с прозрачностью `5%` (`rgba(53, 59, 66, 0.05)`).
2. Пиксельный loading-спиннер.
3. Плавный `fade-in` видео после готовности (`opacity` transition 220ms).

Это единый упрощенный подход для всех видео, без расчета цвета из первого кадра.

## Где настраивается

Источник значений: `lib/video-placeholders.ts`.

```ts
const VIDEO_PLACEHOLDER_COLOR = "rgba(53, 59, 66, 0.05)"
```

Все ключи в `videoPlaceholders` ссылаются на этот один цвет.

## Добавление нового видео

1. Добавь новый ключ в `videoPlaceholders` в `lib/video-placeholders.ts`.
2. Передай его в `VideoCard` как `blurDataURL`.

```tsx
import { videoPlaceholders } from "@/lib/video-placeholders"

<VideoCard
  src="/videos/my-video.mp4"
  title="My Video"
  blurDataURL={videoPlaceholders.my_video}
/>
```

## Техническая схема

```text
VideoCard (backgroundColor из blurDataURL)
└── MorphingMedia
    └── OptimizedVideoPlayer
        ├── PixelLoadingSpinner (пока видео не готово)
        └── <video> (проявляется через opacity)
```

## Troubleshooting

- Placeholder не виден:
  - Проверь, что `blurDataURL` передан в `VideoCard`.
  - Проверь, что ключ существует в `videoPlaceholders`.
- Видео не проявляется:
  - Проверь события загрузки в `OptimizedVideoPlayer` (`onLoadedData`, `onCanPlay`, `onLoadedMetadata`).
