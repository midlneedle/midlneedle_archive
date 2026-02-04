'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

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
  variant: "playground" | "cases" | "connect"
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
  const [trails, setTrails] = useState<PixelTrail[]>([])
  const [wavePixels, setWavePixels] = useState<WavePixel[]>([])
  const trailIdRef = useRef(0)
  const lastGridPosRef = useRef<string>('')
  const waveAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const pixelElement = pixelRef.current
    if (!pixelElement) return

    const isMobile = window.matchMedia('(hover: none) or (pointer: coarse)').matches

    const startWave = (cx: number, cy: number) => {
      if (waveAnimRef.current) {
        clearInterval(waveAnimRef.current)
        waveAnimRef.current = null
      }

      let ring = 0
      setWavePixels(getRingPixels(cx, cy, 0).map(p => ({ ...p, fadeStep: 0 })))

      waveAnimRef.current = setInterval(() => {
        ring++
        const newRing = getRingPixels(cx, cy, ring)

        setWavePixels(prev => {
          const faded = prev
            .map(p => ({ ...p, fadeStep: p.fadeStep + 1 }))
            .filter(p => p.fadeStep < 4)

          const combined = [...faded, ...newRing.map(p => ({ ...p, fadeStep: 0 }))]

          if (combined.length === 0) {
            clearInterval(waveAnimRef.current!)
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

    pixelElement.addEventListener('click', handleClick)

    if (isMobile) {
      return () => {
        pixelElement.removeEventListener('click', handleClick)
        if (waveAnimRef.current) clearInterval(waveAnimRef.current)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = pixelElement.getBoundingClientRect()
      const relativeX = (e.clientX - rect.left) / rect.width
      const relativeY = (e.clientY - rect.top) / rect.height
      const gridX = Math.floor(relativeX * 10) + 1
      const gridY = Math.floor(relativeY * 10) + 1

      // Ограничиваем внутренней областью (2-8 для trail шириной 2)
      if (gridX < 2 || gridX > 8 || gridY < 2 || gridY > 9) return

      const gridPos = `${gridX},${gridY}`
      if (gridPos === lastGridPosRef.current) return
      lastGridPosRef.current = gridPos

      setTrails(prev => {
        const filtered = prev.filter(t =>
          !(t.gridX === gridX && t.gridY === gridY) &&
          !(t.gridX === gridX + 1 && t.gridY === gridY)
        )
        return [
          ...filtered,
          { gridX, gridY, id: trailIdRef.current++, fadeStep: 0 },
          { gridX: gridX + 1, gridY, id: trailIdRef.current++, fadeStep: 0 }
        ].slice(-8)
      })
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      setTrails([])
      lastGridPosRef.current = ''
    }

    pixelElement.addEventListener('mousemove', handleMouseMove)
    pixelElement.addEventListener('mouseenter', handleMouseEnter)
    pixelElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      pixelElement.removeEventListener('click', handleClick)
      pixelElement.removeEventListener('mousemove', handleMouseMove)
      pixelElement.removeEventListener('mouseenter', handleMouseEnter)
      pixelElement.removeEventListener('mouseleave', handleMouseLeave)
      if (waveAnimRef.current) clearInterval(waveAnimRef.current)
    }
  }, [])

  // Анимация затухания trails
  useEffect(() => {
    if (trails.length === 0) return
    const interval = setInterval(() => {
      setTrails(prev =>
        prev
          .map(trail => ({ ...trail, fadeStep: trail.fadeStep + 1 }))
          .filter(trail => trail.fadeStep < 4)
      )
    }, 200)
    return () => clearInterval(interval)
  }, [trails.length])

  // Комбинирован shadow: trail поверх wave
  const combinedShadow = useMemo(() => {
    const colors = ['var(--pixel-dark)', 'var(--pixel-mid)', 'var(--pixel-light)', 'var(--pixel-faint)']
    const shadows = [
      ...trails.map(t => `calc(var(--px) * ${t.gridX}) calc(var(--px) * ${t.gridY}) 0 0 ${colors[t.fadeStep]}`),
      ...wavePixels.map(p => `calc(var(--px) * ${p.gridX}) calc(var(--px) * ${p.gridY}) 0 0 ${colors[p.fadeStep]}`)
    ]
    return shadows.length > 0 ? shadows.join(', ') : 'none'
  }, [trails, wavePixels])

  return (
    <span
      ref={pixelRef}
      aria-hidden="true"
      className={`title-pixel-interactive title-pixel-interactive--${variant}`}
      data-hovered={isHovered}
      style={{ '--trail-shadow': combinedShadow } as React.CSSProperties}
    >
      <span className="pixel-frame" />
    </span>
  )
}
