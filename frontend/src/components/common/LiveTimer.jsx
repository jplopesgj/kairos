import { useEffect, useState } from 'react'

export function LiveTimer({ startedAt }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!startedAt) { setSeconds(0); return undefined }
    const tick = () => {
      const [hours = 0, minutes = 0, secs = 0] = String(startedAt).split(':').map(Number)
      const start = new Date()
      start.setHours(hours, minutes, secs, 0)
      setSeconds(Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000)))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return <strong className="live-time">{String(Math.floor(seconds / 3600)).padStart(2, '0')}:{String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong>
}
