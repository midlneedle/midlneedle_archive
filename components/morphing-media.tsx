"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface MorphingMediaProps {
  layoutId: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  triggerClassName?: string
  expandedClassName?: string
  children: ReactNode
}

export function MorphingMedia({
  layoutId,
  isOpen,
  onOpen,
  onClose,
  triggerClassName,
  expandedClassName,
  children,
}: MorphingMediaProps) {
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const scrollLockStyles = useRef<{
    bodyPaddingRight: string
    bodyOverflow: string
    bodyOverscroll: string
    htmlOverflow: string
    htmlOverscroll: string
  } | null>(null)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useLayoutEffect(() => {
    const body = document.body
    const root = document.documentElement
    const restoreScrollLock = () => {
      if (!scrollLockStyles.current) return
      const saved = scrollLockStyles.current
      body.style.paddingRight = saved.bodyPaddingRight
      body.style.overflow = saved.bodyOverflow
      body.style.overscrollBehavior = saved.bodyOverscroll
      root.style.overflow = saved.htmlOverflow
      root.style.overscrollBehavior = saved.htmlOverscroll
      scrollLockStyles.current = null
    }

    if (isOpen) {
      if (!scrollLockStyles.current) {
        scrollLockStyles.current = {
          bodyPaddingRight: body.style.paddingRight,
          bodyOverflow: body.style.overflow,
          bodyOverscroll: body.style.overscrollBehavior,
          htmlOverflow: root.style.overflow,
          htmlOverscroll: root.style.overscrollBehavior,
        }
      }
      const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth)
      if (scrollbarWidth > 0) {
        const computedBodyPadding =
          Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
        body.style.paddingRight = `${computedBodyPadding + scrollbarWidth}px`
      }
      body.style.overflow = "hidden"
      body.style.overscrollBehavior = "none"
      root.style.overflow = "hidden"
      root.style.overscrollBehavior = "none"
    } else {
      restoreScrollLock()
    }
    return () => {
      restoreScrollLock()
    }
  }, [isOpen])

  const pauseAll = useCallback((root: HTMLElement | null) => {
    if (!root) return
    root.querySelectorAll("video").forEach((video) => {
      try {
        video.pause()
      } catch {
        // Ignore pause errors for unsupported media states.
      }
    })
  }, [])

  const playAll = useCallback((root: HTMLElement | null) => {
    if (!root) return
    root.querySelectorAll("video").forEach((video) => {
      const maybePromise = video.play()
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(() => {})
      }
    })
  }, [])

  useEffect(() => {
    if (isOpen) {
      pauseAll(triggerRef.current)
      playAll(modalRef.current)
    } else {
      pauseAll(modalRef.current)
      requestAnimationFrame(() => playAll(triggerRef.current))
    }
  }, [isOpen, pauseAll, playAll])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <motion.div
        layoutId={layoutId}
        layout
        ref={triggerRef}
        className={cn(
          "relative overflow-clip transform-gpu",
          isOpen && "pointer-events-none",
          triggerClassName
        )}
        onClick={onOpen}
      >
        {children}
      </motion.div>
      {mounted
        ? createPortal(
            <AnimatePresence initial={false} mode="sync">
              {isOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40 bg-white/95 cursor-zoom-out"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                  />
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-8 cursor-zoom-out"
                    onClick={onClose}
                  >
                    <motion.div
                      layoutId={layoutId}
                      layout
                      ref={modalRef}
                      className={cn(
                        "relative overflow-clip cursor-zoom-out transform-gpu",
                        expandedClassName
                      )}
                    >
                      {children}
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </MotionConfig>
  )
}
