"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react"
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
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const lastActiveRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const scrollLockStyles = useRef<{
    bodyPaddingRight: string
    bodyOverflow: string
    bodyOverscroll: string
  } | null>(null)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const showTopLayerDialog = useCallback(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return

    try {
      dialog.showModal()
    } catch {
      requestAnimationFrame(() => {
        const current = dialogRef.current
        if (!current || current.open) return
        try {
          current.showModal()
        } catch {
          // Keep graceful behavior if browser blocks modal promotion.
        }
      })
    }
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

      scrollLockStyles.current = null
    }

    if (isOpen) {
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
  }, [isOpen])

  useLayoutEffect(() => {
    if (!mounted) return
    if (isOpen) {
      setIsModalVisible(true)
      showTopLayerDialog()
      return
    }

    setIsModalVisible(false)
  }, [isOpen, mounted, showTopLayerDialog])

  useEffect(() => {
    return () => {
      const dialog = dialogRef.current
      if (dialog?.open) {
        dialog.close()
      }
    }
  }, [])

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
      if (video.dataset.autoplay === "false") return
      const maybePromise = video.play()
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(() => {})
      }
    })
  }, [])

  useEffect(() => {
    if (isOpen) {
      pauseAll(document.body)
      playAll(modalRef.current)
    } else {
      pauseAll(modalRef.current)
      requestAnimationFrame(() => playAll(triggerRef.current))
    }
  }, [isOpen, pauseAll, playAll])

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
    lastActiveRef.current = document.activeElement as HTMLElement
    setIsModalVisible(true)
    showTopLayerDialog()
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

  return (
    <MotionConfig transition={{ duration: 0.3, ease: "easeInOut" }}>
      <motion.div
        layoutId={layoutId}
        layout
        layoutDependency={isOpen}
        ref={triggerRef}
        className={cn(
          "relative overflow-clip transform-gpu outline-none focus-visible:outline-none",
          isOpen && "pointer-events-none",
          triggerClassName
        )}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleOpen}
        onKeyDown={handleTriggerKeyDown}
      >
        {children}
      </motion.div>
      {mounted
        ? createPortal(
            <dialog
              ref={dialogRef}
              className="morphing-media-dialog fixed inset-0 m-0 h-screen w-screen max-h-none max-w-none overflow-visible bg-transparent p-0 text-inherit"
              style={{ border: "none" }}
              onCancel={(event) => {
                event.preventDefault()
                onClose()
              }}
            >
              <AnimatePresence
                initial={false}
                mode="sync"
                onExitComplete={() => {
                  const dialog = dialogRef.current
                  if (!isOpen && dialog?.open) {
                    dialog.close()
                  }
                }}
              >
                {isModalVisible ? (
                  <>
                    <motion.div
                      className="fixed inset-0 bg-white/95 cursor-zoom-out"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={onClose}
                    />
                    <motion.div
                      layoutRoot
                      className="fixed inset-0 flex items-center justify-center p-8 cursor-zoom-out"
                      onClick={onClose}
                    >
                      <motion.div
                        layoutId={layoutId}
                        layout
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
                        onClick={(event) => event.stopPropagation()}
                      >
                        {children}
                      </motion.div>
                    </motion.div>
                  </>
                ) : null}
              </AnimatePresence>
            </dialog>,
            document.body
          )
        : null}
    </MotionConfig>
  )
}
