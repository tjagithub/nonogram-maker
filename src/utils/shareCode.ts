/** Largest grid a share code may describe. */
const MAX_SIZE = 64

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null
  try {
    const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
    return Uint8Array.from(bin, (c) => c.charCodeAt(0))
  } catch {
    return null
  }
}

/** One byte for the size, then the cells row by row, packed 8 to a byte. */
export function encodeGrid(grid: boolean[][]): string {
  const size = grid.length
  const bytes = new Uint8Array(1 + Math.ceil((size * size) / 8))
  bytes[0] = size
  for (let i = 0; i < size * size; i++) {
    if (grid[Math.floor(i / size)][i % size]) bytes[1 + (i >> 3)] |= 1 << (i & 7)
  }
  return toBase64Url(bytes)
}

/** Returns null for anything that is not a well-formed code. */
export function decodeGrid(code: string): boolean[][] | null {
  const bytes = fromBase64Url(code)
  if (!bytes || bytes.length < 2) return null
  const size = bytes[0]
  if (size < 2 || size > MAX_SIZE) return null
  if (bytes.length !== 1 + Math.ceil((size * size) / 8)) return null
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const i = y * size + x
      return (bytes[1 + (i >> 3)] & (1 << (i & 7))) !== 0
    }),
  )
}

export const SHARE_PARAM = 'nonogram'

export function shareUrl(grid: boolean[][], base: string = location.href): string {
  const url = new URL(base)
  url.search = ''
  url.hash = ''
  url.searchParams.set(SHARE_PARAM, encodeGrid(grid))
  return url.toString()
}

/** Pixel-art stand-in for the picture, drawn from the grid alone. */
export function gridToDataUrl(grid: boolean[][], color = '#e53935', cell = 16): string {
  const size = grid.length
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size * cell
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) if (grid[y][x]) ctx.fillRect(x * cell, y * cell, cell, cell)
  }
  return canvas.toDataURL()
}
