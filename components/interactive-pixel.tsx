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
const HOVER_FADE_LAST_STEP = HOVER_FADE_KEEP_RATIOS.length - 1
const HOVER_TRAIL_POINT_LIMIT = 8
const CLICK_SPARK_COUNT_MIN = 4
const CLICK_SPARK_COUNT_MAX = 8
const CLICK_SPARK_MAX_ACTIVE = 24
const CLICK_SPARK_LIFE_MIN_MS = 420
const CLICK_SPARK_LIFE_MAX_MS = 760
const CLICK_SPARK_SPEED_MIN = 30
const CLICK_SPARK_SPEED_MAX = 45
const CLICK_SPARK_BOUNCE = 0.72
const CLICK_SPARK_DRAG_PER_FRAME = 0.962
const CLICK_SPARK_FRAME_MS = 16.7

type HoverFadeState = "idle" | "fadingOut" | "hidden" | "fadingIn"

interface PixelTrail {
  gridX: number
  gridY: number
  id: number
  fadeStep: number
}

interface ClickSpark {
  x: number
  y: number
  vx: number
  vy: number
  ageMs: number
  lifeMs: number
  fadeOffset: number
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

function addDiagonalBridgePoints(frame: PixelPoint[]) {
  const pointKeys = new Set(frame.map((point) => `${point.x},${point.y}`))
  const bridges = new Map<string, PixelPoint>()

  const hasPoint = (x: number, y: number) => pointKeys.has(`${x},${y}`)

  const addBridge = (x: number, y: number) => {
    if (x < 1 || x > 10 || y < 1 || y > 10) return
    const key = `${x},${y}`
    if (pointKeys.has(key) || bridges.has(key)) return
    bridges.set(key, { x, y, tone: "faint" })
  }

  for (const point of frame) {
    const diagonalDownRight = hasPoint(point.x + 1, point.y + 1)
    if (diagonalDownRight) {
      const hasHorizontal = hasPoint(point.x + 1, point.y)
      const hasVertical = hasPoint(point.x, point.y + 1)
      const isLongDiagonalChain =
        hasPoint(point.x - 1, point.y - 1) || hasPoint(point.x + 2, point.y + 2)
      if (!hasHorizontal && !hasVertical) {
        // Avoid thickening long diagonal chains from the original art.
        if (!isLongDiagonalChain) {
          addBridge(point.x, point.y + 1)
        }
      }
    }

    const diagonalUpRight = hasPoint(point.x + 1, point.y - 1)
    if (diagonalUpRight) {
      const hasHorizontal = hasPoint(point.x + 1, point.y)
      const hasVertical = hasPoint(point.x, point.y - 1)
      const isLongDiagonalChain =
        hasPoint(point.x - 1, point.y + 1) || hasPoint(point.x + 2, point.y - 2)
      if (!hasHorizontal && !hasVertical) {
        if (!isLongDiagonalChain) {
          addBridge(point.x, point.y - 1)
        }
      }
    }
  }

  if (bridges.size === 0) return frame
  return [...frame, ...bridges.values()]
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

function getHoverTrailBrush(
  gridX: number,
  gridY: number,
  deltaX: number,
  deltaY: number
): Array<{ gridX: number; gridY: number }> {
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return [{ gridX, gridY }]
  }

  const clampedX = Math.min(gridX, 8)
  return [
    { gridX: clampedX, gridY },
    { gridX: clampedX + 1, gridY },
  ]
}

export function InteractivePixel({ variant }: InteractivePixelProps) {
  const pixelRef = useRef<HTMLSpanElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isHoverCapable, setIsHoverCapable] = useState(false)
  const [hoverFadeState, setHoverFadeState] = useState<HoverFadeState>("idle")
  const [hoverFadeStep, setHoverFadeStep] = useState(0)
  const [trails, setTrails] = useState<PixelTrail[]>([])
  const [sparks, setSparks] = useState<ClickSpark[]>([])
  const trailIdRef = useRef(0)
  const lastGridPointRef = useRef<{ x: number; y: number } | null>(null)

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

