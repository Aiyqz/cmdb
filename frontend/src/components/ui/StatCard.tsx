import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  color?: string
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color = 'var(--text-primary)', subtitle }) => {
  return (
    <div
      className="rounded-xl px-4 py-3 border border-border-subtle"
      style={{ backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-[28px] font-medium font-mono tracking-tight" style={{ color }}>
        {value}
      </div>
      {subtitle && <div className="text-[11px] text-text-faint mt-0.5">{subtitle}</div>}
    </div>
  )
}

export default StatCard
