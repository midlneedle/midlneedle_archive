"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PixelLoadingSpinner } from "./pixel-loading-spinner"

const playbackPositionStore = new Map<string, number>()

interface OptimizedVideoPlayerProps {
  src: string
  shouldAutoplay?: boolean
  className?: string
  playbackSyncKey?: string
}

export function OptimizedVideoPlayer({
  src,
  shouldAutoplay = false,
  className,
  playbackSyncKey,
}: OptimizedVideoPlayerProps) {
  const syncKey = playbackSyncKey ?? src
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [playbackIssueSrc, setPlaybackIssueSrc] = useState<string | null>(null)
  const shouldLoad = shouldAutoplay || hasIntersected
  const isVideoLoaded = loadedSrc === src
  const hasPlaybackIssue = playbackIssueSrc === src
  const shouldRenderVideo = shouldLoad || isVideoLoaded || hasPlaybackIssue
  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/i.test(navigator.userAgent) &&
    !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS)/i.test(navigator.userAgent)

  useEffect(() => {
    if (shouldLoad || shouldRenderVideo) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasIntersected(true)
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
  }, [shouldLoad, shouldRenderVideo])

  const savePlaybackPosition = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const { currentTime } = video
    if (!Number.isFinite(currentTime)) return
    playbackPositionStore.set(syncKey, currentTime)
  }, [syncKey])

  const restorePlaybackPosition = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const savedPosition = playbackPositionStore.get(syncKey)
    if (savedPosition === undefined || !Number.isFinite(savedPosition)) return
    const duration = video.duration
    const maxTime =
      Number.isFinite(duration) && duration > 0
        ? Math.max(duration - 0.05, 0)
        : savedPosition
    const targetTime = Math.min(savedPosition, maxTime)
    if (Math.abs(video.currentTime - targetTime) < 0.05) return
    try {
      video.currentTime = targetTime
    } catch {
      // Ignore seek errors before metadata is ready.
    }
  }, [syncKey])

  useEffect(() => {
    if (!shouldRenderVideo) return

    const video = videoRef.current
    if (!video) return

    restorePlaybackPosition()

    if (!shouldAutoplay) {
      try {
        video.pause()
      } catch {
        // Ignore pause errors for unsupported media states.
      }
      savePlaybackPosition()
      return
    }

    const maybePromise = video.play()
    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => {
        // Safari may block immediate playback while media state is transitioning.
      })
    }
  }, [restorePlaybackPosition, savePlaybackPosition, shouldAutoplay, shouldRenderVideo, src])

  useEffect(() => {
    return () => {
      savePlaybackPosition()
    }
  }, [savePlaybackPosition])

  useEffect(() => {
    if (!isSafari || !shouldRenderVideo || isVideoLoaded || hasPlaybackIssue) return

    const timeoutId = window.setTimeout(() => {
      const video = videoRef.current
      if (!video) return

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setLoadedSrc(src)
        setPlaybackIssueSrc(null)
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
        setPlaybackIssueSrc(src)
        setLoadedSrc(src)
      }
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [
    hasPlaybackIssue,
    isSafari,
    isVideoLoaded,
    restorePlaybackPosition,
    shouldAutoplay,
    shouldRenderVideo,
    src,
  ])

  const markLoaded = () => {
    restorePlaybackPosition()
    setLoadedSrc(src)
    setPlaybackIssueSrc(null)
  }

  const handleStall = () => {
    const video = videoRef.current
    if (!video) return
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markLoaded()
    }
  }

  const handleError = () => {
    setPlaybackIssueSrc(src)
    setLoadedSrc(src)
  }

  const handleTimeUpdate = () => {
    savePlaybackPosition()
  }

  return (
    <div ref={containerRef} className={className}>
      {!isVideoLoaded && shouldRenderVideo && !hasPlaybackIssue && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <PixelLoadingSpinner />
        </div>
      )}

      {shouldRenderVideo && (
        <video
          ref={videoRef}
          src={src}
          preload={shouldAutoplay && !isSafari ? "auto" : "metadata"}
          loop={shouldAutoplay}
          muted
          playsInline
          data-autoplay={shouldAutoplay ? "true" : "false"}
          onLoadedData={markLoaded}
          onCanPlay={markLoaded}
          onLoadedMetadata={markLoaded}
          onStalled={handleStall}
          onSuspend={handleStall}
          onError={handleError}
          onPause={handleTimeUpdate}
          onTimeUpdate={handleTimeUpdate}
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
