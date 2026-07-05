import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import Breadcrumb from '../components/layout/Breadcrumb'
import StatusBadge from '../components/ui/StatusBadge'
import TypeTag from '../components/ui/TypeTag'
import Sparkline from '../components/ui/Sparkline'
import Modal from '../components/ui/Modal'
import ServiceForm, { ServiceFormData } from '../components/service/ServiceForm'
import type { Service } from '../lib/types'

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [credentialVisible, setCredentialVisible] = useState<Record<string, boolean>>({})

  const TABS: { key: string; label: string }[] = [
    { key: 'overview', label: t('detail.overview') },
    { key: 'dependencies', label: t('detail.dependencies') },
    { key: 'healthHistory', label: t('detail.healthHistory') },
    { key: 'credentials', label: t('detail.credentials') },
    { key: 'config', label: t('detail.config') },
  ]

  const fetchService = useCallback(async () => {
    try {
      const data = await api.get(`/api/services/${id}`)
      setService(data)
    } catch {
      addToast('error', t('service.loadFailed'))
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
      addToast('success', t('service.updateSuccess'))
      setEditOpen(false)
      fetchService()
    } catch {
      addToast('error', t('service.updateFailed'))
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/services/${id}`)
      addToast('success', t('service.deleteSuccess'))
      navigate('/')
    } catch {
      addToast('error', t('service.deleteFailed'))
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
        <p className="text-text-secondary">{t('service.notFound')}</p>
        <Link to="/" className="text-accent text-[13px] mt-2 inline-block">{t('service.backToServices')}</Link>
      </div>
    )
  }

  const lastCheck = service.healthChecks?.[0]
  const rt = lastCheck?.responseTime
  const sparklineData = service.healthChecks?.slice(0, 10).reverse().map(h => h.responseTime) ?? []

  return (
    <div className="animate-fade-in">
      <Breadcrumb items={[{ label: t('nav.services'), to: '/' }, { label: service.name }]} />

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
            {t('common.edit')}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium text-down border border-danger-border hover:bg-[var(--status-down-bg)] transition-colors"
          >
            {t('common.delete')}
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
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'text-accent border-accent'
                : 'text-text-tertiary border-transparent hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Basic Info */}
          <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3">{t('detail.basicInfo')}</h3>
            <div className="space-y-2.5">
              {[
                [t('detail.hostname'), service.hostname],
                [t('detail.port'), service.port],
                [t('detail.type'), t(`type.${service.type}`)],
                [t('detail.location'), service.location],
                [t('detail.lastCheck'), lastCheck ? new Date(lastCheck.checkedAt).toLocaleString() : t('common.noData')],
                [t('detail.responseTime'), rt !== null ? `${rt}ms` : t('common.noData')],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-text-tertiary text-[12px]">{label}</span>
                  <span className={`text-[12px] font-medium text-text-primary ${i === 0 || i === 5 ? 'font-mono' : ''}`}>
                    {value ?? t('common.noData')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies Summary */}
          <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3">{t('detail.dependencies')}</h3>
            {service.dependencies?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] text-text-faint uppercase tracking-wider">{t('detail.dependsOn', { count: service.dependencies.length })}</p>
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
              <p className="text-text-faint text-[12px]">{t('detail.noDependencies')}</p>
            )}
            {service.dependedBy?.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-[11px] text-text-faint uppercase tracking-wider">{t('detail.dependedBy', { count: service.dependedBy.length })}</p>
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
              <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider mb-3">{t('detail.responseTimeRecent')}</h3>
              <Sparkline data={sparklineData} height={32} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'dependencies' && (
        <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-[13px] font-medium text-text-secondary mb-4">{t('detail.dependencies')}</h3>
          {service.dependencies?.length === 0 && service.dependedBy?.length === 0 ? (
            <p className="text-text-faint text-[13px]">{t('detail.noDepsConfigured')}</p>
          ) : (
            <div className="space-y-4">
              {service.dependencies?.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-faint uppercase tracking-wider mb-2">{t('detail.dependsOnLabel')}</p>
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
                  <p className="text-[11px] text-text-faint uppercase tracking-wider mb-2">{t('detail.dependedByLabel')}</p>
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

      {activeTab === 'healthHistory' && (
        <div className="rounded-xl border border-border-subtle overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="px-4 py-3 border-b border-border-subtle">
            <h3 className="text-[13px] font-medium text-text-secondary">{t('detail.healthCheckHistory')}</h3>
          </div>
          {service.healthChecks && service.healthChecks.length > 0 ? (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-text-tertiary text-[11px] uppercase tracking-wider">
                  <th className="text-left py-2 px-4 font-medium">{t('detail.time')}</th>
                  <th className="text-left py-2 px-4 font-medium">{t('detail.status')}</th>
                  <th className="text-right py-2 px-4 font-medium">{t('detail.response')}</th>
                  <th className="text-left py-2 px-4 font-medium hidden sm:table-cell">{t('healthTable.error')}</th>
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
                        {t(`healthStatus.${h.status}`)}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-text-primary">
                      {h.responseTime !== null ? `${h.responseTime}ms` : t('common.noData')}
                    </td>
                    <td className="py-2 px-4 hidden sm:table-cell">
                      <span className="text-[11px] text-text-faint truncate max-w-[200px] block">
                        {h.errorMessage || t('common.noData')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-text-faint text-[13px] p-4">{t('detail.noHealthChecks')}</p>
          )}
        </div>
      )}

      {activeTab === 'credentials' && (
        <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-[13px] font-medium text-text-secondary mb-4">{t('detail.credentials')}</h3>
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
            <p className="text-text-faint text-[13px]">{t('detail.noCredentials')}</p>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="rounded-xl p-4 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-[13px] font-medium text-text-secondary mb-4">{t('detail.config')}</h3>
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
            <p className="text-text-faint text-[13px]">{t('detail.noConfig')}</p>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('service.editService')}>
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
          submitLabel={t('service.saveChanges')}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('service.deleteTitle')}
        footer={
          <>
            <button onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default">
              {t('common.cancel')}
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 rounded-md text-[13px] font-medium bg-down text-white hover:opacity-90">
              {t('common.delete')}
            </button>
          </>
        }
      >
        <p className="text-[13px] text-text-secondary">
          {t('service.deleteConfirm', { name: service.name })}
        </p>
      </Modal>
    </div>
  )
}

export default ServiceDetail
