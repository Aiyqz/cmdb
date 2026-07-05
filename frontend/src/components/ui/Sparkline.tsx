import React from 'react'

interface SparklineProps {
  data: (number | null)[]
  height?: number
}

const Sparkline: React.FC<SparklineProps> = ({ data, height = 20 }) => {
  const valid = data.filter((d): d is number => d !== null)
  if (valid.length < 2) {
    return <div style={{ height, width: '100%' }} className="text-text-faint text-[10px] flex items-center">--</div>
  }

  const max = Math.max(...valid)
  const min = 0
  const range = max - min || 1
  const barWidth = `${100 / valid.length}%`

  const getColor = (v: number) => {
    if (v < 100) return 'var(--status-up)'
    if (v < 1000) return 'var(--status-slow)'
    return 'var(--status-down)'
  }

  return (
    <div className="flex items-end gap-[1px] w-full" style={{ height }}>
      {valid.map((v, i) => (
        <div
          key={i}
          style={{
            width: barWidth,
            height: `${Math.max(((v - min) / range) * 100, 8)}%`,
            backgroundColor: getColor(v),
            borderRadius: '1px 1px 0 0',
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  )
}

export default Sparkline
