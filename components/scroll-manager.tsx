'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollManager() {
  const pathname = usePathname()
  const scrollPositions = useRef<{ [key: string]: number }>({})
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Пропускаем первый рендер
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Проверяем, это переход на главную страницу
    const isHomePage = pathname === '/'

    if (isHomePage && scrollPositions.current[pathname] !== undefined) {
      // Восстанавливаем позицию для главной страницы
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositions.current[pathname] || 0,
          left: 0,
          behavior: 'instant' as ScrollBehavior
        })
      }, 0)
    } else {
      // Для всех остальных страниц (включая статьи) - скролл в начало
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior
      })
    }
  }, [pathname])

  useEffect(() => {
    // Сохраняем позицию скролла при уходе со страницы
    const saveScrollPosition = () => {
      scrollPositions.current[pathname] = window.scrollY
    }

    // Сохраняем позицию перед переходом
    window.addEventListener('beforeunload', saveScrollPosition)

    // Также сохраняем при любом скролле на главной
    const handleScroll = () => {
      if (pathname === '/') {
        scrollPositions.current[pathname] = window.scrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      saveScrollPosition()
      window.removeEventListener('beforeunload', saveScrollPosition)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  return null
}
