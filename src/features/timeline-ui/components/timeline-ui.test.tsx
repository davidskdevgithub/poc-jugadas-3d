// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TimelineUi } from './timeline-ui'
import { usePlaybackStore } from '@/features/playback/playback-store'

// Geometría mockeada: 120 px de ancho + duration 12 ⇒ 10 px = 1 s.
const RECT = {
  left: 0,
  top: 0,
  right: 120,
  bottom: 24,
  width: 120,
  height: 24,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect

// Estructura de la barra: root > [button, track, timeDisplay]; track > [fondo, fill, cursor].
function renderBar() {
  const { container } = render(<TimelineUi />)
  const root = container.firstElementChild as HTMLElement
  const track = root.children[1] as HTMLElement
  return {
    button: root.children[0] as HTMLElement,
    glyph: root.querySelector('.material-symbols-rounded') as HTMLElement,
    track,
    fill: track.children[1] as HTMLElement,
    cursor: track.children[2] as HTMLElement,
    timeDisplay: root.children[2] as HTMLElement,
  }
}

// Los handlers solo leen clientX: MouseEvent determinista en jsdom (no PointerEvent).
const down = (target: HTMLElement, clientX: number) =>
  fireEvent(target, new MouseEvent('pointerdown', { clientX, bubbles: true }))
const move = (clientX: number) =>
  fireEvent(window, new MouseEvent('pointermove', { clientX, bubbles: true }))
const up = (clientX: number) =>
  fireEvent(window, new MouseEvent('pointerup', { clientX, bubbles: true }))

beforeEach(() => {
  usePlaybackStore.setState({ currentTime: 0, playing: false, duration: 0 })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TimelineUi', () => {
  it('UC-01: botón con jugada pausada reproduce y muestra glifo pause', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 5 })
    const { glyph } = renderBar()

    fireEvent.click(screen.getByRole('button'))

    expect(usePlaybackStore.getState()).toMatchObject({ playing: true, currentTime: 5 })
    expect(glyph.textContent).toBe('pause')
  })

  it('UC-02: botón reproduciendo pausa con el instante intacto y glifo play_arrow', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })
    const { glyph } = renderBar()

    fireEvent.click(screen.getByRole('button'))

    expect(usePlaybackStore.getState()).toMatchObject({ playing: false, currentTime: 5 })
    expect(glyph.textContent).toBe('play_arrow')
  })

  it('UC-C4: botón desde el final reinicia desde 0 reproduciendo', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 12 })
    renderBar()

    fireEvent.click(screen.getByRole('button'))

    expect(usePlaybackStore.getState()).toMatchObject({ playing: true, currentTime: 0 })
  })

  it('UC-E2: sin jugada el botón es no-op y la línea renderiza vacía', () => {
    const { fill } = renderBar()

    fireEvent.click(screen.getByRole('button'))

    expect(usePlaybackStore.getState()).toMatchObject({ playing: false, currentTime: 0 })
    expect(fill.style.width).toBe('0%')
  })

  it('UC-03: pointerdown en la pista seek al instante proporcional', () => {
    usePlaybackStore.setState({ duration: 12 })
    const { track } = renderBar()

    down(track, 60)

    expect(usePlaybackStore.getState().currentTime).toBe(6)
  })

  it('UC-E1: pointerdown clampea por debajo y por encima de la pista', () => {
    usePlaybackStore.setState({ duration: 12 })
    const { track } = renderBar()

    down(track, 300)
    expect(usePlaybackStore.getState().currentTime).toBe(12)

    down(track, -50)
    expect(usePlaybackStore.getState().currentTime).toBe(0)
  })

  it('UC-C1: scrub durante reproducción pausa en presión y reanuda al soltar', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })
    const { track } = renderBar()

    down(track, 10)
    expect(usePlaybackStore.getState()).toMatchObject({ playing: false, currentTime: 1 })

    move(60)
    expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 6, playing: false })

    up(70)
    expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 7, playing: true })
  })

  it('UC-G1: scrub estando pausado deja pausado', () => {
    usePlaybackStore.setState({ duration: 12 })
    const { track } = renderBar()

    down(track, 10)
    move(60)
    up(70)

    expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 7, playing: false })
  })

  it('UC-C2: soltar al final durante reproducción queda pausado, sin reinicio', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 5, playing: true })
    const { track } = renderBar()

    down(track, 10)
    move(120)
    up(120)

    expect(usePlaybackStore.getState()).toMatchObject({ currentTime: 12, playing: false })
  })

  it('UC-06: TimeDisplay renderiza "m:ss / m:ss"', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 7 })
    const { timeDisplay } = renderBar()
    expect(timeDisplay.textContent).toBe('0:07 / 0:12')

    usePlaybackStore.setState({ currentTime: 0, duration: 0 })
    const fresh = renderBar()
    expect(fresh.timeDisplay.textContent).toBe('0:00 / 0:00')
  })

  it('UC-05: fill y cursor posicionan la fracción currentTime/duration', () => {
    usePlaybackStore.setState({ duration: 12, currentTime: 8 })
    const { fill, cursor } = renderBar()

    expect(parseFloat(fill.style.width)).toBeCloseTo(66.67)
    expect(parseFloat(cursor.style.left)).toBeCloseTo(66.67)
  })

  it('UC-G2: espacio alterna play/pausa como el botón', () => {
    usePlaybackStore.setState({ duration: 12 })
    renderBar()

    fireEvent.keyDown(window, { code: 'Space' })
    expect(usePlaybackStore.getState().playing).toBe(true)

    fireEvent.keyDown(window, { code: 'Space' })
    expect(usePlaybackStore.getState().playing).toBe(false)
  })

  it('UC-E3: espacio con auto-repeat y otras teclas no togglean; Space se previene', () => {
    usePlaybackStore.setState({ duration: 12 })
    renderBar()

    fireEvent(window, new KeyboardEvent('keydown', { code: 'Space', repeat: true }))
    expect(usePlaybackStore.getState().playing).toBe(false)

    fireEvent.keyDown(window, { code: 'KeyA' })
    expect(usePlaybackStore.getState().playing).toBe(false)

    const event = new KeyboardEvent('keydown', { code: 'Space', cancelable: true })
    fireEvent(window, event)
    expect(usePlaybackStore.getState().playing).toBe(true)
    expect(event.defaultPrevented).toBe(true)
  })
})