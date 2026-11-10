import { expect, test } from '@playwright/test'
import { sampleImageData } from '../src/utils/imageProcessing'
import { decodeGrid, encodeGrid } from '../src/utils/shareCode'

function rgba(size: number, px: (x: number, y: number) => [number, number, number, number]) {
  const d = new Uint8ClampedArray(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) d.set(px(x, y), (y * size + x) * 4)
  }
  return d
}

const count = (g: boolean[][]) => g.flat().filter(Boolean).length

test('an opaque photo is split by brightness, not filled solid', () => {
  // Opaque white page with a dark 8x8 square: the old alpha test filled all 256 cells.
  const d = rgba(16, (x, y) => (x >= 4 && x < 12 && y >= 4 && y < 12 ? [10, 10, 10, 255] : [250, 250, 250, 255]))
  const g = sampleImageData(d, 16, 16)
  expect(count(g)).toBe(64)
  expect(g[4][4]).toBe(true)
  expect(g[0][0]).toBe(false)
})

test('the subject is the minority side, and invert swaps it', () => {
  const d = rgba(16, (x) => (x < 12 ? [10, 10, 10, 255] : [250, 250, 250, 255]))
  expect(count(sampleImageData(d, 16, 16))).toBe(64) // the light strip
  expect(count(sampleImageData(d, 16, 16, { invert: true }))).toBe(192)
})

test('a transparent cutout still uses its alpha mask', () => {
  const d = rgba(16, (x, y) => (x >= 4 && x < 12 && y >= 4 && y < 12 ? [0, 0, 0, 255] : [0, 0, 0, 0]))
  expect(count(sampleImageData(d, 16, 16))).toBe(64)
})

test('letterbox padding is never filled for an opaque image', () => {
  // Opaque 8-wide image centred in a transparent 16x16 canvas.
  const d = rgba(16, (x, y) => {
    if (x < 4 || x >= 12) return [0, 0, 0, 0]
    return y < 8 ? [0, 0, 0, 255] : [255, 255, 255, 255]
  })
  const g = sampleImageData(d, 16, 16, { rect: { h: 16, w: 8, x: 4, y: 0 } })
  expect(g[0][0]).toBe(false)
  expect(g[15][15]).toBe(false)
  expect(count(g)).toBe(8 * 8)
})

test('share codes round-trip and reject junk', () => {
  for (const size of [8, 16, 32]) {
    const grid = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => (x * 7 + y * 3) % 5 < 2))
    expect(decodeGrid(encodeGrid(grid))).toEqual(grid)
  }
  expect(encodeGrid(Array.from({ length: 32 }, () => Array(32).fill(true))).length).toBeLessThan(200)
  for (const bad of ['', 'AA', '!!!', 'CA', 'Zm9v']) expect(decodeGrid(bad)).toBeNull()
})
