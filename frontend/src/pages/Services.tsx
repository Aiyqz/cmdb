import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      // 用 health/status 接口，附带最新健康检查数据（含响应时间）
      const data = await api.get('/api/health/status')
      setServices(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个服务吗？')) return
    try {
      await api.delete(`/api/services/${id}`)
      fetchServices()
    } catch (err) {
      console.error('Failed to delete service:', err)
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">服务列表</h1>
        <button
          onClick={() => {
            const name = prompt('服务名称：')
            const type = prompt('服务类型 (web/docker/proxy/tunnel)：')
            if (name && type) {
              api.post('/api/services', { name, type }).then(() => fetchServices())
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          添加服务
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service: any) => (
          <div
            key={service.id}
            className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => navigate(`/services/${service.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  service.status === 'running' ? 'bg-green-600' : 
                  service.status === 'error' ? 'bg-red-600' : 'bg-gray-600'
                }`}
              >
                {service.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{service.type}</p>
            {service.hostname && (
              <p className="text-blue-400 text-sm">{service.hostname}</p>
            )}
            {service.port && (
              <p className="text-gray-400 text-sm">Port: {service.port}</p>
            )}
            {service.healthChecks && service.healthChecks.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {service.healthChecks[0].responseTime != null && (
                  <span className={`px-2 py-0.5 rounded ${
                    service.healthChecks[0].responseTime < 100 ? 'bg-green-900 text-green-300' :
                    service.healthChecks[0].responseTime < 1000 ? 'bg-yellow-900 text-yellow-300' :
                    'bg-orange-900 text-orange-300'
                  }`}>
                    {service.healthChecks[0].responseTime}ms
                  </span>
                )}
                {service.healthChecks[0].errorMessage && (
                  <span className="text-gray-500 truncate" title={service.healthChecks[0].errorMessage}>
                    {service.healthChecks[0].errorMessage}
                  </span>
                )}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(service.id)
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Services
