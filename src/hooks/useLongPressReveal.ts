import { useEffect, useRef, useState } from 'react'

const LONG_PRESS_MS = 450
const MOVE_THRESHOLD_PX = 10

export function useLongPressReveal() {
  const [revealId, setRevealId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ignoreNextUpRef = useRef(false)
  const pointerStartRef = useRef({ x: 0, y: 0 })

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const startLongPress = (id: string, clientX: number, clientY: number) => {
    clearTimer()
    setRevealId(null)
    pointerStartRef.current = { x: clientX, y: clientY }
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setRevealId(id)
      ignoreNextUpRef.current = true
    }, LONG_PRESS_MS)
  }

  const cancelLongPress = (clientX: number, clientY: number) => {
    const dx = clientX - pointerStartRef.current.x
    const dy = clientY - pointerStartRef.current.y
    if (Math.abs(dx) > MOVE_THRESHOLD_PX || Math.abs(dy) > MOVE_THRESHOLD_PX) {
      clearTimer()
    }
  }

  const onPointerEnd = (id: string) => {
    clearTimer()
    if (ignoreNextUpRef.current) {
      ignoreNextUpRef.current = false
      return
    }
    if (revealId === id) setRevealId(null)
  }

  useEffect(() => {
    const onGlobalEnd = () => clearTimer()
    window.addEventListener('touchend', onGlobalEnd, { passive: true })
    window.addEventListener('mouseup', onGlobalEnd)
    return () => {
      window.removeEventListener('touchend', onGlobalEnd)
      window.removeEventListener('mouseup', onGlobalEnd)
    }
  }, [])

  return {
    revealId,
    setRevealId,
    startLongPress,
    cancelLongPress,
    onPointerEnd,
    clearLongPressTimer: clearTimer,
  }
}
