import React, { useState } from 'react'
import type { ServiceType } from '../../lib/types'

export interface ServiceFormData {
  name: string
  type: ServiceType
  hostname: string
  port: string
  description: string
  location: string
}

interface ServiceFormProps {
  initial?: Partial<ServiceFormData>
  onSubmit: (data: ServiceFormData) => void
  onCancel: () => void
  submitLabel?: string
}

const defaultData: ServiceFormData = { name: '', type: 'web', hostname: '', port: '', description: '', location: '' }

const typeOptions: ServiceType[] = ['web', 'database', 'docker', 'proxy', 'tunnel', 'network', 'cache']

const ServiceForm: React.FC<ServiceFormProps> = ({ initial, onSubmit, onCancel, submitLabel = 'Add Service' }) => {
  const [form, setForm] = useState<ServiceFormData>({ ...defaultData, ...initial })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: keyof ServiceFormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.type.trim()) e.type = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const inputClass = (field: string) =>
    `w-full px-3 py-2 rounded-md text-[13px] text-text-primary placeholder-text-tertiary border transition-colors focus:outline-none ${
      errors[field] ? 'border-down' : 'border-border-default focus:border-accent'
    }`
  const inputStyle = { backgroundColor: 'var(--bg-input)' }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Name</label>
        <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nginx"
          className={inputClass('name')} style={inputStyle} autoFocus />
        {errors.name && <p className="text-[11px] text-down mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Type</label>
        <select value={form.type} onChange={(e) => set('type', e.target.value)}
          className={inputClass('type')} style={inputStyle}>
          {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Hostname</label>
          <input type="text" value={form.hostname} onChange={(e) => set('hostname', e.target.value)} placeholder="optional"
            className={inputClass('hostname')} style={inputStyle} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Port</label>
          <input type="text" value={form.port} onChange={(e) => set('port', e.target.value)} placeholder="optional"
            className={inputClass('port')} style={inputStyle} />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Description</label>
        <input type="text" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="optional"
          className={inputClass('description')} style={inputStyle} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Location</label>
        <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="optional"
          className={inputClass('location')} style={inputStyle} />
      </div>
      <div className="flex justify-end gap-3 mt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-md text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-4 py-2 rounded-md text-[13px] font-medium bg-accent text-accent-text hover:opacity-90 transition-opacity">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ServiceForm
