import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { api } from '../lib/api'
import type { Service } from '../lib/types'

cytoscape.use(dagre)

const TYPE_SHAPES: Record<string, string> = {
  web: 'round-rectangle',
  database: 'cylinder',
  docker: 'hexagon',
  proxy: 'diamond',
  tunnel: 'parallelogram',
  network: 'round-rectangle',
  cache: 'round-triangle',
}

const STATUS_COLORS: Record<string, string> = {
  running: '#34D399',
  error: '#F87171',
  stopped: '#FBBF24',
  unknown: '#64748B',
}

const LAYOUTS = ['dagre', 'cose', 'circle'] as const

const Topology: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [layout, setLayout] = useState<string>('dagre')
  const [filterType, setFilterType] = useState<string>('')

  useEffect(() => {
    api.get('/api/health/status').then(setServices)
  }, [])

  const typeOptions = [...new Set(services.map((s) => s.type))]

  useEffect(() => {
    if (!containerRef.current || services.length === 0) return

    const visibleServices = filterType
      ? services.filter((s) => s.type === filterType)
      : services

    const visibleIds = new Set(visibleServices.map((s) => s.id))

    const nodes = visibleServices.map((s) => ({
      data: {
        id: s.id,
        label: s.name,
        type: s.type,
        status: s.status,
      },
    }))

    const edges = visibleServices.flatMap((s) =>
      (s.dependencies || [])
        .filter((d) => visibleIds.has(s.id) && visibleIds.has(d.dependsOnId))
        .map((d) => ({
          data: {
            id: d.id,
            source: s.id,
            target: d.dependsOnId,
            label: d.description || '',
          },
        }))
    )

    if (cyRef.current) cyRef.current.destroy()

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1A2332',
            'border-width': 2,
            'border-color': (ele: any) => STATUS_COLORS[ele.data('status')] || '#64748B',
            'color': '#E6EDF3',
            'label': 'data(label)',
            'font-size': '11px',
            'font-family': 'Inter, system-ui, sans-serif',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 100,
            'height': 40,
            'padding': 8,
            'text-wrap': 'wrap',
            'text-max-width': 90,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#3B4756',
            'target-arrow-color': '#3B4756',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            'font-size': '9px',
            'color': '#64748B',
            'label': 'data(label)',
          },
        },
      ],
      layout: { name: layout as any, nodeSep: 60, rankSep: 100 },
      autounselectify: false,
      maxZoom: 2,
      minZoom: 0.3,
    })

    cy.on('tap', 'node', (evt: any) => {
      const nodeId = evt.target.id()
      navigate(`/services/${nodeId}`)
    })

    cyRef.current = cy

    return () => { cy.destroy() }
  }, [services, layout, filterType, navigate])

  const fitAll = useCallback(() => {
    cyRef.current?.fit(undefined, 50)
  }, [])

  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Service Topology</h1>
      <p className="text-[13px] text-text-tertiary mb-5">{services.length} services</p>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label className="text-[12px] text-text-tertiary">Layout:</label>
          {LAYOUTS.map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                layout === l
                  ? 'bg-accent-muted text-accent border border-accent/30'
                  : 'text-text-tertiary border border-border-subtle hover:text-text-secondary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[12px] text-text-tertiary">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-[12px] bg-elevated text-text-secondary border border-border-subtle rounded px-2 py-1"
          >
            <option value="">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <button
          onClick={fitAll}
          className="px-2.5 py-1 rounded text-[11px] text-text-secondary border border-border-subtle hover:border-border-default hover:text-text-primary transition-colors"
        >
          Fit
        </button>
      </div>

      {/* Graph */}
      <div
        ref={containerRef}
        className="rounded-xl border border-border-subtle"
        style={{ backgroundColor: 'var(--bg-surface)', height: 500 }}
      />

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[11px] text-text-tertiary flex-wrap">
        <span className="uppercase tracking-wider">Legend:</span>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
            {status}
          </span>
        ))}
        <span className="text-text-faint ml-2">|</span>
        {Object.entries(TYPE_SHAPES).slice(0, 4).map(([type]) => (
          <span key={type} className="text-text-faint">{type}</span>
        ))}
        <span className="text-text-faint">Click node → detail</span>
      </div>
    </div>
  )
}

export default Topology