    const handleClick = (e: MouseEvent) => {
      const rect = pixelElement.getBoundingClientRect()
      const relativeX = (e.clientX - rect.left) / rect.width
      const relativeY = (e.clientY - rect.top) / rect.height
      const gridX = Math.max(2, Math.min(9, Math.floor(relativeX * 10) + 1))
      const gridY = Math.max(2, Math.min(9, Math.floor(relativeY * 10) + 1))
      const sparkCount =
        CLICK_SPARK_COUNT_MIN + Math.floor(Math.random() * (CLICK_SPARK_COUNT_MAX - CLICK_SPARK_COUNT_MIN + 1))

      const nextSparks = Array.from({ length: sparkCount }, (_, index) => {
        const angleBase = (Math.PI * 2 * index) / sparkCount
        const angle = angleBase + (Math.random() - 0.5) * 0.08
        const speed = CLICK_SPARK_SPEED_MIN + Math.random() * (CLICK_SPARK_SPEED_MAX - CLICK_SPARK_SPEED_MIN)
        const lifeMs = CLICK_SPARK_LIFE_MIN_MS + Math.random() * (CLICK_SPARK_LIFE_MAX_MS - CLICK_SPARK_LIFE_MIN_MS)

        return {
          x: gridX + Math.cos(angle) * 0.24,
          y: gridY + Math.sin(angle) * 0.24,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ageMs: 0,
          lifeMs,
          fadeOffset: Math.random() * 0.05,
        }
      })

      setSparks((prev) => [...prev, ...nextSparks].slice(-CLICK_SPARK_MAX_ACTIVE))
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = pixelElement.getBoundingClientRect()
      const relativeX = (e.clientX - rect.left) / rect.width
      const relativeY = (e.clientY - rect.top) / rect.height
      const gridX = Math.floor(relativeX * 10) + 1
      const gridY = Math.floor(relativeY * 10) + 1

      if (gridX < 2 || gridX > 9 || gridY < 2 || gridY > 9) return

      const previousPoint = lastGridPointRef.current
      if (previousPoint && previousPoint.x === gridX && previousPoint.y === gridY) return

      const deltaX = previousPoint ? gridX - previousPoint.x : 0
      const deltaY = previousPoint ? gridY - previousPoint.y : 0
      const brushPoints = getHoverTrailBrush(gridX, gridY, deltaX, deltaY)
      const brushKeys = new Set(brushPoints.map((point) => `${point.gridX},${point.gridY}`))

      lastGridPointRef.current = { x: gridX, y: gridY }

      setTrails((prev) => {
        const filtered = prev.filter((trail) => !brushKeys.has(`${trail.gridX},${trail.gridY}`))
        const nextBrush = brushPoints.map((point) => ({
          gridX: point.gridX,
          gridY: point.gridY,
          id: trailIdRef.current++,
          fadeStep: 0,
        }))

        return [
          ...filtered,
          ...nextBrush,
        ].slice(-HOVER_TRAIL_POINT_LIMIT)
      })
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      setTrails([])
      lastGridPointRef.current = null
    }

    pixelElement.addEventListener("click", handleClick)
    pixelElement.addEventListener("mousemove", handleMouseMove)
    pixelElement.addEventListener("mouseenter", handleMouseEnter)
    pixelElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      pixelElement.removeEventListener("click", handleClick)
      pixelElement.removeEventListener("mousemove", handleMouseMove)
      pixelElement.removeEventListener("mouseenter", handleMouseEnter)
      pixelElement.removeEventListener("mouseleave", handleMouseLeave)
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

