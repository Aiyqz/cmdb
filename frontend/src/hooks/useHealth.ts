import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import type { Service } from '../lib/types'

interface UseHealthOptions {
  autoRefresh?: boolean
  interval?: number
}

export function useHealth({ autoRefresh = false, interval = 30000 }: UseHealthOptions = {}) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [autoEnabled, setAutoEnabled] = useState(autoRefresh)
  const [autoInterval, setAutoInterval] = useState(interval)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async () => {
    const data = await api.get('/api/health/status')
    setServices(data)
    setLoading(false)
  }, [])

  const runCheck = useCallback(async () => {
    setChecking(true)
    try {
      await api.post('/api/health/check')
      await fetchStatus()
      setLastCheck(new Date())
    } finally {
      setChecking(false)
    }
  }, [fetchStatus])

  // Auto-refresh
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoEnabled) {
      timerRef.current = setInterval(runCheck, autoInterval)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoEnabled, autoInterval, runCheck])

  // Initial load
  useEffect(() => { fetchStatus() }, [fetchStatus])

  return {
    services,
    loading,
    checking,
    lastCheck,
    autoEnabled,
    setAutoEnabled,
    autoInterval,
    setAutoInterval,
    runCheck,
    fetchStatus,
  }
}
