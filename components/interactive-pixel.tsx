"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  PIXEL_CORNERS,
  TITLE_FRAME_DURATION_MS,
  TITLE_PIXEL_FRAMES,
  TITLE_PIXEL_TONES,
  type PixelPoint,
  type PixelTone,
  type PixelVariant,
} from "@/lib/pixel-sprite-data"
import { PixelSprite } from "./pixel-sprite"

const EMPTY_FRAME_SET: PixelPoint[][] = [[]]
const HOVER_FADE_OUT_MS = 350
const HOVER_FADE_IN_MS = 400
const TITLE_PIXEL_OFFSET_X_EM = 0.32
const TITLE_PIXEL_OFFSET_Y_EM = 0.02
const HOVER_FADE_KEEP_RATIOS = [1, 0.82, 0.66, 0.5, 0.36, 0.24, 0.12, 0.06, 0] as const
const HOVER_FADE_TONE_SHIFT = [0, 0, 1, 1, 2, 2, 3, 3, 3] as const

type HoverFadeState = "idle" | "fadingOut" | "hidden" | "fadingIn"

interface PixelTrail {
  gridX: number
  gridY: number
  id: number
  fadeStep: number
}

interface WavePixel {
  gridX: number
  gridY: number
  fadeStep: number
}

interface InteractivePixelProps {
  variant: PixelVariant
}

const fadeTones: PixelTone[] = ["dark", "mid", "light", "faint"]
const toneRank: Record<PixelTone, number> = {
  dark: 0,
  mid: 1,
  light: 2,
  faint: 3,
}

function shiftTone(tone: PixelTone, shift: number): PixelTone {
  const index = toneRank[tone]
  return fadeTones[Math.min(fadeTones.length - 1, index + shift)] ?? "faint"
}

function buildHoverFadeFrames(frame: PixelPoint[]) {
  const cx = 5.5
  const cy = 5.5
  const sorted = [...frame].sort((a, b) => {
    const da = Math.abs(a.x - cx) + Math.abs(a.y - cy)
    const db = Math.abs(b.x - cx) + Math.abs(b.y - cy)
    if (da !== db) return da - db
    if (toneRank[a.tone] !== toneRank[b.tone]) return toneRank[a.tone] - toneRank[b.tone]
    if (a.y !== b.y) return a.y - b.y
    return a.x - b.x
  })

  const out = HOVER_FADE_KEEP_RATIOS.map((ratio, step) => {
    if (ratio <= 0) return []
    const keepCount = Math.max(1, Math.round(sorted.length * ratio))
    const toneShift = HOVER_FADE_TONE_SHIFT[step] ?? 0
    return sorted.slice(0, keepCount).map((point) => ({
      x: point.x,
      y: point.y,
      tone: shiftTone(point.tone, toneShift),
    }))
  })

  return {
    out,
    in: [...out].reverse(),
  }
}

function getRingPixels(cx: number, cy: number, ring: number): Array<{ gridX: number; gridY: number }> {
  const pixels: Array<{ gridX: number; gridY: number }> = []
  for (let dx = -ring; dx <= ring; dx++) {
    for (let dy = -ring; dy <= ring; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue
      const x = cx + dx
      const y = cy + dy
      if (x >= 2 && x <= 9 && y >= 2 && y <= 9) {
        pixels.push({ gridX: x, gridY: y })
      }
    }
  }
  return pixels
}

