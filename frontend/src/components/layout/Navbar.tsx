import React, { useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [, setSearchParams] = useSearchParams()

  const navItems = [
    { to: '/', label: t('nav.services'), icon: '◉' },
    { to: '/topology', label: t('nav.topology'), icon: '◈' },
    { to: '/health', label: t('nav.health'), icon: '♡' },
  ]

  const toggleLang = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh'
    // 写入 URL 参数（每个标签页独立，不互相影响）
    setSearchParams((prev) => {
      prev.set('lng', next)
      return prev
    })
    i18n.changeLanguage(next)
  }

  return (
    <nav className="border-b border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="max-w-[1400px] mx-auto px-5 h-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-[15px] font-semibold text-accent tracking-tight font-mono">{t('nav.title')}</span>
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
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="text-[12px] text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default rounded px-2 py-1 transition-colors"
            title={t('lang.switch')}
          >
            {t('lang.switch')}
          </button>
          <button
            className="sm:hidden text-text-secondary hover:text-text-primary p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
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
