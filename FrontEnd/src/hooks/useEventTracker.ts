import { useCallback, useEffect, useRef } from 'react'
import { learningApi, EventItem } from '../services/api/learningApi'

const BATCH_INTERVAL_MS = 30_000
const BATCH_SIZE = 20

export function useEventTracker(userId: number | null) {
  const queueRef = useRef<EventItem[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const flush = useCallback(async () => {
    if (!userId || queueRef.current.length === 0) return
    const batch = queueRef.current.splice(0, BATCH_SIZE)
    try {
      await learningApi.trackEvents(batch)
    } catch (err) {
      // Only re-queue if the component is still mounted
      if (mountedRef.current) {
        queueRef.current.unshift(...batch)
        console.warn('Event batch failed, re-queued:', err)
      }
    }
  }, [userId])

  const track = useCallback((item: EventItem) => {
    if (!userId) return
    queueRef.current.push(item)
    if (queueRef.current.length >= BATCH_SIZE) {
      flush()
    }
  }, [flush, userId])

  useEffect(() => {
    mountedRef.current = true
    if (!userId) return
    timerRef.current = setInterval(flush, BATCH_INTERVAL_MS)
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [userId, flush])

  return { track, flush }
}
