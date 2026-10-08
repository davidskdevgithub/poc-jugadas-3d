import { usePlaybackStore } from '@/features/playback/playback-store'

export function PlayPauseButton() {
  const playing = usePlaybackStore((s) => s.playing)

  return (
    <button
      type="button"
      className="cursor-pointer text-white"
      onClick={() => usePlaybackStore.getState().toggle()}
    >
      <span className="material-symbols-rounded text-3xl leading-none select-none">
        {playing ? 'pause' : 'play_arrow'}
      </span>
    </button>
  )
}