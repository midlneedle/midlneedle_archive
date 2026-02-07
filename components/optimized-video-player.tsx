"use client"

import { useRef, useEffect, useState } from "react"

interface OptimizedVideoPlayerProps {
  src: string
  shouldAutoplay?: boolean
  className?: string
  blurDataURL?: string
}

export function OptimizedVideoPlayer({
  src,
  shouldAutoplay = false,
  className,
  blurDataURL,
}: OptimizedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

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
      {/* Blur placeholder */}
      {blurDataURL && !isVideoLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Video */}
      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          autoPlay={shouldAutoplay}
          loop={shouldAutoplay}
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: isVideoLoaded ? 1 : 0,
            transition: "opacity 500ms ease-in-out",
          }}
        />
      )}
    </div>
  )
}
