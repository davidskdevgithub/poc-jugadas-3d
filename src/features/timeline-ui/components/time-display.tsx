import { usePlaybackStore } from '@/features/playback/playback-store'
import { formatTime } from '../utils'

export function TimeDisplay() {
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const duration = usePlaybackStore((s) => s.duration)

  return (
    <span className="text-xs tabular-nums text-white/70">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  )
}