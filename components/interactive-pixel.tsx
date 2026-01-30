'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

interface PixelTrail {
  gridX: number
  gridY: number
  id: number
  fadeStep: number
}

interface InteractivePixelProps {
  variant: "playground" | "cases" | "connect"
}

export function InteractivePixel({ variant }: InteractivePixelProps) {
  const pixelRef = useRef<HTMLSpanElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [trails, setTrails] = useState<PixelTrail[]>([])
  const trailIdRef = useRef(0)
  const lastGridPosRef = useRef<string>('')

  useEffect(() => {
    const pixelElement = pixelRef.current
    if (!pixelElement) return

    // Не запускаем на мобильных устройствах
    const isMobile = window.matchMedia('(hover: none) or (pointer: coarse)').matches
    if (isMobile) return

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
      pixelElement.removeEventListener('mousemove', handleMouseMove)
      pixelElement.removeEventListener('mouseenter', handleMouseEnter)
      pixelElement.removeEventListener('mouseleave', handleMouseLeave)
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

  // Мемоизируем генерацию shadow
  const trailShadow = useMemo(() => {
    if (trails.length === 0) return 'none'
    const colors = ['var(--pixel-dark)', 'var(--pixel-mid)', 'var(--pixel-light)', 'var(--pixel-faint)']
    return trails
      .map(trail => `calc(var(--px) * ${trail.gridX}) calc(var(--px) * ${trail.gridY}) 0 0 ${colors[trail.fadeStep]}`)
      .join(', ')
  }, [trails])

  return (
    <span
      ref={pixelRef}
      aria-hidden="true"
      className={`title-pixel-interactive title-pixel-interactive--${variant}`}
      data-hovered={isHovered}
      style={{ '--trail-shadow': trailShadow } as React.CSSProperties}
    >
      <span className="pixel-frame" />
    </span>
  )
}
