import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const ServiceDetail = () => {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchService()
  }, [id])

  const fetchService = async () => {
    try {
      const data = await api.get(`/api/services/${id}`)
      setService(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch service:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!service) {
    return <div className="text-center py-8">服务未找到</div>
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        ← 返回列表
      </button>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-gray-400 mt-2">{service.description}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded ${
              service.status === 'running' ? 'bg-green-600' : 
              service.status === 'error' ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            {service.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">基本信息</h3>
            <div className="space-y-2">
              <p><span className="text-gray-400">类型：</span>{service.type}</p>
              {service.hostname && (
                <p><span className="text-gray-400">域名：</span>
                  <a href={`https://${service.hostname}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    {service.hostname}
                  </a>
                </p>
              )}
              {service.port && <p><span className="text-gray-400">端口：</span>{service.port}</p>}
              {service.location && <p><span className="text-gray-400">位置：</span>{service.location}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">依赖关系</h3>
            {service.dependencies && service.dependencies.length > 0 && (
              <div>
                <p className="text-gray-400 mb-2">依赖：</p>
                <ul className="space-y-1">
                  {service.dependencies.map((dep: any) => (
                    <li key={dep.id} className="text-blue-400">
                      → {dep.dependsOn.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {service.dependedBy && service.dependedBy.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 mb-2">被依赖：</p>
                <ul className="space-y-1">
                  {service.dependedBy.map((dep: any) => (
                    <li key={dep.id} className="text-yellow-400">
                      {dep.service.name} →
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {service.credentials && service.credentials.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">凭证</h3>
            <div className="space-y-2">
              {service.credentials.map((cred: any) => (
                <div key={cred.id} className="bg-gray-700 rounded p-3">
                  <p className="font-medium">{cred.key} ({cred.type})</p>
                  <p className="text-gray-400 text-sm mt-1">{cred.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {service.configs && service.configs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">配置</h3>
            <div className="space-y-2">
              {service.configs.map((config: any) => (
                <div key={config.id} className="bg-gray-700 rounded p-3">
                  <p className="font-medium">{config.key}</p>
                  <p className="text-gray-400 text-sm mt-1">{config.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceDetail
