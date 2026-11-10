export interface SampleResult {
  canvasSize: number
  grid: boolean[][]
}

export const GRID_OPTIONS = [8, 16, 32] as const
export const MAX_CANVAS = 2048

export function nextPowerOf2(n: number): number {
  let p = 1
  while (p < n) p <<= 1
  return p
}

export function getAvailableGridSizes(canvasSize: number): number[] {
  return GRID_OPTIONS.filter((s) => s <= canvasSize)
}

export function prepareCanvas(img: HTMLImageElement): {
  canvas: HTMLCanvasElement
  canvasSize: number
  rect: { x: number; y: number; w: number; h: number }
} {
  const w = img.naturalWidth
  const h = img.naturalHeight
  let canvasSize = nextPowerOf2(Math.max(w, h))
  if (canvasSize > MAX_CANVAS) canvasSize = MAX_CANVAS

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, canvasSize, canvasSize)

  const scale = Math.min(canvasSize / w, canvasSize / h)
  const dw = Math.round(w * scale)
  const dh = Math.round(h * scale)
  const dx = Math.round((canvasSize - dw) / 2)
  const dy = Math.round((canvasSize - dh) / 2)

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, dx, dy, dw, dh)

  return { canvas, canvasSize, rect: { h: dh, w: dw, x: dx, y: dy } }
}

export function renderGridOverlay(
  img: HTMLImageElement,
  canvasSize: number,
  gridSize: number,
  displaySize: number,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = displaySize
  canvas.height = displaySize
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, displaySize, displaySize)

  const w = img.naturalWidth
  const h = img.naturalHeight
  const scale = Math.min(canvasSize / w, canvasSize / h)
  const dw = Math.round(w * scale * (displaySize / canvasSize))
  const dh = Math.round(h * scale * (displaySize / canvasSize))
  const dx = Math.round((displaySize - dw) / 2)
  const dy = Math.round((displaySize - dh) / 2)

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, dx, dy, dw, dh)

  const step = displaySize / gridSize
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 0.5

  for (let i = 0; i <= gridSize; i++) {
    const pos = Math.round(i * step)
    ctx.beginPath()
    ctx.moveTo(pos, 0)
    ctx.lineTo(pos, displaySize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, pos)
    ctx.lineTo(displaySize, pos)
    ctx.stroke()
  }

  return canvas.toDataURL()
}

export interface SampleOptions {
  /** Swap filled and empty relative to the automatic choice (the subject is the minority). */
  invert?: boolean
  /** Where the picture sits on the canvas. Defaults to the whole canvas. */
  rect?: { x: number; y: number; w: number; h: number }
}

const OPAQUE = 128

/** Otsu's method over a 256-bin histogram: the cut that best separates dark from light. */
function otsu(hist: Uint32Array, total: number): number {
  let sum = 0
  for (let i = 0; i < 256; i++) sum += i * hist[i]
  let wB = 0
  let sumB = 0
  let best = 0
  let bestVar = -1
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (wB === 0) continue
    const wF = total - wB
    if (wF === 0) break
    sumB += t * hist[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const v = wB * wF * (mB - mF) ** 2
    if (v > bestVar) {
      bestVar = v
      best = t
    }
  }
  return best
}

/**
 * Turn RGBA pixels into a boolean grid. Images with real transparency use the alpha
 * mask. Opaque images (photos, JPEGs) are split into ink and paper by luminance.
 */
export function sampleImageData(
  data: ArrayLike<number>,
  canvasSize: number,
  gridSize: number,
  opts: SampleOptions = {},
): boolean[][] {
  const n = canvasSize * canvasSize
  const lum = new Uint8Array(n)
  const hist = new Uint32Array(256)
  const r = opts.rect ?? { h: canvasSize, w: canvasSize, x: 0, y: 0 }
  const minX = r.x
  const minY = r.y
  const maxX = r.x + r.w - 1
  const maxY = r.y + r.h - 1

  // Transparent pixels inside the drawn area, so letterbox padding does not count.
  let seeThrough = 0
  let area = 0
  let opaque = 0
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = y * canvasSize + x
      area++
      if (data[i * 4 + 3] < OPAQUE) {
        seeThrough++
        continue
      }
      const l = Math.round(0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2])
      lum[i] = l
      hist[l]++
      opaque++
    }
  }

  const useAlpha = area > 0 && seeThrough / area > 0.02
  const ink = new Uint8Array(n)
  if (useAlpha) {
    for (let i = 0; i < n; i++) ink[i] = data[i * 4 + 3] >= OPAQUE ? 1 : 0
  } else if (opaque > 0) {
    const cut = otsu(hist, opaque)
    let dark = 0
    for (let t = 0; t <= cut; t++) dark += hist[t]
    // The smaller side is the subject; invert swaps it.
    const darkIsInk = dark <= opaque / 2 !== (opts.invert === true)
    for (let i = 0; i < n; i++) {
      if (data[i * 4 + 3] < OPAQUE) continue
      ink[i] = lum[i] <= cut === darkIsInk ? 1 : 0
    }
  }

  const block = canvasSize / gridSize
  const threshold = useAlpha ? 0.05 : 0.5
  const grid: boolean[][] = []
  for (let gy = 0; gy < gridSize; gy++) {
    const row: boolean[] = []
    const y0 = Math.round(gy * block)
    const y1 = Math.round((gy + 1) * block)
    for (let gx = 0; gx < gridSize; gx++) {
      const x0 = Math.round(gx * block)
      const x1 = Math.round((gx + 1) * block)
      let solid = 0
      let total = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          solid += ink[y * canvasSize + x]
          total++
        }
      }
      row.push(total > 0 && solid / total > threshold)
    }
    grid.push(row)
  }
  return grid
}

export function sampleGrid(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  gridSize: number,
  opts: SampleOptions = {},
): SampleResult {
  const { data } = ctx.getImageData(0, 0, canvasSize, canvasSize)
  return { canvasSize, grid: sampleImageData(data, canvasSize, gridSize, opts) }
}