export function InteractivePixel({ variant }: InteractivePixelProps) {
  const pixelRef = useRef<HTMLSpanElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isHoverCapable, setIsHoverCapable] = useState(false)
  const [hoverFadeState, setHoverFadeState] = useState<HoverFadeState>("idle")
  const [hoverFadeStep, setHoverFadeStep] = useState(0)
  const [trails, setTrails] = useState<PixelTrail[]>([])
  const [wavePixels, setWavePixels] = useState<WavePixel[]>([])
  const trailIdRef = useRef(0)
  const lastGridPosRef = useRef("")
  const waveAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setIsHoverCapable(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!isHoverCapable) {
      setHoverFadeState("idle")
      setHoverFadeStep(0)
    }
  }, [isHoverCapable])

  useEffect(() => {
    setHoverFadeState("idle")
    setHoverFadeStep(0)
  }, [variant])

  useEffect(() => {
    const pixelElement = pixelRef.current
    if (!pixelElement) return

    const isMobile = window.matchMedia("(hover: none) or (pointer: coarse)").matches

    const startWave = (cx: number, cy: number) => {
      if (waveAnimRef.current) {
        clearInterval(waveAnimRef.current)
        waveAnimRef.current = null
      }

      let ring = 0
      setWavePixels(getRingPixels(cx, cy, 0).map((p) => ({ ...p, fadeStep: 0 })))

      waveAnimRef.current = setInterval(() => {
        ring++
        const newRing = getRingPixels(cx, cy, ring)

        setWavePixels((prev) => {
          const faded = prev
            .map((p) => ({ ...p, fadeStep: p.fadeStep + 1 }))
            .filter((p) => p.fadeStep < 4)

          const combined = [...faded, ...newRing.map((p) => ({ ...p, fadeStep: 0 }))]

          if (combined.length === 0 && waveAnimRef.current) {
            clearInterval(waveAnimRef.current)
            waveAnimRef.current = null
          }

          return combined
        })
      }, 150)
    }

    const handleClick = (e: MouseEvent) => {
      const rect = pixelElement.getBoundingClientRect()
      const relativeX = (e.clientX - rect.left) / rect.width
      const relativeY = (e.clientY - rect.top) / rect.height
      const gridX = Math.max(2, Math.min(9, Math.floor(relativeX * 10) + 1))
      const gridY = Math.max(2, Math.min(9, Math.floor(relativeY * 10) + 1))
      startWave(gridX, gridY)
    }

    pixelElement.addEventListener("click", handleClick)

    if (isMobile) {
      return () => {
        pixelElement.removeEventListener("click", handleClick)
        if (waveAnimRef.current) clearInterval(waveAnimRef.current)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = pixelElement.getBoundingClientRect()
      const relativeX = (e.clientX - rect.left) / rect.width
      const relativeY = (e.clientY - rect.top) / rect.height
      const gridX = Math.floor(relativeX * 10) + 1
      const gridY = Math.floor(relativeY * 10) + 1

      if (gridX < 2 || gridX > 8 || gridY < 2 || gridY > 9) return

      const gridPos = `${gridX},${gridY}`
      if (gridPos === lastGridPosRef.current) return
      lastGridPosRef.current = gridPos

      setTrails((prev) => {
        const filtered = prev.filter(
          (t) =>
            !(t.gridX === gridX && t.gridY === gridY) &&
            !(t.gridX === gridX + 1 && t.gridY === gridY)
        )
        return [
          ...filtered,
          { gridX, gridY, id: trailIdRef.current++, fadeStep: 0 },
          { gridX: gridX + 1, gridY, id: trailIdRef.current++, fadeStep: 0 },
        ].slice(-8)
      })
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
      if (isHoverCapable) {
        setHoverFadeState("fadingOut")
        setHoverFadeStep(0)
      }
    }
    const handleMouseLeave = () => {
      setIsHovered(false)
      if (isHoverCapable) {
        setHoverFadeState("fadingIn")
        setHoverFadeStep(0)
      }
      setTrails([])
      lastGridPosRef.current = ""
    }

    pixelElement.addEventListener("mousemove", handleMouseMove)
    pixelElement.addEventListener("mouseenter", handleMouseEnter)
    pixelElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      pixelElement.removeEventListener("click", handleClick)
      pixelElement.removeEventListener("mousemove", handleMouseMove)
      pixelElement.removeEventListener("mouseenter", handleMouseEnter)
      pixelElement.removeEventListener("mouseleave", handleMouseLeave)
      if (waveAnimRef.current) clearInterval(waveAnimRef.current)
    }
  }, [isHoverCapable])

  useEffect(() => {
    if (trails.length === 0) return
    const interval = setInterval(() => {
      setTrails((prev) =>
        prev
          .map((trail) => ({ ...trail, fadeStep: trail.fadeStep + 1 }))
          .filter((trail) => trail.fadeStep < 4)
      )
    }, 200)
    return () => clearInterval(interval)
  }, [trails.length])

  const overlayPoints = useMemo<PixelPoint[]>(() => {
    const trailPoints = trails.map((trail) => ({
      x: trail.gridX,
      y: trail.gridY,
      tone: fadeTones[trail.fadeStep] ?? "faint",
    }))
    const wavePoints = wavePixels.map((pixel) => ({
      x: pixel.gridX,
      y: pixel.gridY,
      tone: fadeTones[pixel.fadeStep] ?? "faint",
    }))
    return [...trailPoints, ...wavePoints]
  }, [trails, wavePixels])

  const frameDurationMs = isHovered
    ? TITLE_FRAME_DURATION_MS[variant].hover
    : TITLE_FRAME_DURATION_MS[variant].idle

  const hoverFadeFrames = useMemo(
    () => buildHoverFadeFrames(TITLE_PIXEL_FRAMES[variant][0] ?? []),
    [variant]
  )

  useEffect(() => {
    if (!isHoverCapable) return
    if (hoverFadeState !== "fadingOut" && hoverFadeState !== "fadingIn") return

    const frames = hoverFadeState === "fadingOut" ? hoverFadeFrames.out : hoverFadeFrames.in
    const maxStep = Math.max(0, frames.length - 1)

    if (hoverFadeStep >= maxStep) {
      if (hoverFadeState === "fadingOut") {
        if (isHovered) {
          setHoverFadeState("hidden")
          setHoverFadeStep(0)
        } else {
          setHoverFadeState("fadingIn")
          setHoverFadeStep(0)
        }
      } else if (isHovered) {
        setHoverFadeState("fadingOut")
        setHoverFadeStep(0)
      } else {
        setHoverFadeState("idle")
        setHoverFadeStep(0)
      }
      return
    }

    const totalMs = hoverFadeState === "fadingOut" ? HOVER_FADE_OUT_MS : HOVER_FADE_IN_MS
    const stepMs = Math.max(16, Math.round(totalMs / maxStep))
    const timeout = window.setTimeout(() => {
      setHoverFadeStep((prev) => prev + 1)
    }, stepMs)

    return () => window.clearTimeout(timeout)
  }, [hoverFadeFrames.in, hoverFadeFrames.out, hoverFadeState, hoverFadeStep, isHoverCapable, isHovered])

  const baseFramePoints = useMemo(() => {
    if (!isHoverCapable || hoverFadeState === "idle") return null
    if (hoverFadeState === "hidden") return []
    if (hoverFadeState === "fadingOut") {
      return hoverFadeFrames.out[hoverFadeStep] ?? []
    }
    return hoverFadeFrames.in[hoverFadeStep] ?? []
  }, [hoverFadeFrames.in, hoverFadeFrames.out, hoverFadeState, hoverFadeStep, isHoverCapable])

  const baseFrames = baseFramePoints ? [baseFramePoints] : TITLE_PIXEL_FRAMES[variant]
  const basePaused = baseFramePoints !== null

  return (
    <span
      ref={pixelRef}
      aria-hidden="true"
      className="relative inline-flex shrink-0"
      style={{
        width: "calc(var(--pixel-unit) * 10)",
        height: "calc(var(--pixel-unit) * 10)",
        marginLeft: `${TITLE_PIXEL_OFFSET_X_EM}em`,
        transform: `translateY(${TITLE_PIXEL_OFFSET_Y_EM}em)`,
        lineHeight: 0,
        pointerEvents: "auto",
        cursor: "pointer",
      }}
    >
      <PixelSprite
        frames={baseFrames}
        frameDurationMs={frameDurationMs}
        tones={TITLE_PIXEL_TONES}
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        paused={basePaused}
      />
      <PixelSprite
        frames={EMPTY_FRAME_SET}
        frameDurationMs={1_000}
        tones={TITLE_PIXEL_TONES}
        overlayPoints={overlayPoints}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
        paused
      />
      <PixelSprite
        frames={EMPTY_FRAME_SET}
        frameDurationMs={1_000}
        tones={TITLE_PIXEL_TONES}
        framePoints={PIXEL_CORNERS}
        className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
        paused
      />
    </span>
  )
}
