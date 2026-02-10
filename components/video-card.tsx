"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"
import { useMedia } from "./media-context"
import { MorphingMedia } from "./morphing-media"
import { useVideoAutoplay } from "@/hooks/use-video-autoplay"
import { OptimizedVideoPlayer } from "./optimized-video-player"

interface VideoCardProps {
  src: string
  title: string
  description?: string
  orientation?: "vertical" | "horizontal"
  showTitle?: boolean
  showDescription?: boolean
  className?: string
  blurDataURL?: string
}

export function VideoCard({
  src,
  title,
  description,
  orientation = "vertical",
  showTitle = true,
  showDescription = true,
  className,
  blurDataURL,
}: VideoCardProps) {
  const id = useId()
  const { expandedId, isClosing, setExpandedId } = useMedia()
  const allowAutoplay = useVideoAutoplay()

  const isExpanded = expandedId === id
  const hasExpandedMedia = expandedId !== null
  const shouldAutoplay =
    isExpanded || (allowAutoplay && !hasExpandedMedia && !isClosing)
  const layoutId = `media-${id}`

  const handleOpen = () => {
    setExpandedId(id)
  }
  const handleClose = () => {
    setExpandedId(null)
  }

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col origin-center",
          className
        )}
      >
        <MorphingMedia
          layoutId={layoutId}
          isOpen={isExpanded}
          onOpen={handleOpen}
          onClose={handleClose}
          triggerClassName={cn(
            "cursor-zoom-in mb-[var(--space-inset)]",
            !expandedId &&
              !isClosing &&
              "transition-transform duration-300 ease-out hover:scale-[1.02]",
            orientation === "vertical" ? "aspect-[9/16]" : "aspect-video"
          )}
          expandedClassName={cn(
            orientation === "vertical"
              ? "h-[80vh] aspect-[9/16]"
              : "w-[80vw] max-w-6xl aspect-video"
          )}
        >
          <div
            className={cn(
              "stroke relative h-full w-full overflow-hidden rounded-[var(--radius-card)]"
            )}
            style={{ backgroundColor: blurDataURL || "#000" }}
          >
            <OptimizedVideoPlayer
              src={src}
              shouldAutoplay={shouldAutoplay}
              className="relative h-full w-full"
            />
          </div>
        </MorphingMedia>
        <div>
          {showTitle && (
            <h3 className="type-card-title mb-0 text-foreground">
              {title}
            </h3>
          )}
          {showDescription && description && (
            <p className="type-card-caption mt-[var(--space-card-text)] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
