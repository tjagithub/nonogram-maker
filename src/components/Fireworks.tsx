import { useMemo } from 'react'

const COLORS = ['#e94560', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d', '#c44dff', '#ff9f43']

export function Fireworks() {
  const particles = useMemo(
    () =>
      Array.from({ length: 65 }, (_, i) => ({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.4,
        duration: 0.5 + Math.random() * 0.3,
        id: i,
        size: 4 + Math.random() * 5,
        tx: (Math.random() - 0.5) * 400,
        ty: -(200 + Math.random() * 500),
        x: Math.random() * 100,
      })),
    [],
  )

  return (
    <div className="fireworks">
      {particles.map((p) => (
        <div
          className="firework-particle"
          key={p.id}
          style={
            {
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              background: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              bottom: '-10px',
              height: p.size,
              left: `${p.x}%`,
              width: p.size,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
