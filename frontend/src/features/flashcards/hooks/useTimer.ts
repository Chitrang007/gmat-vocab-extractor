import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTimerOptions {
  durationMs: number
  autoStart?: boolean
  onExpire?: () => void
}

export function useTimer({ durationMs, autoStart = false, onExpire }: UseTimerOptions) {
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const [isRunning, setIsRunning] = useState(false)
  const endTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const clearTimer = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (endTimeRef.current === null) return

    const nextRemaining = Math.max(0, endTimeRef.current - Date.now())
    setRemainingMs(nextRemaining)

    if (nextRemaining <= 0) {
      setIsRunning(false)
      clearTimer()
      if (!expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current?.()
      }
      return
    }

    frameRef.current = requestAnimationFrame(tick)
  }, [clearTimer])

  const start = useCallback(() => {
    clearTimer()
    expiredRef.current = false
    endTimeRef.current = Date.now() + durationMs
    setRemainingMs(durationMs)
    setIsRunning(true)
    frameRef.current = requestAnimationFrame(tick)
  }, [clearTimer, durationMs, tick])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    pause()
    expiredRef.current = false
    endTimeRef.current = null
    setRemainingMs(durationMs)
  }, [durationMs, pause])

  useEffect(() => {
    if (autoStart) {
      start()
    }
    return clearTimer
  }, [autoStart, clearTimer, start])

  return {
    remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    isRunning,
    start,
    pause,
    reset,
  }
}
