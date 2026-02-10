"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import type { PixelPoint, PixelTone } from "@/lib/pixel-sprite-data"

interface PixelSpriteProps {
  frames: PixelPoint[][]
  frameDurationMs: number
  tones: Record<PixelTone, string>
  overlayPoints?: PixelPoint[]
  framePoints?: PixelPoint[]
  className?: string
  paused?: boolean
  style?: CSSProperties
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  return reducedMotion
}

export function PixelSprite({
  frames,
  frameDurationMs,
  tones,
  overlayPoints = [],
  framePoints = [],
  className,
  paused = false,
  style,
}: PixelSpriteProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [frameTick, setFrameTick] = useState(0)
  const shouldAnimate = !paused && !prefersReducedMotion && frames.length > 1

  useEffect(() => {
    if (!shouldAnimate) return
    const interval = window.setInterval(() => {
      setFrameTick((prev) => prev + 1)
    }, frameDurationMs)
    return () => window.clearInterval(interval)
  }, [shouldAnimate, frameDurationMs])

  const frameIndex = shouldAnimate ? frameTick % frames.length : 0
  const points = useMemo(() => {
    const currentFrame = frames[frameIndex] ?? []
    return [...currentFrame, ...overlayPoints, ...framePoints]
  }, [frameIndex, framePoints, frames, overlayPoints])

  const spriteStyle = {
    "--pixel-dark": tones.dark,
    "--pixel-mid": tones.mid,
    "--pixel-light": tones.light,
    "--pixel-faint": tones.faint,
    ...style,
  } as CSSProperties

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      className={className}
      style={spriteStyle}
      shapeRendering="crispEdges"
    >
      {points.map((point, index) => (
        <rect
          key={`${point.x}-${point.y}-${point.tone}-${index}`}
          x={point.x - 1}
          y={point.y - 1}
          width={1}
          height={1}
          rx={0.35}
          ry={0.35}
          fill={`var(--pixel-${point.tone})`}
        />
      ))}
    </svg>
  )
}
