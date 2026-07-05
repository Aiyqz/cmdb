import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ServiceStatus } from '../../lib/types'

const statusConfig: Record<ServiceStatus, { color: string; bg: string; glow?: string }> = {
  running: { color: 'var(--status-up)', bg: 'var(--status-up-bg)', glow: 'var(--status-up-glow)' },
  error: { color: 'var(--status-down)', bg: 'var(--status-down-bg)' },
  stopped: { color: 'var(--status-slow)', bg: 'var(--status-slow-bg)' },
  unknown: { color: 'var(--status-unknown)', bg: 'var(--status-unknown-bg)' },
}

interface StatusBadgeProps {
  status: ServiceStatus
  showDot?: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  const { t } = useTranslation()
  const config = statusConfig[status] || statusConfig.unknown
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: config.color,
            boxShadow: config.glow ? `0 0 4px ${config.glow}` : undefined,
            animation: config.glow ? 'pulseDot 2s ease-in-out infinite' : undefined,
          }}
        />
      )}
      {t(`status.${status}`)}
    </span>
  )
}

export default StatusBadge
