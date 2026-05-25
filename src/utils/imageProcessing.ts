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

export function prepareCanvas(img: HTMLImageElement): { canvas: HTMLCanvasElement; canvasSize: number } {
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

  return { canvas, canvasSize }
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

export function sampleGrid(ctx: CanvasRenderingContext2D, canvasSize: number, gridSize: number): SampleResult {
  const data = ctx.getImageData(0, 0, canvasSize, canvasSize).data
  const blockSize = canvasSize / gridSize

  const grid: boolean[][] = []

  for (let y = 0; y < gridSize; y++) {
    const row: boolean[] = []
    const yStart = Math.round(y * blockSize)

    for (let x = 0; x < gridSize; x++) {
      const xStart = Math.round(x * blockSize)
      const xEnd = Math.round((x + 1) * blockSize)
      const yEnd = Math.round((y + 1) * blockSize)

      let solid = 0
      let total = 0

      for (let py = yStart; py < yEnd; py++) {
        for (let px = xStart; px < xEnd; px++) {
          const idx = (py * canvasSize + px) * 4
          if (data[idx + 3] > 0) solid++
          total++
        }
      }

      row.push(solid / total > 0.05)
    }
    grid.push(row)
  }

  return { canvasSize, grid }
}
