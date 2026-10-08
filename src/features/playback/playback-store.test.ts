import { beforeEach, describe, expect, it } from 'vitest'
import { usePlaybackStore } from './playback-store'

// El store es singleton del módulo; zustand hace merge shallow del partial.
beforeEach(() => {
  usePlaybackStore.setState({ currentTime: 0, playing: false, duration: 0 })
})

describe('playback store', () => {
  describe('play', () => {
    it('sin jugada cargada (duration 0) es no-op (UC-E4)', () => {
      usePlaybackStore.getState().play()

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 0, playing: false })
    })

    it('con jugada cargada arranca desde el instante actual (UC-01)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 3 })

      usePlaybackStore.getState().play()

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 3, playing: true })
    })

    it('repetido mientras reproduce no reinicia el tiempo (UC-E5)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })

      usePlaybackStore.getState().play()

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 5, playing: true })
    })

    it('desde el final reinicia desde 0 reproduciendo (UC-G2)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 12, playing: false })

      usePlaybackStore.getState().play()

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 0, playing: true })
    })
  })

  describe('pause', () => {
    it('pausa conservando el instante (UC-02)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })

      usePlaybackStore.getState().pause()

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 5, playing: false })
    })
  })

  describe('toggle', () => {
    it('pausado con jugada cargada pasa a reproducir (UC-G3)', () => {
      usePlaybackStore.setState({ duration: 12 })

      usePlaybackStore.getState().toggle()

      expect(usePlaybackStore.getState().playing).toBe(true)
    })

    it('reproduciendo pasa a pausa con el instante intacto (UC-G3)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })

      usePlaybackStore.getState().toggle()

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 5, playing: false })
    })
  })

  describe('seek', () => {
    beforeEach(() => {
      usePlaybackStore.setState({ duration: 12 })
    })

    it('clampa negativos a 0 (UC-E1)', () => {
      usePlaybackStore.getState().seek(-3)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 0, playing: false })
    })

    it('clampa por encima de duration a duration, sin overshoot (UC-E2)', () => {
      usePlaybackStore.getState().seek(100)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 12, playing: false })
    })

    it('mientras reproduce conserva playing (UC-04)', () => {
      usePlaybackStore.setState({ playing: true })

      usePlaybackStore.getState().seek(8)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 8, playing: true })
    })

    it('al instante exacto del final mientras reproduce corta la reproducción (UC-E3)', () => {
      usePlaybackStore.setState({ playing: true })

      usePlaybackStore.getState().seek(12)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 12, playing: false })
    })

    it('pausado conserva pausa', () => {
      usePlaybackStore.getState().seek(5)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 5, playing: false })
    })
  })

  describe('advance', () => {
    it('pausado es no-op (guard)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 5 })

      usePlaybackStore.getState().advance(0.1)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 5, playing: false })
    })

    it('sin jugada cargada es no-op (guard)', () => {
      usePlaybackStore.setState({ playing: true })

      usePlaybackStore.getState().advance(0.1)

      expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 0, playing: true })
    })

    it('cruzando duration queda exacto en duration y pausa (UC-G1)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 11.95, playing: true })

      usePlaybackStore.getState().advance(0.1)

      expect(usePlaybackStore.getState().currentTime).toBe(12)
      expect(usePlaybackStore.getState().playing).toBe(false)
    })

    it('clampa deltas enormes (vuelta de background) y sigue reproduciendo (UC-G4)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })

      usePlaybackStore.getState().advance(30)

      expect(usePlaybackStore.getState().currentTime).toBeCloseTo(5.1)
      expect(usePlaybackStore.getState().playing).toBe(true)
    })

    it('delta de frame normal avanza 1x (UC-01)', () => {
      usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })

      usePlaybackStore.getState().advance(0.016)

      expect(usePlaybackStore.getState().currentTime).toBeCloseTo(5.016)
      expect(usePlaybackStore.getState().playing).toBe(true)
    })
  })

  describe('setDuration', () => {
    it('fija la duración de la jugada (UC-05)', () => {
      usePlaybackStore.getState().setDuration(12)

      expect(usePlaybackStore.getState().duration).toBe(12)
    })

    it('segunda llamada con el mismo valor deja el estado idéntico (doble montaje de StrictMode)', () => {
      usePlaybackStore.getState().setDuration(12)
      const before = usePlaybackStore.getState()
      usePlaybackStore.getState().setDuration(12)

      expect(usePlaybackStore.getState()).toEqual(before)
    })
  })
})