import React from 'react'
import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: Crumb[]
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 mb-4 text-[12px]">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-text-faint">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-text-tertiary hover:text-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb
