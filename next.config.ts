import type { NextConfig } from 'next'

export default {
  // Оптимизация изображений
  images: {
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
} satisfies NextConfig
