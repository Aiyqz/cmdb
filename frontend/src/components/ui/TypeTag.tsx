import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ServiceType } from '../../lib/types'

const typeConfig: Record<ServiceType, { icon: string }> = {
  web: { icon: '🌐' },
  database: { icon: '🗄' },
  docker: { icon: '🐳' },
  proxy: { icon: '🔀' },
  tunnel: { icon: '🔗' },
  network: { icon: '🌍' },
  cache: { icon: '⚡' },
}

interface TypeTagProps {
  type: ServiceType
  small?: boolean
}

const TypeTag: React.FC<TypeTagProps> = ({ type, small = false }) => {
  const { t } = useTranslation()
  const config = typeConfig[type] || { icon: '📦' }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono text-text-tertiary border border-border-subtle ${
        small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <span>{config.icon}</span>
      <span>{t(`type.${type}`)}</span>
    </span>
  )
}

export default TypeTag
