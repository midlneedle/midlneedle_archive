# 🚀 Деплой на Vercel

Пошаговая инструкция по деплою проекта на Vercel.

---

## ⚡️ Быстрый старт

### 1. Подготовка проекта ✅

Проект **уже готов** к деплою на Vercel! Все необходимые изменения внесены:

- ✅ Убран `output: 'export'` — теперь используются все возможности Next.js
- ✅ Убран `basePath` для GitHub Pages — Vercel работает на root path
- ✅ Убран `assetPrefix` — не нужен для Vercel
- ✅ Оптимизация изображений включена автоматически
- ✅ Создан `vercel.json` с настройками деплоя
- ✅ Создан `.vercelignore` для исключения лишних файлов

---

## 📦 Деплой через Vercel Dashboard (рекомендуется)

### Шаг 1: Подключите GitHub репозиторий

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Выберите **"Import Git Repository"**
4. Найдите и выберите ваш репозиторий `midlneedle_archive`

### Шаг 2: Настройте проект

Vercel **автоматически определит**:
- Framework: **Next.js**
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

**Ничего менять не нужно!** ✅

### Шаг 3: Deploy

1. Нажмите **"Deploy"**
2. Подождите 1-2 минуты
3. Готово! 🎉

---

## 🔧 Деплой через Vercel CLI (альтернатива)

### Установка CLI

```bash
npm install -g vercel
```

### Первый деплой

```bash
# В корне проекта
vercel

# Следуйте инструкциям:
# - Set up and deploy? → Yes
# - Which scope? → Ваш аккаунт
# - Link to existing project? → No
# - Project name? → midlneedle-archive (или любое другое)
# - Directory? → ./
# - Override settings? → No
```

### Последующие деплои

```bash
# Preview deployment (для тестирования)
vercel

# Production deployment
vercel --prod
```

---

## 🌐 Автоматические деплои (Git Integration)

После первого деплоя Vercel автоматически:

### Production (main branch):
- ✅ Push в `main` → **автоматический production deploy**
- 🔗 URL: `https://your-project.vercel.app`

### Preview (feature branches):
- ✅ Push в любую другую ветку → **preview deploy**
- ✅ Каждый Pull Request → **уникальный preview URL**
- 🔗 URL: `https://your-project-{hash}.vercel.app`

---

## ⚙️ Что изменилось в проекте

### `next.config.ts`

**Было (для GitHub Pages):**
```typescript
const config: NextConfig = {
  output: 'export',           // Только статика
  basePath: '/midlneedle_archive', // Для GitHub Pages
  assetPrefix: '/midlneedle_archive/',
  images: {
    unoptimized: true,       // Без оптимизации
  },
}
```

**Стало (для Vercel):**
```typescript
const config: NextConfig = {
  trailingSlash: true,       // Единственная настройка
}
```

**Результат:**
- ✅ Используются все фичи Next.js (SSR, ISR, API routes)
- ✅ Автоматическая оптимизация изображений
- ✅ Edge Functions доступны
- ✅ Serverless Functions работают

---

## 🎯 Что работает на Vercel

### 1. Server Components
```tsx
// Выполняется на сервере при каждом запросе!
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}
```

### 2. API Routes
```tsx
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello from Vercel!' })
}
```

### 3. Automatic Image Optimization
```tsx
import Image from 'next/image'

// Vercel автоматически оптимизирует!
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Optimized"
/>
```

### 4. Incremental Static Regeneration (ISR)
```tsx
export const revalidate = 60 // Обновлять каждые 60 секунд

export default async function Page() {
  const data = await fetch('...')
  return <div>{data}</div>
}
```

---

## 🔒 Environment Variables

Если нужны секреты (API ключи, токены):

### Через Dashboard:
1. Project Settings → Environment Variables
2. Добавьте переменные для `Production`, `Preview`, `Development`

### Через CLI:
```bash
vercel env add
```

### В коде:
```typescript
// Доступно только на сервере
const API_KEY = process.env.API_KEY

// Доступно на клиенте
const PUBLIC_KEY = process.env.NEXT_PUBLIC_KEY
```

---

## 📊 Performance на Vercel

После деплоя вы получите:

### ⚡️ Мгновенные переходы
- Prefetch работает в production
- View Transitions плавные (0.4s fade-in)
- CDN кеширование статических файлов

### 🚀 Быстрая загрузка
- Edge Network (270+ городов)
- Автоматический Brotli/Gzip
- HTTP/3 поддержка

### 📈 Analytics
- Vercel Analytics (можно включить в настройках)
- Web Vitals мониторинг
- Real User Monitoring

---

## 🔍 Проверка перед деплоем

Убедитесь, что всё работает локально:

```bash
# Development
npm run dev

# Production build (локально)
npm run build
npm start
```

Если всё работает → можно деплоить!

---

## 📌 Важные файлы для Vercel

### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": {
      "main": true  // Автодеплой только с main
    }
  }
}
```

### `.vercelignore`
```
node_modules
.next
out
.DS_Store
*.log
.env*.local
```

---

## 🐛 Troubleshooting

### Деплой не работает?

1. **Проверьте логи** в Vercel Dashboard
2. **Build logs** покажут ошибки сборки
3. **Runtime logs** покажут ошибки выполнения

### Изображения не загружаются?

- Убедитесь, что файлы в папке `public/`
- Пути должны начинаться с `/` (например, `/icon.png`)

### Environment variables не работают?

- Переменные для клиента должны начинаться с `NEXT_PUBLIC_`
- После добавления переменных нужен **новый деплой**

---

## 🔗 Полезные ссылки

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Deployment Documentation](https://vercel.com/docs/deployments/overview)

---

**Дата:** 2026-02-06
**Framework:** Next.js 16.1.6
**Platform:** Vercel
