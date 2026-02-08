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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [hasPlaybackIssue, setHasPlaybackIssue] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    setIsSafari(
      /Safari/i.test(ua) && !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS)/i.test(ua)
    )
  }, [])

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
    setHasPlaybackIssue(false)
  }, [shouldLoad, src])

  useEffect(() => {
    if (!shouldLoad) return

    const video = videoRef.current
    if (!video) return

    if (!shouldAutoplay) {
      try {
        video.pause()
      } catch {
        // Ignore pause errors for unsupported media states.
      }
      return
    }

    const maybePromise = video.play()
    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => {
        // Safari may block immediate playback while media state is transitioning.
      })
    }
  }, [shouldAutoplay, shouldLoad, src])

  useEffect(() => {
    if (!isSafari || !shouldLoad || isVideoLoaded || hasPlaybackIssue) return

    const timeoutId = window.setTimeout(() => {
      const video = videoRef.current
      if (!video) return

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setIsVideoLoaded(true)
        return
      }

      try {
        video.load()
        if (shouldAutoplay) {
          const maybePromise = video.play()
          if (maybePromise && typeof maybePromise.catch === "function") {
            maybePromise.catch(() => {})
          }
        }
      } catch {
        setHasPlaybackIssue(true)
        setIsVideoLoaded(true)
      }
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [hasPlaybackIssue, isSafari, isVideoLoaded, shouldAutoplay, shouldLoad, src])

  const markLoaded = () => {
    setIsVideoLoaded(true)
    setHasPlaybackIssue(false)
  }

  const handleStall = () => {
    const video = videoRef.current
    if (!video) return
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markLoaded()
    }
  }

  const handleError = () => {
    setHasPlaybackIssue(true)
    setIsVideoLoaded(true)
  }

  return (
    <div ref={containerRef} className={className}>
      {!isVideoLoaded && shouldLoad && !hasPlaybackIssue && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <PixelLoadingSpinner />
        </div>
      )}

      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          preload={shouldAutoplay && !isSafari ? "auto" : "metadata"}
          autoPlay={shouldAutoplay}
          loop={shouldAutoplay}
          muted
          playsInline
          data-autoplay={shouldAutoplay ? "true" : "false"}
          onLoadedData={markLoaded}
          onCanPlay={markLoaded}
          onLoadedMetadata={isSafari ? markLoaded : undefined}
          onStalled={handleStall}
          onSuspend={handleStall}
          onError={handleError}
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
