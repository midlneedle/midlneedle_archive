"use client"

import { useRef, useEffect, useState } from "react"
import BackgroundPlayer from "next-video/background-player"
import type { PlayerProps } from "next-video"

interface OptimizedVideoPlayerProps extends Omit<PlayerProps, 'src'> {
  src: string
  shouldAutoplay?: boolean
  className?: string
}

/**
 * Оптимизированный видео плеер с lazy loading через Intersection Observer
 * Использует BackgroundPlayer из next-video для автоплей видео без UI контролов
 * - Автоматическая оптимизация видео
 * - Lazy loading (загрузка за 200px до viewport)
 * - Без кнопок управления (идеально для autoplay)
 */
export function OptimizedVideoPlayer({
  src,
  shouldAutoplay = false,
  className,
  ...props
}: OptimizedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "200px 0px", // Начать загрузку за 200px до viewport
        threshold: 0.1,
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <BackgroundPlayer
          src={src}
          autoPlay={shouldAutoplay}
          loop={shouldAutoplay}
          muted
          playsInline
          preload={shouldAutoplay ? "auto" : "metadata"}
          {...props}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.01)",
            ...props.style,
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
          <div className="text-sm text-muted-foreground/50">Загрузка...</div>
        </div>
      )}
    </div>
  )
}
