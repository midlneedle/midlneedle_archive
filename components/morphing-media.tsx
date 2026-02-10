"use client"

import {
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
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { cn } from "@/lib/utils"

const subscribeHydration = () => () => {}

function useIsHydrated() {
  return useSyncExternalStore(subscribeHydration, () => true, () => false)
}

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
  const isHydrated = useIsHydrated()
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const lastActiveRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const [isOverlayActive, setIsOverlayActive] = useState(isOpen)
  const scrollLockStyles = useRef<{
    bodyPaddingRight: string
    bodyOverflow: string
    bodyOverscroll: string
  } | null>(null)

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
        const dialog = modalRef.current
        if (!dialog) return
        try {
          dialog.focus({ preventScroll: true })
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

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleOpen()
    }
  }

  const handleOpen = () => {
    if (isOpen) return
    lastActiveRef.current = document.activeElement as HTMLElement
    setIsOverlayActive(true)
    onOpen()
  }

  const getFocusableElements = (container: HTMLElement) => {
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    return Array.from(focusable).filter((el) => !el.hasAttribute("disabled"))
  }

  const handleModalKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return
    const container = modalRef.current
    if (!container) return
    const focusable = getFocusableElements(container)
    if (focusable.length === 0) {
      event.preventDefault()
      container.focus()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleClosePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onClose()
  }

  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <motion.div
        layoutId={layoutId}
        layout
        layoutCrossfade={false}
        layoutDependency={isOpen}
        ref={triggerRef}
        className={cn(
          "relative overflow-clip transform-gpu outline-none focus-visible:outline-none",
          isOverlayActive && "pointer-events-none",
          isOverlayActive && "z-[80]",
          triggerClassName
        )}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          handleOpen()
        }}
        onClick={handleOpen}
        onKeyDown={handleTriggerKeyDown}
      >
        {children}
      </motion.div>
      {isHydrated && isOverlayActive
        ? createPortal(
            <div className="fixed inset-0 z-[70]">
              <AnimatePresence
                mode="sync"
                onExitComplete={() => {
                  if (!isOpen) {
                    setIsOverlayActive(false)
                  }
                }}
              >
                {isOpen ? (
                  <>
                    <motion.div
                      className="fixed inset-0 bg-white/95 cursor-zoom-out"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.34, ease: "easeOut" },
                      }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.22, ease: "easeInOut" },
                      }}
                      onPointerDown={handleClosePointerDown}
                    />
                    <motion.div
                      layoutRoot
                      className="fixed inset-0 flex items-center justify-center p-8 cursor-zoom-out"
                      onPointerDown={handleClosePointerDown}
                    >
                      <motion.div
                        layoutId={layoutId}
                        layout
                        layoutCrossfade={false}
                        layoutDependency={isOpen}
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Media preview"
                        tabIndex={-1}
                        className={cn(
                          "relative overflow-hidden rounded-[var(--radius-card)] outline-none cursor-zoom-out transform-gpu",
                          expandedClassName
                        )}
                        onKeyDown={handleModalKeyDown}
                        onPointerDown={handleClosePointerDown}
                      >
                        {children}
                      </motion.div>
                    </motion.div>
                  </>
                ) : null}
              </AnimatePresence>
            </div>,
            document.body
          )
        : null}
    </MotionConfig>
  )
}
