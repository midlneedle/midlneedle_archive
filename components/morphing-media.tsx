"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { MotionConfig, motion } from "motion/react"
import { cn } from "@/lib/utils"

const subscribeHydration = () => () => {}
const OVERLAY_PADDING = 32
const MAX_HORIZONTAL_WIDTH_REM = 72
const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

function useIsHydrated() {
  return useSyncExternalStore(subscribeHydration, () => true, () => false)
}

function subscribeIsMobile(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  const onChange = () => callback()
  mediaQuery.addEventListener("change", onChange)
  return () => {
    mediaQuery.removeEventListener("change", onChange)
  }
}

function getIsMobileSnapshot() {
  if (typeof window === "undefined") return false
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function useIsMobile() {
  return useSyncExternalStore(subscribeIsMobile, getIsMobileSnapshot, () => false)
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

type ExpandedVariant = "vertical" | "horizontal"

interface MorphingMediaProps {
  layoutId: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  triggerClassName?: string
  expandedVariant?: ExpandedVariant
  children: ReactNode
}

function toRect(rect: DOMRect): Rect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function getExpandedRect(variant: ExpandedVariant): Rect {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const availableWidth = Math.max(viewportWidth - OVERLAY_PADDING * 2, 0)
  const availableHeight = Math.max(viewportHeight - OVERLAY_PADDING * 2, 0)

  let width = 0
  let height = 0

  if (variant === "vertical") {
    height = Math.min(viewportHeight * 0.8, availableHeight)
    width = (height * 9) / 16
    if (width > availableWidth) {
      width = availableWidth
      height = (width * 16) / 9
    }
  } else {
    const rootFontSize =
      Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize
      ) || 16
    const maxHorizontalWidth = MAX_HORIZONTAL_WIDTH_REM * rootFontSize
    width = Math.min(viewportWidth * 0.8, availableWidth, maxHorizontalWidth)
    height = (width * 9) / 16
    if (height > availableHeight) {
      height = availableHeight
      width = (height * 16) / 9
    }
  }

  return {
    top: (viewportHeight - height) / 2,
    left: (viewportWidth - width) / 2,
    width,
    height,
  }
}

const INLINE_RECT = {
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
}

export function MorphingMedia({
  layoutId,
  isOpen,
  onOpen,
  onClose,
  triggerClassName,
  expandedVariant = "horizontal",
  children,
}: MorphingMediaProps) {
  const isHydrated = useIsHydrated()
  const isMobile = useIsMobile()
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const mediaRef = useRef<HTMLDivElement | null>(null)
  const lastActiveRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const [isOverlayActive, setIsOverlayActive] = useState(isOpen)
  const [floatingRect, setFloatingRect] = useState<Rect | null>(null)
  const [isEnteringOverlay, setIsEnteringOverlay] = useState(false)
  const scrollLockStyles = useRef<{
    bodyPaddingRight: string
    bodyOverflow: string
    bodyOverscroll: string
  } | null>(null)

  const getTriggerRect = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return null
    const rect = trigger.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    return toRect(rect)
  }, [])

  const getTargetRect = useCallback(
    () => getExpandedRect(expandedVariant),
    [expandedVariant]
  )

  useLayoutEffect(() => {
    const body = document.body
    const root = document.documentElement

    const restoreScrollLock = () => {
      if (!scrollLockStyles.current) return
      const saved = scrollLockStyles.current

      body.style.paddingRight = saved.bodyPaddingRight
      body.style.overflow = saved.bodyOverflow
      body.style.overscrollBehavior = saved.bodyOverscroll

      scrollLockStyles.current = null
    }

    if (isOverlayActive) {
      if (!scrollLockStyles.current) {
        scrollLockStyles.current = {
          bodyPaddingRight: body.style.paddingRight,
          bodyOverflow: body.style.overflow,
          bodyOverscroll: body.style.overscrollBehavior,
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
    } else {
      restoreScrollLock()
    }

    return () => {
      restoreScrollLock()
    }
  }, [isOverlayActive])

  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement
      requestAnimationFrame(() => {
        const preview = mediaRef.current
        if (!preview) return
        try {
          preview.focus({ preventScroll: true })
        } catch {
          // Older Safari can scroll the page when focusing; skip fallback focus.
        }
      })
    } else if (wasOpenRef.current) {
      const target = lastActiveRef.current
      if (target) {
        try {
          target.focus({ preventScroll: true })
        } catch {
          const scrollX = window.scrollX
          const scrollY = window.scrollY
          target.focus()
          window.scrollTo(scrollX, scrollY)
        }
      }
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

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

  useEffect(() => {
    if (!isOverlayActive || !isOpen) return
    const handleResize = () => {
      setFloatingRect(getTargetRect())
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [getTargetRect, isOpen, isOverlayActive])

  useLayoutEffect(() => {
    if (!isOverlayActive) return
    const nextRect = isOpen ? getTargetRect() : getTriggerRect()
    if (!nextRect) return

    const rafId = window.requestAnimationFrame(() => {
      setFloatingRect(nextRect)
      if (isEnteringOverlay) {
        setIsEnteringOverlay(false)
      }
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [getTargetRect, getTriggerRect, isEnteringOverlay, isOpen, isOverlayActive])

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isMobile) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleOpen()
    }
  }

  const handleOpen = () => {
    if (isMobile) return
    if (isOpen || isOverlayActive) return
    lastActiveRef.current = document.activeElement as HTMLElement
    setFloatingRect(getTriggerRect() ?? getTargetRect())
    setIsEnteringOverlay(true)
    setIsOverlayActive(true)
    onOpen()
  }

  const handleClosePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isOpen) return
    onClose()
  }

  const handleMediaAnimationComplete = () => {
    if (!isOverlayActive || isOpen) return
    setIsOverlayActive(false)
    setIsEnteringOverlay(false)
    setFloatingRect(null)
  }

  const shouldDisableAnimation = isMobile
  const shouldDisableZoom = isMobile

  useEffect(() => {
    if (!shouldDisableZoom || !isOpen) return
    onClose()
  }, [isOpen, onClose, shouldDisableZoom])

  return (
    <MotionConfig
      transition={
        shouldDisableAnimation
          ? { duration: 0 }
          : { duration: 0.3, ease: "easeInOut" }
      }
    >
      <div
        ref={triggerRef}
        className={cn(
          "relative overflow-clip outline-none focus-visible:outline-none",
          isOverlayActive && "pointer-events-none",
          isOverlayActive && "z-[80]",
          shouldDisableZoom && "cursor-default",
          triggerClassName
        )}
        role={shouldDisableZoom ? undefined : "button"}
        tabIndex={shouldDisableZoom ? -1 : 0}
        aria-haspopup={shouldDisableZoom ? undefined : "dialog"}
        aria-expanded={isOpen}
        onPointerDown={
          shouldDisableZoom
            ? undefined
            : (event) => {
                if (event.button !== 0) return
                handleOpen()
              }
        }
        onClick={shouldDisableZoom ? undefined : handleOpen}
        onKeyDown={handleTriggerKeyDown}
      >
        <motion.div
          ref={mediaRef}
          tabIndex={isOverlayActive ? -1 : undefined}
          role={isOverlayActive ? "dialog" : undefined}
          aria-modal={isOverlayActive ? "true" : undefined}
          aria-label={isOverlayActive ? "Media preview" : undefined}
          className={cn(
            "stroke overflow-hidden rounded-[var(--radius-card)] outline-none transform-gpu",
            isOverlayActive
              ? "fixed z-[80] cursor-zoom-out"
              : "absolute inset-0 cursor-zoom-in"
          )}
          initial={false}
          animate={
            isOverlayActive && floatingRect
              ? {
                  top: floatingRect.top,
                  left: floatingRect.left,
                  width: floatingRect.width,
                  height: floatingRect.height,
                }
              : INLINE_RECT
          }
          transition={
            shouldDisableAnimation || !isOverlayActive || isEnteringOverlay
              ? { duration: 0 }
              : undefined
          }
          onAnimationComplete={handleMediaAnimationComplete}
          onPointerDown={isOverlayActive ? handleClosePointerDown : undefined}
        >
          {children}
        </motion.div>
      </div>
      {isHydrated && isOverlayActive
        ? createPortal(
            <motion.div
              className="fixed inset-0 z-[70] bg-white/95 cursor-zoom-out"
              initial={{ opacity: 0 }}
              animate={{
                opacity: isOpen ? 1 : 0,
                transition: shouldDisableAnimation
                  ? { duration: 0 }
                  : isOpen
                    ? { duration: 0.34, ease: "easeOut" }
                    : { duration: 0.22, ease: "easeInOut" },
              }}
              onPointerDown={handleClosePointerDown}
            />,
            document.body
          )
        : null}
    </MotionConfig>
  )
}
