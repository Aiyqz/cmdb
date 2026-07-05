import React from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📦', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <span className="text-4xl mb-4 opacity-40">{icon}</span>
      <h3 className="text-[15px] font-medium text-text-primary mb-1">{title}</h3>
      {description && <p className="text-[13px] text-text-tertiary mb-4 max-w-xs">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-accent text-accent-text rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
