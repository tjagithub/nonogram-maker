import { useCallback, useRef, useState } from 'react'
import {
  GRID_OPTIONS,
  getAvailableGridSizes,
  prepareCanvas,
  renderGridOverlay,
  sampleGrid,
} from '../utils/imageProcessing'

interface ImageSelectorProps {
  onGenerate: (grid: boolean[][], imageUrl: string) => void
}

export function ImageSelector({ onGenerate }: ImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const originalUrlRef = useRef<string | null>(null)

  const [imageName, setImageName] = useState<string>('')
  const [gridSize, setGridSize] = useState(16)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState<number | null>(null)

  const updatePreview = useCallback((img: HTMLImageElement, size: number, cs: number) => {
    setPreviewUrl(renderGridOverlay(img, cs, size, 200))
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setImageName(file.name)

      const reader = new FileReader()
      reader.onload = () => {
        const url = reader.result as string
        originalUrlRef.current = url
        const img = new Image()
        img.onload = () => {
          const { canvasSize: cs } = prepareCanvas(img)
          imgRef.current = img
          setCanvasSize(cs)
          const available = getAvailableGridSizes(cs)
          const clamped = Math.min(gridSize, Math.max(...available))
          setGridSize(clamped)
          updatePreview(img, clamped, cs)
        }
        img.src = url
      }
      reader.readAsDataURL(file)
    },
    [gridSize, updatePreview],
  )

  const handleGridSizeChange = useCallback(
    (size: number) => {
      setGridSize(size)
      if (imgRef.current && canvasSize) updatePreview(imgRef.current, size, canvasSize)
    },
    [canvasSize, updatePreview],
  )

  const handleGenerate = useCallback(() => {
    const img = imgRef.current
    const origUrl = originalUrlRef.current
    if (!canvasSize || !img || !origUrl) return

    const { canvas } = prepareCanvas(img)
    const ctx = canvas.getContext('2d')!
    const result = sampleGrid(ctx, canvasSize, gridSize)
    onGenerate(result.grid, origUrl)
  }, [canvasSize, gridSize, onGenerate])

  const available = canvasSize ? getAvailableGridSizes(canvasSize) : [...GRID_OPTIONS]
  const clamped = available.includes(gridSize) ? gridSize : Math.max(...available)

  return (
    <div className="image-selector">
      <h2>Image</h2>

      <button className="select-btn" onClick={() => fileInputRef.current?.click()} type="button">
        {imageName || 'Choose Image...'}
      </button>
      <input accept="image/*" hidden onChange={handleFileChange} ref={fileInputRef} type="file" />

      {previewUrl && (
        <div className="preview-container">
          <img alt="Preview" className="preview-img" src={previewUrl} />
          <span className="preview-label">
            {gridSize}&times;{gridSize}
            {canvasSize ? ` on ${canvasSize}\u00d7${canvasSize}` : ''}
          </span>
        </div>
      )}

      <div className="control-group">
        <span className="control-group-label">Grid Size (Difficulty)</span>
        <div className="grid-size-options">
          {available.map((s) => (
            <button
              className={`grid-size-btn ${clamped === s ? 'active' : ''}`}
              key={s}
              onClick={() => handleGridSizeChange(s)}
              title={`${s}×${s} — ${s <= 8 ? 5 : s <= 16 ? 15 : 30} mistakes allowed`}
              type="button"
            >
              <span>{s}</span>
              <span className="grid-size-limit">×{s <= 8 ? 5 : s <= 16 ? 15 : 30}</span>
            </button>
          ))}
        </div>
        <div className="range-labels">
          <span>Easy</span>
          <span>Hard</span>
        </div>
      </div>

      <button className="generate-btn" disabled={!canvasSize} onClick={handleGenerate} type="button">
        Generate Puzzle
      </button>
    </div>
  )
}
