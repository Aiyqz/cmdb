import React from 'react'

interface FilterChipsProps {
  options: { label: string; value: string; count?: number }[]
  selected: string | null
  onChange: (value: string | null) => void
}

const FilterChips: React.FC<FilterChipsProps> = ({ options, selected, onChange }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(selected === opt.value ? null : opt.value)}
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
            selected === opt.value
              ? 'bg-accent-muted text-accent border-accent/30'
              : 'text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary'
          }`}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className={`ml-1.5 text-[11px] ${selected === opt.value ? 'text-accent/70' : 'text-text-faint'}`}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default FilterChips
