'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Немедленная прокрутка в начало
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    })

    // Дополнительная проверка после небольшой задержки
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior
      })
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
