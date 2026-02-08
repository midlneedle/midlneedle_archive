"use client"

import {
  LOADER_FRAME_DURATION_MS,
  LOADER_PIXEL_FRAMES,
  LOADER_PIXEL_TONES,
  PIXEL_CORNERS,
} from "@/lib/pixel-sprite-data"
import { PixelSprite } from "./pixel-sprite"

export function PixelLoadingSpinner() {
  return (
    <span
      className="inline-block"
      aria-label="Loading..."
      style={{
        width: "calc(var(--pixel-unit) * 10)",
        height: "calc(var(--pixel-unit) * 10)",
      }}
    >
      <PixelSprite
        frames={LOADER_PIXEL_FRAMES}
        frameDurationMs={LOADER_FRAME_DURATION_MS}
        tones={LOADER_PIXEL_TONES}
        framePoints={PIXEL_CORNERS}
        className="h-full w-full"
      />
    </span>
  )
}
