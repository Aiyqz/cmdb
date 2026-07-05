import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import SearchInput from '../components/ui/SearchInput'
import FilterChips from '../components/ui/FilterChips'
import StatCard from '../components/ui/StatCard'
import ServiceCard from '../components/service/ServiceCard'
import ServiceForm, { ServiceFormData } from '../components/service/ServiceForm'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import type { Service } from '../lib/types'

const PAGE_SIZE = 12

const Services: React.FC = () => {
  const { t } = useTranslation()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const { addToast } = useToast()

  const fetchServices = useCallback(async () => {
    try {
      const data = await api.get('/api/health/status')
      setServices(data)
    } catch {
      addToast('error', t('services.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchServices() }, [fetchServices])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus()
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && document.activeElement === document.body) {
        setAddOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = useMemo(() => {
    let list = services
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.hostname || '').toLowerCase().includes(q))
    }
    if (typeFilter) list = list.filter((s) => s.type === typeFilter)
    return list
  }, [services, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const runningCount = services.filter((s) => s.status === 'running').length
  const errorCount = services.filter((s) => s.status === 'error').length
  const avgResponse =
    services
      .flatMap((s) => s.healthChecks?.map((h) => h.responseTime) ?? [])
      .filter((t): t is number => t !== null)
  const avgMs = avgResponse.length ? Math.round(avgResponse.reduce((a, b) => a + b, 0) / avgResponse.length) : null

  // Type filter options
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    services.forEach((s) => { counts[s.type] = (counts[s.type] || 0) + 1 })
    return counts
  }, [services])

  const handleAdd = async (data: ServiceFormData) => {
    try {
      await api.post('/api/services', {
        name: data.name,
        type: data.type,
        hostname: data.hostname || undefined,
        port: data.port ? parseInt(data.port) : undefined,
        description: data.description || undefined,
        location: data.location || undefined,
      })
      addToast('success', t('services.addSuccess'))
      setAddOpen(false)
      fetchServices()
    } catch {
      addToast('error', t('services.addFailed'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/api/services/${deleteTarget.id}`)
      addToast('success', t('services.deleteSuccess'))
      setDeleteTarget(null)
      fetchServices()
    } catch {
      addToast('error', t('services.deleteFailed'))
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-elevated rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-elevated rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">{t('services.title')}</h1>
          <p className="text-[13px] text-text-tertiary mt-0.5">{t('services.subtitle', { count: services.length })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48 sm:w-56">
            <SearchInput value={search} onChange={setSearch} placeholder={t('services.search')} />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 rounded-md text-[13px] font-medium bg-accent text-accent-text hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <span>+</span> {t('common.add')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label={t('stats.total')} value={services.length} />
        <StatCard label={t('stats.up')} value={runningCount} color="var(--status-up)" subtitle={errorCount > 0 ? `${errorCount} ${t('stats.down')}` : undefined} />
        <StatCard label={t('stats.down')} value={errorCount} color={errorCount > 0 ? 'var(--status-down)' : 'var(--text-tertiary)'} />
        <StatCard label={t('stats.avgRt')} value={avgMs !== null ? `${avgMs}ms` : t('common.noData')} color={avgMs !== null && avgMs < 100 ? 'var(--status-up)' : 'var(--text-primary)'} />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <FilterChips
          options={[
            { label: t('common.all'), value: '__all__', count: services.length },
            ...Object.entries(typeCounts).map(([type, count]) => ({ label: t(`type.${type}`), value: type, count })),
          ]}
          selected={typeFilter}
          onChange={(v) => { setTypeFilter(v === '__all__' ? null : v); setPage(1) }}
        />
      </div>

      {/* Service Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('services.noServices')}
          description={search || typeFilter ? t('services.changeFilter') : t('services.addFirst')}
          action={!search && !typeFilter ? { label: t('services.addService'), onClick: () => setAddOpen(true) } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map((s) => (
              <ServiceCard key={s.id} service={s} onDelete={(id) => setDeleteTarget(services.find(sv => sv.id === id) || null)} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-md text-[12px] text-text-secondary border border-border-subtle hover:border-border-default disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t('common.prev')}
              </button>
              <span className="text-[12px] text-text-tertiary px-3">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-md text-[12px] text-text-secondary border border-border-subtle hover:border-border-default disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('services.addService')}>
        <ServiceForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel={t('services.addService')} />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('services.deleteTitle')}
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-md text-[13px] font-medium bg-down text-white hover:opacity-90"
            >
              {t('common.delete')}
            </button>
          </>
        }
      >
        <p className="text-[13px] text-text-secondary">
          {t('services.deleteConfirm', { name: deleteTarget?.name })}
        </p>
      </Modal>
    </div>
  )
}

export default Services
