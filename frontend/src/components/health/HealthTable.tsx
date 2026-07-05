import React from 'react'
import StatusDot from '../ui/StatusDot'
import TypeTag from '../ui/TypeTag'
import Sparkline from '../ui/Sparkline'
import type { Service } from '../../lib/types'

interface HealthTableProps {
  services: Service[]
  onCheckService?: (id: string) => void
}

const HealthTable: React.FC<HealthTableProps> = ({ services, onCheckService }) => {
  const getRTColor = (rt: number | null | undefined) => {
    if (rt === null || rt === undefined) return 'var(--text-faint)'
    if (rt < 100) return 'var(--status-up)'
    if (rt < 1000) return 'var(--status-slow)'
    return 'var(--status-down)'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border-subtle text-text-tertiary text-[11px] uppercase tracking-wider">
            <th className="text-left py-2 px-3 font-medium">Service</th>
            <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Type</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
            <th className="text-right py-2 px-3 font-medium">Response</th>
            <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Trend</th>
            <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Error</th>
            <th className="text-right py-2 px-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const lastCheck = service.healthChecks?.[0]
            const rt = lastCheck?.responseTime
            const sparklineData = service.healthChecks?.slice(0, 8).reverse().map(h => h.responseTime) ?? []
            const isDown = service.status === 'error'

            return (
              <tr
                key={service.id}
                className={`border-b border-border-subtle hover:bg-elevated/50 transition-colors ${
                  isDown ? 'bg-[var(--status-down-bg)]' : ''
                }`}
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={service.status} size={6} pulsing={service.status === 'running'} />
                    <span className="font-medium text-text-primary truncate max-w-[160px]">{service.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 hidden sm:table-cell">
                  <TypeTag type={service.type} small />
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-[11px] font-medium" style={{ color: isDown ? 'var(--status-down)' : 'var(--status-up)' }}>
                    {service.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <span style={{ color: getRTColor(rt) }}>
                    {rt !== null && rt !== undefined ? `${rt}ms` : '--'}
                  </span>
                </td>
                <td className="py-2.5 px-3 hidden md:table-cell">
                  <div className="w-16 sm:w-24">
                    <Sparkline data={sparklineData} height={16} />
                  </div>
                </td>
                <td className="py-2.5 px-3 hidden lg:table-cell">
                  <span className="text-[11px] text-text-tertiary truncate max-w-[140px] block"
                    title={lastCheck?.errorMessage || ''}>
                    {lastCheck?.errorMessage || '--'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  {onCheckService && (
                    <button
                      onClick={() => onCheckService(service.id)}
                      className="text-[11px] text-accent hover:text-accent-hover font-medium"
                    >
                      Check
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default HealthTable
