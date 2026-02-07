"use client"

import { useMemo } from "react"

interface PixelLoadingSpinnerProps {
  size?: number // размер в em, default 1
}

export function PixelLoadingSpinner({ size = 1 }: PixelLoadingSpinnerProps) {
  // Паттерн спиннера - 4 кадра анимации по кругу
  const frames = useMemo(() => [
    // Frame 1: верх
    [
      { x: 5, y: 2 },
      { x: 6, y: 2 },
    ],
    // Frame 2: право
    [
      { x: 8, y: 5 },
      { x: 8, y: 6 },
    ],
    // Frame 3: низ
    [
      { x: 5, y: 9 },
      { x: 6, y: 9 },
    ],
    // Frame 4: лево
    [
      { x: 3, y: 5 },
      { x: 3, y: 6 },
    ],
  ], [])

  return (
    <span
      className="pixel-loading-spinner"
      style={
        {
          "--spinner-size": size,
        } as React.CSSProperties
      }
      aria-label="Loading..."
    >
      <span className="pixel-spinner-frame" />
    </span>
  )
}
