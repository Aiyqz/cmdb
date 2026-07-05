import React from 'react'
import type { ServiceStatus } from '../../lib/types'

const dotColors: Record<ServiceStatus, string> = {
  running: 'var(--status-up)',
  error: 'var(--status-down)',
  stopped: 'var(--status-slow)',
  unknown: 'var(--status-unknown)',
}

const glowColors: Record<ServiceStatus, string | undefined> = {
  running: 'var(--status-up-glow)',
  error: undefined,
  stopped: undefined,
  unknown: undefined,
}

interface StatusDotProps {
  status: ServiceStatus
  size?: number
  pulsing?: boolean
}

const StatusDot: React.FC<StatusDotProps> = ({ status, size = 8, pulsing = true }) => {
  const color = dotColors[status] || dotColors.unknown
  const glow = glowColors[status]
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: glow && pulsing ? `0 0 6px ${glow}` : undefined,
        animation: glow && pulsing ? 'pulseDot 2s ease-in-out infinite' : undefined,
      }}
    />
  )
}

export default StatusDot