  useEffect(() => {
    if (sparks.length === 0) return

    let frame = 0
    let lastTs = performance.now()

    const tick = () => {
      const now = performance.now()
      const dt = Math.max(0, Math.min(34, now - lastTs))
      lastTs = now

      setSparks((prev) =>
        prev
          .map((spark) => ({
            ...spark,
            ageMs: spark.ageMs + dt,
          }))
          .map((spark) => {
            let vx = spark.vx
            let vy = spark.vy
            let x = spark.x + vx * (dt / 1000)
            let y = spark.y + vy * (dt / 1000)

            if (x < 1) {
              x = 1 + (1 - x)
              vx = Math.abs(vx) * CLICK_SPARK_BOUNCE
            } else if (x > 10) {
              x = 10 - (x - 10)
              vx = -Math.abs(vx) * CLICK_SPARK_BOUNCE
            }

            if (y < 1) {
              y = 1 + (1 - y)
              vy = Math.abs(vy) * CLICK_SPARK_BOUNCE
            } else if (y > 10) {
              y = 10 - (y - 10)
              vy = -Math.abs(vy) * CLICK_SPARK_BOUNCE
            }

            const drag = Math.pow(CLICK_SPARK_DRAG_PER_FRAME, dt / CLICK_SPARK_FRAME_MS)
            vx *= drag
            vy *= drag

            return {
              ...spark,
              x,
              y,
              vx,
              vy,
            }
          })
          .filter((spark) => spark.ageMs < spark.lifeMs)
      )

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [sparks.length])

  const overlayPoints = useMemo<PixelPoint[]>(() => {
    const pointsByKey = new Map<string, PixelPoint>()

    const upsert = (point: PixelPoint) => {
      const key = `${point.x},${point.y}`
      const existing = pointsByKey.get(key)
      if (!existing || toneRank[point.tone] < toneRank[existing.tone]) {
        pointsByKey.set(key, point)
      }
    }

    for (const trail of trails) {
      upsert({
        x: trail.gridX,
        y: trail.gridY,
        tone: fadeTones[trail.fadeStep] ?? "faint",
      })
    }

    for (const spark of sparks) {
      const x = Math.round(spark.x)
      const y = Math.round(spark.y)
      if (x < 1 || x > 10 || y < 1 || y > 10) continue

      const progress = spark.ageMs / spark.lifeMs
      const normalizedFadeProgress = Math.max(0, (Math.min(1, Math.max(0, progress)) - 0.18) / 0.82)
      const easedProgress = normalizedFadeProgress ** 0.9
      const toneShift = Math.min(3, Math.floor((easedProgress + (spark.fadeOffset ?? 0)) * 3.2))

      upsert({
        x,
        y,
        tone: shiftTone("dark", toneShift),
      })
    }

    return [...pointsByKey.values()]
  }, [sparks, trails])

  const frameDurationMs = isHovered
    ? TITLE_FRAME_DURATION_MS[variant].hover
    : TITLE_FRAME_DURATION_MS[variant].idle

  const bridgedFrames = useMemo(
    () => TITLE_PIXEL_FRAMES[variant].map(addDiagonalBridgePoints),
    [variant]
  )

  const hoverFadeFrames = useMemo(
    () => buildHoverFadeFrames(bridgedFrames[0] ?? []),
    [bridgedFrames]
  )

  useEffect(() => {
    if (!isHoverCapable) return

    const maxStep = Math.max(HOVER_FADE_LAST_STEP, hoverFadeFrames.out.length - 1)
    const reverseStep = maxStep - hoverFadeStep

    if (isHovered) {
      if (hoverFadeState === "idle") {
        setHoverFadeState("fadingOut")
        setHoverFadeStep(0)
      } else if (hoverFadeState === "fadingIn") {
        setHoverFadeState("fadingOut")
        setHoverFadeStep(reverseStep)
      }
      return
    }

    if (hoverFadeState === "hidden") {
      setHoverFadeState("fadingIn")
      setHoverFadeStep(0)
    } else if (hoverFadeState === "fadingOut") {
      setHoverFadeState("fadingIn")
      setHoverFadeStep(reverseStep)
    }
  }, [hoverFadeFrames.out.length, hoverFadeState, hoverFadeStep, isHoverCapable, isHovered])

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

  const baseFrames = baseFramePoints ? [baseFramePoints] : bridgedFrames
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
