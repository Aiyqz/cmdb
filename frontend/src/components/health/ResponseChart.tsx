import React from 'react'
import { useTranslation } from 'react-i18next'

interface ResponseChartProps {
  data: { time: string; values: Record<string, number | null> }[]
  services: { id: string; name: string; color: string }[]
  height?: number
}

const COLORS = ['var(--status-up)', 'var(--accent)', 'var(--status-slow)', '#8B5CF6', '#F472B6', '#FB923C']

const ResponseChart: React.FC<ResponseChartProps> = ({ data, services, height = 120 }) => {
  const { t } = useTranslation()
  if (data.length < 2) {
    return <div className="text-text-faint text-[12px] flex items-center justify-center" style={{ height }}>{t('responseChart.notEnough')}</div>
  }

  const allValues = data.flatMap((d) => Object.values(d.values).filter((v): v is number => v !== null))
  const maxY = Math.max(...allValues, 1)
  const minY = 0
  const range = maxY - minY || 1
  const width = 100 / (data.length - 1 || 1)

  const svcList = services.slice(0, COLORS.length)

  const buildPath = (serviceId: string) => {
    const points = data.map((d, i) => {
      const v = d.values[serviceId]
      if (v === null || v === undefined) return null
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((v - minY) / range) * 90 - 5
      return `${x},${y}`
    })
    return points.filter(Boolean).join(' ')
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[25, 50, 75].map((pct) => (
          <line key={pct} x1="0" y1={100 - pct} x2="100" y2={100 - pct}
            stroke="var(--border-subtle)" strokeWidth="0.3" strokeDasharray="2,2" />
        ))}
        {svcList.map((svc, i) => {
          const pathD = buildPath(svc.id)
          if (!pathD) return null
          return (
            <polyline key={svc.id} points={pathD}
              fill="none" stroke={svc.color}
              strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
              opacity="0.9" />
          )
        })}
      </svg>
      <div className="flex gap-4 mt-2">
        {svcList.map((svc) => (
          <div key={svc.id} className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <span className="w-2 h-0.5 rounded-full inline-block" style={{ backgroundColor: svc.color }} />
            {svc.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResponseChart
