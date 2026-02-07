"use client"

import { useRef, useEffect, useState } from "react"

interface OptimizedVideoPlayerProps {
  src: string
  shouldAutoplay?: boolean
  className?: string
}

export function OptimizedVideoPlayer({
  src,
  shouldAutoplay = false,
  className,
}: OptimizedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  // Intersection Observer — lazy loading за 200px до viewport
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
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <video
          src={src}
          autoPlay={shouldAutoplay}
          loop={shouldAutoplay}
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  )
}
