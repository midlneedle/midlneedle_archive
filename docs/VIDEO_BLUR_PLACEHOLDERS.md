# 🎬 Video Loading Placeholders

## Как это работает

Вместо чёрных квадратов при загрузке видео показываются:
1. **Первый кадр видео** — без размытия, чёткое изображение
2. **Пиксельный loading спиннер** — анимированный в том же стиле что и интерактивные пиксели у заголовков
3. **Плавный fade-in** видео когда оно загрузится

- **Размер**: ~1KB на видео (base64 data URL)
- **Эффект**: Fade-in transition (300ms)
- **Технология**: Первый кадр видео → thumbnail (40px) → JPEG → base64

## Добавление нового видео

### 1. Положить видео в `public/videos/`

```bash
cp my-new-video.mp4 public/videos/
```

### 2. Сгенерировать blur placeholder

Создай временный скрипт:

```bash
cat > generate-placeholder.mjs << 'EOF'
import sharp from 'sharp'
import { execSync } from 'child_process'

const videoName = process.argv[2] // например "my-new-video"
const videoPath = `public/videos/${videoName}.mp4`

// Извлечь первый кадр
execSync(`ffmpeg -i "${videoPath}" -vframes 1 -vf "scale=20:-1" -f image2 "${videoName}_thumb.jpg" -y`)

// Создать blur placeholder
const buffer = await sharp(`${videoName}_thumb.jpg`)
  .resize(20, null)
  .blur(10)
  .jpeg({ quality: 30 })
  .toBuffer()

const base64 = buffer.toString('base64')
const dataUrl = `data:image/jpeg;base64,${base64}`

console.log(`\nДобавь в lib/video-placeholders.ts:\n`)
console.log(`  "${videoName}": "${dataUrl}",`)

// Удалить временный файл
execSync(`rm ${videoName}_thumb.jpg`)
EOF

node generate-placeholder.mjs my-new-video
```

### 3. Добавить placeholder в конфиг

Скопируй вывод скрипта в `lib/video-placeholders.ts`:

```typescript
export const videoPlaceholders: Record<string, string> = {
  // ... существующие
  "my-new-video": "data:image/jpeg;base64,/9j/2wBDA...",
}
```

### 4. Добавить видео в `app/page.tsx`

```tsx
// В константу videos
const videos = {
  // ... существующие
  my_new_video: withBasePath("/videos/my-new-video.mp4"),
}

// В JSX
<VideoCard
  src={videos.my_new_video}
  title="My New Video"
  description="Video description"
  orientation="vertical"
  showTitle={true}
  blurDataURL={videoPlaceholders.my_new_video}
/>
```

## Быстрый способ (батч)

Для генерации placeholder'ов для всех новых видео:

```bash
cat > generate-all-placeholders.mjs << 'EOF'
import sharp from 'sharp'
import { execSync } from 'child_process'
import { readdirSync } from 'fs'

const videos = readdirSync('public/videos')
  .filter(f => f.endsWith('.mp4'))
  .map(f => f.replace('.mp4', ''))

console.log('Генерация placeholders для:', videos.join(', '))

const placeholders = {}

for (const video of videos) {
  console.log(`\nОбработка ${video}...`)

  // Извлечь кадр
  execSync(`ffmpeg -i "public/videos/${video}.mp4" -vframes 1 -vf "scale=20:-1" -f image2 "${video}_thumb.jpg" -y 2>&1`,
    { stdio: 'ignore' })

  // Создать blur
  const buffer = await sharp(`${video}_thumb.jpg`)
    .resize(20, null)
    .blur(10)
    .jpeg({ quality: 30 })
    .toBuffer()

  const base64 = buffer.toString('base64')
  placeholders[video] = `data:image/jpeg;base64,${base64}`

  // Удалить временный файл
  execSync(`rm ${video}_thumb.jpg`)

  console.log(`✓ ${video}: ${(base64.length / 1024).toFixed(2)}KB`)
}

console.log('\n// Скопируй в lib/video-placeholders.ts:')
console.log('export const videoPlaceholders: Record<string, string> = ')
console.log(JSON.stringify(placeholders, null, 2))
EOF

node generate-all-placeholders.mjs
```

## Технические детали

### OptimizedVideoPlayer

Компонент автоматически:
1. Показывает blur placeholder до загрузки видео
2. Отслеживает событие `onLoadedData`
3. Плавно скрывает placeholder (opacity transition 500ms)
4. Показывает видео с fade-in эффектом

### CSS эффекты

```tsx
// Placeholder
<div style={{
  backgroundImage: `url(${blurDataURL})`,
  filter: "blur(20px)",      // Дополнительное размытие
  transform: "scale(1.1)",   // Скрыть края blur эффекта
}} />

// Video
<video style={{
  opacity: isVideoLoaded ? 1 : 0,
  transition: "opacity 500ms ease-in-out",
}} />
```

### Размеры

- **Исходный кадр**: 20px ширина (aspect ratio сохраняется)
- **Blur radius**: 10px (Sharp)
- **JPEG quality**: 30%
- **Итоговый размер**: ~0.4KB на видео

## Troubleshooting

**Placeholder не показывается:**
- Проверь что `blurDataURL` передан в `VideoCard`
- Проверь консоль браузера на ошибки base64

**Слишком большой размер placeholder:**
- Уменьши JPEG quality (сейчас 30, можно до 20)
- Уменьши исходный размер кадра (сейчас 20px, можно до 15px)

**Blur недостаточно сильный:**
- Увеличь blur radius в Sharp (сейчас 10)
- Увеличь CSS blur в OptimizedVideoPlayer (сейчас 20px)

**Видео долго грузится:**
- Это не связано с placeholder'ами
- Проверь размер видео (должны быть оптимизированы)
- Проверь Intersection Observer (lazy loading работает?)
