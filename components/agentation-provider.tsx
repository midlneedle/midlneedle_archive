"use client"

import { Agentation } from "agentation"

async function copyTextWithFallback(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fallback below handles browsers/contexts where Clipboard API is unavailable.
    }
  }

  if (typeof document === "undefined") {
    return false
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  textarea.style.pointerEvents = "none"
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const copied = document.execCommand("copy")
  document.body.removeChild(textarea)
  return copied
}

export function AgentationProvider() {
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Agentation
      copyToClipboard={false}
      endpoint="http://localhost:4747"
      onCopy={(output) => {
        void copyTextWithFallback(output).then((copied) => {
          if (!copied) {
            console.warn("Agentation copy failed in this browser/context")
          }
        })
      }}
      onSessionCreated={(sessionId) => {
        console.log("Agentation session started:", sessionId)
      }}
    />
  )
}
