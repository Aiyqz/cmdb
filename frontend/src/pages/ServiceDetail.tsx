import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import Breadcrumb from '../components/layout/Breadcrumb'
import StatusBadge from '../components/ui/StatusBadge'
import TypeTag from '../components/ui/TypeTag'
import Sparkline from '../components/ui/Sparkline'
import Modal from '../components/ui/Modal'
import ServiceForm, { ServiceFormData } from '../components/service/ServiceForm'
import type { Service } from '../lib/types'

const TABS = ['Overview', 'Dependencies', 'Health History', 'Credentials', 'Config']

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [credentialVisible, setCredentialVisible] = useState<Record<string, boolean>>({})

  const fetchService = useCallback(async () => {
    try {
      const data = await api.get(`/api/services/${id}`)
      setService(data)
    } catch {
      addToast('error', 'Failed to load service')
    } finally {
      setLoading(false)
    }
  }, [id, addToast])

  useEffect(() => { fetchService() }, [fetchService])

  const handleEdit = async (data: ServiceFormData) => {
    try {
      await api.put(`/api/services/${id}`, {
        name: data.name,
        type: data.type,
        hostname: data.hostname || undefined,
        port: data.port ? parseInt(data.port) : undefined,
        description: data.description || undefined,
        location: data.location || undefined,
      })
      addToast('success', 'Service updated')
      setEditOpen(false)
      fetchService()
    } catch {
      addToast('error', 'Failed to update service')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/services/${id}`)
      addToast('success', 'Service deleted')
      navigate('/')
    } catch {
      addToast('error', 'Failed to delete service')
    }
  }

  const toggleCredential = (credId: string) => {
    setCredentialVisible((prev) => ({ ...prev, [credId]: !prev[credId] }))
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-elevated rounded w-1/3" />
        <div className="h-8 bg-elevated rounded w-1/2" />
        <div className="h-48 bg-elevated rounded-xl" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Service not found</p>
        <Link to="/" className="text-accent text-[13px] mt-2 inline-block">Back to Services</Link>
      </div>
    )
  }

  const lastCheck = service.healthChecks?.[0]
  const rt = lastCheck?.responseTime
  const sparklineData = service.healthChecks?.slice(0, 10).reverse().map(h => h.responseTime) ?? []

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: 'Services', to: '/' }, { label: service.name }]} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-text-primary">{service.name}</h1>
          <StatusBadge status={service.status} />
          <TypeTag type={service.type} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium text-text-secondary border border-border-subtle hover:border-border-default hover:text-text-primary transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium text-down border border-danger-border hover:bg-[var(--status-down-bg)] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      {service.description && (
        <p className="text-[13px] text-text-secondary mb-5 -mt-3">{service.description}</p>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-5 border-b border-border-subtle">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'text-accent border-accent'
                : 'text-text-tertiary border-transparent hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Basic Info */}
          <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3">Basic Info</h3>
            <div className="space-y-2.5">
              {[
                ['Hostname', service.hostname],
                ['Port', service.port],
                ['Type', service.type],
                ['Location', service.location],
                ['Last Check', lastCheck ? new Date(lastCheck.checkedAt).toLocaleString() : '--'],
                ['Response Time', rt !== null ? `${rt}ms` : '--'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-text-tertiary text-[12px]">{label}</span>
                  <span className={`text-[12px] font-medium text-text-primary ${label === 'Hostname' || label === 'Response Time' ? 'font-mono' : ''}`}>
                    {value ?? '--'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies Summary */}
          <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3">Dependencies</h3>
            {service.dependencies?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] text-text-faint uppercase tracking-wider">Depends on ({service.dependencies.length})</p>
                {service.dependencies.map((dep) => (
                  <Link
                    key={dep.id}
                    to={`/services/${dep.dependsOnId}`}
                    className="flex items-center gap-2 text-[13px] text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>→</span>
                    <span className="font-mono text-text-primary">{dep.dependsOn?.name || dep.dependsOnId}</span>
                    {dep.dependsOn && <TypeTag type={dep.dependsOn.type} small />}
                    {dep.description && <span className="text-text-faint text-[11px]">- {dep.description}</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-faint text-[12px]">No dependencies</p>
            )}
            {service.dependedBy?.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-[11px] text-text-faint uppercase tracking-wider">Depended by ({service.dependedBy.length})</p>
                {service.dependedBy.map((dep) => (
                  <Link
                    key={dep.id}
                    to={`/services/${dep.serviceId}`}
                    className="flex items-center gap-2 text-[13px] text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>←</span>
                    <span className="font-mono text-text-primary">{dep.service?.name || dep.serviceId}</span>
                    {dep.service && <TypeTag type={dep.service.type} small />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Response Sparkline */}
          {sparklineData.length > 0 && (
            <div className="rounded-xl p-4 border border-border-subtle md:col-span-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3">Response Time (recent)</h3>
              <Sparkline data={sparklineData} height={32} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'Dependencies' && (
        <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-[13px] font-medium text-text-secondary mb-4">Dependencies</h3>
          {service.dependencies?.length === 0 && service.dependedBy?.length === 0 ? (
            <p className="text-text-faint text-[13px]">No dependencies configured</p>
          ) : (
            <div className="space-y-4">
              {service.dependencies?.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-faint uppercase tracking-wider mb-2">Depends on</p>
                  <div className="space-y-1">
                    {service.dependencies.map((dep) => (
                      <Link key={dep.id} to={`/services/${dep.dependsOnId}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-elevated text-[13px] transition-colors">
                        <span className="text-accent">→</span>
                        <span className="font-mono text-text-primary">{dep.dependsOn?.name || dep.dependsOnId}</span>
                        {dep.dependsOn && <StatusBadge status={dep.dependsOn.status} />}
                        {dep.description && <span className="text-text-faint text-[12px] ml-2">{dep.description}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {service.dependedBy?.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-faint uppercase tracking-wider mb-2">Depended by</p>
                  <div className="space-y-1">
                    {service.dependedBy.map((dep) => (
                      <Link key={dep.id} to={`/services/${dep.serviceId}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-elevated text-[13px] transition-colors">
                        <span className="text-accent">←</span>
                        <span className="font-mono text-text-primary">{dep.service?.name || dep.serviceId}</span>
                        {dep.service && <StatusBadge status={dep.service.status} />}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Health History' && (
        <div className="rounded-xl border border-border-subtle overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="px-4 py-3 border-b border-border-subtle">
            <h3 className="text-[13px] font-medium text-text-secondary">Health Check History</h3>
          </div>
          {service.healthChecks && service.healthChecks.length > 0 ? (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-text-tertiary text-[11px] uppercase tracking-wider">
                  <th className="text-left py-2 px-4 font-medium">Time</th>
                  <th className="text-left py-2 px-4 font-medium">Status</th>
                  <th className="text-right py-2 px-4 font-medium">Response</th>
                  <th className="text-left py-2 px-4 font-medium hidden sm:table-cell">Error</th>
                </tr>
              </thead>
              <tbody>
                {service.healthChecks.slice(0, 20).map((h) => (
                  <tr key={h.id} className="border-b border-border-subtle hover:bg-elevated/50">
                    <td className="py-2 px-4 text-text-tertiary font-mono text-[12px]">
                      {new Date(h.checkedAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <span className="text-[12px]" style={{
                        color: h.status === 'up' ? 'var(--status-up)' : h.status === 'timeout' ? 'var(--status-slow)' : 'var(--status-down)'
                      }}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-text-primary">
                      {h.responseTime !== null ? `${h.responseTime}ms` : '--'}
                    </td>
                    <td className="py-2 px-4 hidden sm:table-cell">
                      <span className="text-[11px] text-text-faint truncate max-w-[200px] block">
                        {h.errorMessage || '--'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-text-faint text-[13px] p-4">No health checks recorded</p>
          )}
        </div>
      )}

      {activeTab === 'Credentials' && (
        <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-[13px] font-medium text-text-secondary mb-4">Credentials</h3>
          {service.credentials?.length > 0 ? (
            <div className="space-y-3">
              {service.credentials.map((cred) => (
                <div key={cred.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-elevated">
                  <div>
                    <span className="text-[12px] text-text-primary font-mono">{cred.username}</span>
                    {cred.keyType && <span className="text-[11px] text-text-tertiary ml-2">({cred.keyType})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono text-text-tertiary">
                      {credentialVisible[cred.id] ? cred.passwordHash : '••••••••'}
                    </span>
                    <button
                      onClick={() => toggleCredential(cred.id)}
                      className="text-text-faint hover:text-text-secondary text-[11px]"
                    >
                      {credentialVisible[cred.id] ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-faint text-[13px]">No credentials configured</p>
          )}
        </div>
      )}

      {activeTab === 'Config' && (
        <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-[13px] font-medium text-text-secondary mb-4">Config</h3>
          {service.configs?.length > 0 ? (
            <div className="space-y-2">
              {service.configs.map((cfg) => (
                <div key={cfg.id} className="flex justify-between py-2 px-3 rounded-md bg-elevated text-[12px]">
                  <span className="text-text-primary font-mono">{cfg.key}</span>
                  <span className="text-text-secondary font-mono max-w-[60%] truncate">{cfg.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-faint text-[13px]">No config entries</p>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Service">
        <ServiceForm
          initial={{
            name: service.name,
            type: service.type,
            hostname: service.hostname || '',
            port: service.port?.toString() || '',
            description: service.description || '',
            location: service.location || '',
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Service"
        footer={
          <>
            <button onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default">
              Cancel
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 rounded-md text-[13px] font-medium bg-down text-white hover:opacity-90">
              Delete
            </button>
          </>
        }
      >
        <p className="text-[13px] text-text-secondary">
          Are you sure you want to delete <span className="text-text-primary font-medium">{service.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

export default ServiceDetail
