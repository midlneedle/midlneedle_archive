'use client'

import { useEffect, useState } from 'react'

type ConnectionInfo = {
  saveData?: boolean
  addEventListener?: (type: 'change', listener: () => void) => void
  removeEventListener?: (type: 'change', listener: () => void) => void
}

export function useVideoAutoplay() {
  const [allowAutoplay, setAllowAutoplay] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection

    const update = () => {
      const reduceMotion = mediaQuery.matches
      const saveData = Boolean(connection?.saveData)
      setAllowAutoplay(!(reduceMotion || saveData))
    }

    update()
    mediaQuery.addEventListener?.('change', update)
    connection?.addEventListener?.('change', update)

    return () => {
      mediaQuery.removeEventListener?.('change', update)
      connection?.removeEventListener?.('change', update)
    }
  }, [])

  return allowAutoplay
}
