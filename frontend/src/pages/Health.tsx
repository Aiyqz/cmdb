import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const Health = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const data = await api.get('/api/health/status')
      setServices(data)
    } catch (err) {
      console.error('Failed to fetch health status:', err)
    }
  }

  const runCheck = async () => {
    setLoading(true)
    try {
      await api.post('/api/health/check')
      await fetchStatus()
    } catch (err) {
      console.error('Failed to run health check:', err)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">健康检查</h1>
        <button
          onClick={runCheck}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600"
        >
          {loading ? '检查中...' : '手动检查'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service: any) => (
          <div key={service.id} className="bg-gray-800 rounded-lg p-4 shadow-lg">
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
            {service.healthChecks && service.healthChecks.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                <p>最后检查：{new Date(service.healthChecks[0].checkedAt).toLocaleString()}</p>
                {service.healthChecks[0].responseTime != null && (
                  <div className="flex items-center gap-2 mt-1">
                    <span>响应时间：</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      service.healthChecks[0].responseTime < 100 ? 'bg-green-900 text-green-300' :
                      service.healthChecks[0].responseTime < 1000 ? 'bg-yellow-900 text-yellow-300' :
                      'bg-orange-900 text-orange-300'
                    }`}>
                      {service.healthChecks[0].responseTime}ms
                    </span>
                  </div>
                )}
                {service.healthChecks[0].errorMessage && (
                  <p className="text-red-400 text-xs mt-1">{service.healthChecks[0].errorMessage}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Health
