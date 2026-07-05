import React from 'react'
import { useTranslation } from 'react-i18next'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, autoFocus }) => {
  const { t } = useTranslation()
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('common.search')}
        autoFocus={autoFocus}
        className="w-full pl-9 pr-3 py-2 rounded-md text-[13px] text-text-primary placeholder-text-tertiary border border-border-default focus:border-accent focus:outline-none transition-colors font-sans"
        style={{ backgroundColor: 'var(--bg-input)' }}
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-faint bg-elevated px-1.5 py-0.5 rounded border border-border-subtle">
        ⌘K
      </kbd>
    </div>
  )
}

export default SearchInput
