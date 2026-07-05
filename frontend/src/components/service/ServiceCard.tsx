import React from 'react'
import { useNavigate } from 'react-router-dom'
import StatusDot from '../ui/StatusDot'
import TypeTag from '../ui/TypeTag'
import Sparkline from '../ui/Sparkline'
import type { Service } from '../../lib/types'

interface ServiceCardProps {
  service: Service
  onDelete?: (id: string) => void
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onDelete }) => {
  const navigate = useNavigate()
  const lastCheck = service.healthChecks?.[0]
  const responseTime = lastCheck?.responseTime ?? null
  const isDown = service.status === 'error'

  const responseColor =
    responseTime === null ? 'var(--status-unknown)' :
    responseTime < 100 ? 'var(--status-up)' :
    responseTime < 1000 ? 'var(--status-slow)' : 'var(--status-down)'

  // Generate mock sparkline data from actual response time
  const sparklineData = service.healthChecks?.slice(0, 10).reverse().map(h => h.responseTime) ?? []

  return (
    <div
      onClick={() => navigate(`/services/${service.id}`)}
      className={`group rounded-xl p-4 border cursor-pointer transition-all duration-150 hover:border-border-default ${
        isDown ? 'border-[var(--status-down-border)]' : 'border-border-subtle'
      }`}
      style={{ backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={service.status} />
          <h3 className="text-[15px] font-medium text-text-primary truncate">{service.name}</h3>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(service.id) }}
            className="opacity-0 group-hover:opacity-100 text-text-faint hover:text-down text-xs transition-all"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <TypeTag type={service.type} />
        {service.location && (
          <span className="text-[11px] text-text-faint">{service.location}</span>
        )}
      </div>

      {service.hostname && (
        <div className="text-[12px] font-mono text-text-secondary truncate mb-1">
          {service.hostname}{service.port ? `:${service.port}` : ''}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-end justify-between">
        <div>
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">Response</div>
          <div className="text-[15px] font-mono font-medium" style={{ color: responseColor }}>
            {responseTime !== null ? `${responseTime}ms` : '--'}
          </div>
        </div>
        <div className="flex-1 ml-3">
          <Sparkline data={sparklineData} />
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
