"use client"

export function PixelLoadingSpinner() {
  return (
    <span className="pixel-loading" aria-label="Loading...">
      <span className="pixel-loading-frame" />
      <span className="pixel-loading-trail" />
    </span>
  )
}
