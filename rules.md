# Next.js Project Rules & Best Practices

Руководство по разработке на основе образцового проекта shud.in

---

## 1. Структура проекта

```
project/
├── app/                          # App Router (Next.js 13+)
│   ├── _fonts/                   # Локальные шрифты (приватная папка)
│   ├── _contents/                # Приватный контент (MDX файлы)
│   ├── [section]/                # Разделы сайта
│   │   ├── page.tsx              # или page.mdx
│   │   └── [slug]/
│   │       └── page.tsx          # Динамические страницы
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Главная страница
│   ├── not-found.tsx             # 404
│   └── globals.css               # Глобальные стили
├── components/                   # Переиспользуемые компоненты
│   ├── ui/                       # Примитивы (shadcn/ui)
│   └── [feature].tsx             # Компоненты по фичам
├── lib/                          # Утилиты
│   └── utils.ts
├── assets/
│   └── images/                   # Локальные изображения
├── mdx-components.tsx            # MDX переопределения (если используется MDX)
├── next.config.ts                # Конфиг Next.js
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

**Правило:** Папки с `_` приватные и не создают роуты.

---

## 2. Компоненты

### Server vs Client Components

```tsx
// Server Component (по умолчанию) - для статического контента
export function StaticCard({ title }: { title: string }) {
  return <div>{title}</div>
}

// Client Component - ТОЛЬКО когда нужна интерактивность
'use client'

import { useState } from 'react'

export function InteractiveCard() {
  const [isOpen, setIsOpen] = useState(false)
  // ...
}
```

**Правила:**
- Используй `'use client'` ТОЛЬКО когда нужно: useState, useEffect, event handlers, browser APIs
- Server Components по умолчанию - они быстрее и не добавляют JS на клиент
- Разделяй большие Client Components на мелкие, чтобы минимизировать JS bundle

### Типизация компонентов

```tsx
// Используй React.ComponentProps для наследования
function Button(props: React.ComponentProps<'button'>) {
  return <button {...props} />
}

// Или с кастомными пропсами
interface CardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function Card({ title, description, children }: CardProps) {
  // ...
}

// Readonly для layout props
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // ...
}
```

### Условные классы с clsx

```tsx
import cn from 'clsx'

// Вместо строковой конкатенации
className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled ? 'disabled' : 'enabled',
  className // пропс для кастомизации
)}
```

---

## 3. Стили и типографика

### Tailwind CSS v4 с @theme

```css
@import 'tailwindcss';

@theme {
  /* Кастомная цветовая палитра */
  --color-brand-50: #ebedef;
  --color-brand-100: #d8dbdf;
  --color-brand-500: #353B42;
  --color-brand-900: #07080a;

  /* Шрифты */
  --font-sans: var(--sans), -apple-system, system-ui, sans-serif;
  --font-serif: var(--serif), Georgia, serif;
  --font-mono: var(--mono), SFMono-Regular, monospace;

  /* Кастомные брейкпоинты */
  --breakpoint-text: 1220px;
  --breakpoint-mobile: 420px;
}
```

### Font Features для микротипографики

```css
body {
  font-synthesis: none;
  font-feature-settings: 'cpsp' 1, 'cv01', 'cv03', 'calt', 'liga';
  text-decoration-skip-ink: auto;
  letter-spacing: 0.0085em;
  word-spacing: -0.04em;
}

/* Serif для акцентных элементов */
i, em, blockquote {
  font-family: var(--font-serif);
  letter-spacing: -0.006em;
}
```

### Вариативные шрифты

```css
@layer utilities {
  .font-thin { font-variation-settings: 'wght' 100; }
  .font-normal { font-variation-settings: 'wght' 440; }
  .font-semibold { font-variation-settings: 'wght' 540; }
  .font-bold { font-variation-settings: 'wght' 640; }
}
```

---

## 4. Шрифты

### Локальные шрифты (рекомендуется)

```tsx
// app/layout.tsx
import localFont from 'next/font/local'

const sans = localFont({
  src: './_fonts/InterVariable.woff2',
  preload: true,
  variable: '--sans',
})

