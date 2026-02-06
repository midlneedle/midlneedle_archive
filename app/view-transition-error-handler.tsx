'use client'

import { useEffect } from 'react'

/**
 * Обрабатывает ошибки View Transitions на мобильных устройствах
 * Проблема: InvalidStateError при изменении viewport (скрытие/показ URL bar)
 * Решение: Graceful fallback - игнорируем ошибку, navigation продолжается без transition
 */
export function ViewTransitionErrorHandler() {
  useEffect(() => {
    // Обработчик для unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // Проверяем если это InvalidStateError от View Transitions
      if (
        error instanceof DOMException &&
        error.name === 'InvalidStateError' &&
        error.message?.includes('viewport')
      ) {
        // Предотвращаем вывод ошибки в консоль
        event.preventDefault()

        // Опционально: можно залогировать для debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[View Transitions] Skipped due to viewport size change (mobile browser UI)',
            error.message
          )
        }
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
