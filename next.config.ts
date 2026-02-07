import type { NextConfig } from 'next'
import { withNextVideo } from 'next-video/process'

const config: NextConfig = {
  // Оптимизация для Vercel - используем все возможности Next.js
  trailingSlash: true,

  // Официальная интеграция React ViewTransition
  experimental: {
    viewTransition: true,
  },
}

export default withNextVideo(config)
