"use client"

import { useEffect, useRef, useState } from "react"
import { PixelLoadingSpinner } from "./pixel-loading-spinner"

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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    if (shouldLoad) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
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
  }, [shouldLoad])

  useEffect(() => {
    if (shouldAutoplay) {
      setShouldLoad(true)
    }
  }, [shouldAutoplay])

  useEffect(() => {
    if (!shouldLoad) return
    setIsVideoLoaded(false)
  }, [shouldLoad, src])

  return (
    <div ref={containerRef} className={className}>
      {!isVideoLoaded && shouldLoad && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <PixelLoadingSpinner />
        </div>
      )}

      {shouldLoad && (
        <video
          src={src}
          preload={shouldAutoplay ? "auto" : "metadata"}
          autoPlay={shouldAutoplay}
          loop={shouldAutoplay}
          muted
          playsInline
          data-autoplay={shouldAutoplay ? "true" : "false"}
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: isVideoLoaded ? 1 : 0,
            transition: "opacity 220ms ease-out",
          }}
        />
      )}
    </div>
  )
}
