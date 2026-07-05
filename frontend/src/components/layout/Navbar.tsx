import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Services', icon: '◉' },
  { to: '/topology', label: 'Topology', icon: '◈' },
  { to: '/health', label: 'Health', icon: '♡' },
]

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="max-w-[1400px] mx-auto px-5 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-[15px] font-semibold text-accent tracking-tight font-mono">CMDB</span>
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'text-accent bg-accent-muted'
                      : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <button
          className="sm:hidden text-text-secondary hover:text-text-primary p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div className="sm:hidden border-t border-border-subtle px-5 py-3 flex flex-col gap-1 animate-fade-in">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-[13px] font-medium ${
                  isActive ? 'text-accent bg-accent-muted' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar
