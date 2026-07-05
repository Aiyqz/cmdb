import React, { useState, useEffect } from 'react'
import cytoscape from 'cytoscape'
import { api } from '../lib/api'

const Topology = () => {
  const [services, setServices] = useState([])
  const [dependencies, setDependencies] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (services.length > 0) {
      renderTopology()
    }
  }, [services, dependencies])

  const fetchData = async () => {
    try {
      const [servicesData, depsData] = await Promise.all([
        api.get('/api/services'),
        api.get('/api/dependencies'),
      ])
      setServices(servicesData)
      setDependencies(depsData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  const renderTopology = () => {
    const cy = cytoscape({
      container: document.getElementById('topology'),
      elements: [
        ...services.map((s: any) => ({
          data: { id: s.id, label: s.name, type: s.type, status: s.status },
        })),
        ...dependencies.map((d: any) => ({
          data: { source: d.serviceId, target: d.dependsOnId },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#3b82f6',
            color: '#fff',
            'font-size': '12px',
            width: '120px',
            height: '40px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#6b7280',
            'target-arrow-color': '#6b7280',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'node[status="running"]',
          style: { 'background-color': '#10b981' },
        },
        {
          selector: 'node[status="error"]',
          style: { 'background-color': '#ef4444' },
        },
        {
          selector: 'node[status="stopped"]',
          style: { 'background-color': '#6b7280' },
        },
      ],
      layout: { name: 'cose' },
    })

    cy.on('tap', 'node', (evt) => {
      const serviceId = evt.target.data('id')
      window.location.href = `/services/${serviceId}`
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">服务拓扑图</h1>
      <div className="bg-gray-800 rounded-lg p-4" style={{ height: '600px' }}>
        <div id="topology" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

export default Topology
