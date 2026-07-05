import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
      addToast('error', 'Failed to fetch services')
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
      addToast('success', 'Service added')
      setAddOpen(false)
      fetchServices()
    } catch {
      addToast('error', 'Failed to add service')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/api/services/${deleteTarget.id}`)
      addToast('success', 'Service deleted')
      setDeleteTarget(null)
      fetchServices()
    } catch {
      addToast('error', 'Failed to delete service')
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
          <h1 className="text-[22px] font-semibold text-text-primary">Services</h1>
          <p className="text-[13px] text-text-tertiary mt-0.5">{services.length} services monitored</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48 sm:w-56">
            <SearchInput value={search} onChange={setSearch} placeholder="Search services..." />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 rounded-md text-[13px] font-medium bg-accent text-accent-text hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <span>+</span> Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={services.length} />
        <StatCard label="Up" value={runningCount} color="var(--status-up)" subtitle={errorCount > 0 ? `${errorCount} down` : undefined} />
        <StatCard label="Down" value={errorCount} color={errorCount > 0 ? 'var(--status-down)' : 'var(--text-tertiary)'} />
        <StatCard label="Avg RT" value={avgMs !== null ? `${avgMs}ms` : '--'} color={avgMs !== null && avgMs < 100 ? 'var(--status-up)' : 'var(--text-primary)'} />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <FilterChips
          options={[
            { label: 'All', value: '__all__', count: services.length },
            ...Object.entries(typeCounts).map(([type, count]) => ({ label: type, value: type, count })),
          ]}
          selected={typeFilter}
          onChange={(v) => { setTypeFilter(v === '__all__' ? null : v); setPage(1) }}
        />
      </div>

      {/* Service Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No services found"
          description={search || typeFilter ? 'Try changing your search or filter' : 'Add your first service to get started'}
          action={!search && !typeFilter ? { label: 'Add Service', onClick: () => setAddOpen(true) } : undefined}
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
                Prev
              </button>
              <span className="text-[12px] text-text-tertiary px-3">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-md text-[12px] text-text-secondary border border-border-subtle hover:border-border-default disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Service">
        <ServiceForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Service"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-md text-[13px] font-medium bg-down text-white hover:opacity-90"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[13px] text-text-secondary">
          Are you sure you want to delete <span className="text-text-primary font-medium">{deleteTarget?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

export default Services