const serif = localFont({
  src: './_fonts/LoraItalicVariable.woff2',
  preload: true,
  variable: '--serif',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**Преимущества:**
- Нет внешних запросов к Google Fonts
- Полный контроль над загрузкой
- Лучше для приватности

---

## 5. Метаданные и SEO

### Root Layout metadata

```tsx
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - Site Name',
    default: 'Site Name',
  },
  description: 'Site description',
}

export const viewport: Viewport = {
  maximumScale: 1,  // Отключить зум на мобильных
  colorScheme: 'only light',
  themeColor: '#ffffff',
}
```

### Страничные metadata

```tsx
// app/about/page.tsx
export const metadata = {
  title: 'About',
  description: 'About page description',
}

// Или динамически
export async function generateMetadata({ params }) {
  const data = await fetchData(params.slug)
  return {
    title: data.title,
    description: data.description,
  }
}
```

---

## 6. next.config.ts

```typescript
import { NextConfig } from 'next'

export default {
  // Поддержка MDX (если используется)
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  // Редиректы для совместимости старых URL
  redirects: async () => [
    {
      source: '/old-path/:slug',
      destination: '/new-path/:slug',
      permanent: false,
    },
  ],

  // Оптимизация изображений
  images: {
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
} satisfies NextConfig  // satisfies вместо : NextConfig
```

---

## 7. Паттерны

### Динамический контент из файлов

```tsx
// app/articles/page.tsx
import fs from 'fs/promises'
import path from 'path'

export default async function ArticlesPage() {
  const dir = path.join(process.cwd(), 'app', 'articles', '_content')
  const files = await fs.readdir(dir)

  const articles = []
  for (const file of files) {
    if (!file.endsWith('.mdx')) continue
    const { metadata } = await import('./_content/' + file)
    if (metadata.draft) continue  // Скрыть черновики
    articles.push({ slug: file.replace('.mdx', ''), ...metadata })
  }

  return <ArticleList articles={articles} />
}
```

### generateStaticParams для SSG

```tsx
// app/articles/[slug]/page.tsx
export async function generateStaticParams() {
  const files = await fs.readdir(articlesDir)
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}
```

### View Transitions (современные переходы)

```tsx
// app/layout.tsx
import { ViewTransition } from 'react'

export default function Layout({ children }) {
  return (
    <ViewTransition name="crossfade">
      <main>{children}</main>
    </ViewTransition>
  )
}
```

```css
/* globals.css */
@supports (view-transition-name: none) {
  @media not (prefers-reduced-motion: reduce) {
    ::view-transition-old(crossfade) {
      animation: hide 0.4s ease forwards;
    }
    ::view-transition-new(crossfade) {
      opacity: 0;
      animation: appear 0.6s ease 0.2s forwards;
    }
  }
}
```

---

## 8. Accessibility

### Focus states

```tsx
className={cn(
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
  'focus:outline-none'  // Убрать дефолтный outline
)}
```

### Screen reader only

```tsx
<span className="sr-only">Описание для скринридеров</span>
```

### Семантический HTML

```tsx
// Используй правильные теги
<nav>...</nav>
<main>...</main>
<article>...</article>
<section>...</section>
<figure>
  <img alt="Описание" />
  <figcaption>Подпись</figcaption>
</figure>
```

---

## 9. Производительность

### Оптимизация изображений

```tsx
import Image from 'next/image'

// Всегда используй next/image
<Image
  src={imageSrc}
  alt="Описание"
  placeholder="blur"  // Blur placeholder
  priority  // Для above-the-fold изображений
/>
```

### Ленивая загрузка

```tsx
import dynamic from 'next/dynamic'

// Для тяжелых компонентов
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
```

### Минимизация Client Components

```tsx
// Плохо - весь компонент клиентский
'use client'
export function Page() {
  const [state, setState] = useState()
  return (
    <div>
      <StaticContent />  // Этот контент тоже станет клиентским!
      <InteractivePart state={state} />
    </div>
  )
}

// Хорошо - только интерактивная часть клиентская
export function Page() {
  return (
    <div>
      <StaticContent />  // Server Component
      <InteractivePart />  // Client Component (отдельный файл)
    </div>
  )
}
```

---

## 10. Скрипты package.json

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Примечание:** `--webpack` флаг нужен в Next.js 16 если Turbopack вызывает ошибки.

---

## 11. Чеклист перед деплоем

- [ ] Все изображения оптимизированы и используют next/image
- [ ] Metadata заполнены на всех страницах
- [ ] Favicon и apple-touch-icon добавлены
- [ ] Нет console.log в продакшен коде
- [ ] Все Client Components минимизированы
- [ ] Проверен Lighthouse score
- [ ] Проверена мобильная версия
- [ ] Добавлен robots.txt и sitemap.xml
- [ ] Настроен Analytics

---

## 12. Запуск dev-сервера

Используй скилл `/dev` для автоматического запуска:
1. Запускает dev-сервер в фоне
2. Открывает браузер на localhost:3000

Или вручную:
```bash
npm run dev
```
