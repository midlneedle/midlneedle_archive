"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"
import { useMedia } from "./media-context"
import { MorphingMedia } from "./morphing-media"
import { useVideoAutoplay } from "@/hooks/use-video-autoplay"

interface CaseItem {
  src: string
  title: string
}

interface CasesGridProps {
  cases: CaseItem[]
}

function CaseCard({ caseItem, allowAutoplay }: { caseItem: CaseItem; allowAutoplay: boolean }) {
  const id = useId()
  const { hoveredId, expandedId, setHoveredId, setExpandedId } = useMedia()

  const isHovered = hoveredId === id
  const isExpanded = expandedId === id
  const shouldAutoplay = allowAutoplay || isExpanded
  const layoutId = `case-${id}`

  const handleOpen = () => {
    setHoveredId(null)
    setExpandedId(id)
  }
  const handleClose = () => {
    setHoveredId(null)
    setExpandedId(null)
  }

  return (
    <>
      <div
        className={cn(
          "relative transition-transform duration-300 ease-out transform-gpu origin-center",
          isHovered && !expandedId && "scale-[1.02]",
          isHovered && !expandedId && "z-40"
        )}
        onMouseEnter={() => !expandedId && setHoveredId(id)}
        onMouseLeave={() => !expandedId && setHoveredId(null)}
      >
        <MorphingMedia
          layoutId={layoutId}
          isOpen={isExpanded}
          onOpen={handleOpen}
          onClose={handleClose}
          triggerClassName={cn(
            "aspect-video cursor-zoom-in"
          )}
          expandedClassName="w-[80vw] max-w-6xl aspect-video"
        >
          <div
            className={cn(
              "relative h-full w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-black"
            )}
          >
            <video
              src={caseItem.src}
              data-autoplay={shouldAutoplay ? "true" : "false"}
              autoPlay={shouldAutoplay}
              loop={shouldAutoplay}
              muted
              playsInline
              preload={shouldAutoplay ? "auto" : "metadata"}
              onLoadedData={(event) => {
                if (shouldAutoplay) return
                const video = event.currentTarget
                if (video.currentTime === 0) {
                  try {
                    video.currentTime = 0.0001
                  } catch {
                    // Ignore seek errors; the browser will show the first frame if possible.
                  }
                }
              }}
              className="absolute inset-0 h-full w-full object-cover transform-gpu scale-[1.01]"
            />
            {!shouldAutoplay && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-black shadow-sm backdrop-blur-sm">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 translate-x-[1px] fill-current"
                  >
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute inset-0 z-10 flex items-end p-[var(--space-inset)]">
              <h3 className="type-title m-0 text-white">
                {caseItem.title}
              </h3>
            </div>
          </div>
        </MorphingMedia>
      </div>
    </>
  )
}

export function CasesGrid({ cases }: CasesGridProps) {
  const allowAutoplay = useVideoAutoplay()

  return (
    <div className="flex flex-col gap-[var(--space-stack)]">
      {cases.map((caseItem, index) => (
        <CaseCard key={index} caseItem={caseItem} allowAutoplay={allowAutoplay} />
      ))}
    </div>
  )
}
