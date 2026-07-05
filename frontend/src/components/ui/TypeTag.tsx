import React from 'react'
import type { ServiceType } from '../../lib/types'

const typeConfig: Record<ServiceType, { label: string; icon: string }> = {
  web: { label: 'Web', icon: '🌐' },
  database: { label: 'DB', icon: '🗄' },
  docker: { label: 'Docker', icon: '🐳' },
  proxy: { label: 'Proxy', icon: '🔀' },
  tunnel: { label: 'Tunnel', icon: '🔗' },
  network: { label: 'Network', icon: '🌍' },
  cache: { label: 'Cache', icon: '⚡' },
}

interface TypeTagProps {
  type: ServiceType
  small?: boolean
}

const TypeTag: React.FC<TypeTagProps> = ({ type, small = false }) => {
  const config = typeConfig[type] || { label: type, icon: '📦' }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono text-text-tertiary border border-border-subtle ${
        small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

export default TypeTag
