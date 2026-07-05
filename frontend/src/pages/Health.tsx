import React, { useMemo } from 'react'
import { useHealth } from '../hooks/useHealth'
import StatCard from '../components/ui/StatCard'
import HealthTable from '../components/health/HealthTable'
import ResponseChart from '../components/health/ResponseChart'

const AUTO_OPTIONS = [
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
]

const COLORS = ['var(--status-up)', 'var(--accent)', 'var(--status-slow)', '#8B5CF6', '#F472B6', '#FB923C']

const Health: React.FC = () => {
  const {
    services,
    loading,
    checking,
    lastCheck,
    autoEnabled,
    setAutoEnabled,
    autoInterval,
    setAutoInterval,
    runCheck,
  } = useHealth()

  const runningCount = services.filter((s) => s.status === 'running').length
  const errorCount = services.filter((s) => s.status === 'error').length
  const avgResponse =
    services
      .flatMap((s) => s.healthChecks?.map((h) => h.responseTime) ?? [])
      .filter((t): t is number => t !== null)
  const avgMs = avgResponse.length ? Math.round(avgResponse.reduce((a, b) => a + b, 0) / avgResponse.length) : null
  const totalChecks = services.reduce((sum, s) => sum + (s.healthChecks?.length || 0), 0)

  // Chart data from health history
  const chartData = useMemo(() => {
    const svcList = services.slice(0, 6)
    return svcList.map((svc, i) => ({
      id: svc.id,
      name: svc.name,
      color: COLORS[i % COLORS.length],
    }))
  }, [services])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-elevated rounded w-1/4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-elevated rounded-xl" />)}
        </div>
        <div className="h-40 bg-elevated rounded-xl" />
        <div className="h-60 bg-elevated rounded-xl" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary">Health Monitor</h1>
          {lastCheck && (
            <p className="text-[13px] text-text-tertiary mt-0.5">
              Last check: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh */}
          <div className="flex items-center gap-2">
            <label className="text-[12px] text-text-secondary">Auto</label>
            <button
              onClick={() => setAutoEnabled(!autoEnabled)}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                autoEnabled ? 'bg-accent' : 'bg-border-strong'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  autoEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            {autoEnabled && (
              <select
                value={autoInterval}
                onChange={(e) => setAutoInterval(parseInt(e.target.value))}
                className="text-[12px] bg-elevated text-text-secondary border border-border-subtle rounded px-1.5 py-0.5"
              >
                {AUTO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={runCheck}
            disabled={checking}
            className="px-4 py-2 rounded-md text-[13px] font-medium bg-accent text-accent-text hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
          >
            {checking ? (
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Run Check'
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Up" value={`${runningCount}/${services.length}`}
          color={runningCount === services.length ? 'var(--status-up)' : 'var(--text-primary)'} />
        <StatCard label="Down" value={errorCount}
          color={errorCount > 0 ? 'var(--status-down)' : 'var(--text-tertiary)'} />
        <StatCard label="Avg RT" value={avgMs !== null ? `${avgMs}ms` : '--'}
          color={avgMs !== null && avgMs < 100 ? 'var(--status-up)' : 'var(--text-primary)'} />
        <StatCard label="Checks" value={totalChecks} />
      </div>

      {/* Response Chart */}
      <div className="rounded-xl p-4 mb-6 border border-border-subtle" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <h3 className="text-[13px] font-medium text-text-secondary mb-3">Response Time Trend</h3>
        <ResponseChart
          data={services.flatMap(s =>
            (s.healthChecks || []).map(h => ({
              time: h.checkedAt,
              values: { [s.id]: h.responseTime },
            }))
          ).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())}
          services={chartData}
          height={100}
        />
      </div>

      {/* Health Table */}
      <div className="rounded-xl border border-border-subtle overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="px-4 py-3 border-b border-border-subtle">
          <h3 className="text-[13px] font-medium text-text-secondary">Service Status</h3>
        </div>
        <HealthTable services={services} />
      </div>
    </div>
  )
}

export default Health
