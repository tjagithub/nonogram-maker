import { useEffect, useState } from 'react'

function FlipDigit({ digit, prev }: { digit: number; prev: number }) {
  const [phase, setPhase] = useState<'idle' | 'flip-out' | 'flip-in'>('idle')

  useEffect(() => {
    if (digit === prev) return
    setPhase('flip-out')
    const t1 = setTimeout(() => setPhase('flip-in'), 120)
    const t2 = setTimeout(() => setPhase('idle'), 240)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [digit, prev])

  return (
    <div className="flip-digit">
      <div className="flip-face">
        <span className={`flip-label${phase === 'flip-out' ? ' flip-out' : ''}`}>{prev}</span>
        <span className={`flip-label flip-hidden${phase === 'flip-in' ? ' flip-in' : ''}`}>{digit}</span>
      </div>
    </div>
  )
}

export function FlipTimer({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const digits = [Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10]

  const [prevDigits, setPrevDigits] = useState(digits)

  useEffect(() => {
    if (digits.some((d, i) => d !== prevDigits[i])) {
      const t = setTimeout(() => setPrevDigits(digits), 240)
      return () => clearTimeout(t)
    }
  }, [seconds, digits, prevDigits])

  return (
    <div className="flip-timer">
      <FlipDigit digit={digits[0]} prev={prevDigits[0]} />
      <FlipDigit digit={digits[1]} prev={prevDigits[1]} />
      <span className="flip-colon">:</span>
      <FlipDigit digit={digits[2]} prev={prevDigits[2]} />
      <FlipDigit digit={digits[3]} prev={prevDigits[3]} />
    </div>
  )
}
