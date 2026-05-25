import { useCallback, useEffect, useRef, useState } from 'react'
import type { CellState } from '../types'
import { CluePanel } from './CluePanel'

interface GameGridProps {
  bgUrl: string
  clues: { rowClues: number[][]; colClues: number[][] }
  completed: boolean
  fading: boolean
  onCellSet: (x: number, y: number, state: CellState) => void
  onCrossLine: (index: number, isRow: boolean) => void
  playerGrid: CellState[][]
  size: number
  solution: boolean[][]
  stepCell: { r: number; c: number } | null
  wrongCells: Set<string>
}

export function GameGrid({
  size,
  playerGrid,
  clues,
  bgUrl,
  wrongCells,
  completed,
  fading,
  stepCell,
  onCellSet,
  onCrossLine,
}: GameGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const paintTarget = useRef<CellState>('filled')
  const [cellSize, setCellSize] = useState(24)

  useEffect(() => {
    const parent = containerRef.current?.parentElement?.parentElement
    if (!parent) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      const h = entry.contentRect.height
      const maxRLen = Math.max(...clues.rowClues.map((c) => c.length), 0)
      const maxCLen = Math.max(...clues.colClues.map((c) => c.length), 0)
      const fromW = Math.floor((w - maxRLen * 16 - 30) / size)
      const fromH = Math.floor((h - maxCLen * 16 - 180) / size)
      setCellSize(Math.max(14, Math.min(fromW, fromH)))
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [size, clues.colClues, clues.rowClues])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: Event) => e.preventDefault()
    el.addEventListener('contextmenu', handler)
    return () => el.removeEventListener('contextmenu', handler)
  }, [])

  useEffect(() => {
    const up = () => {
      isDragging.current = false
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, x: number, y: number) => {
      if (e.button === 2) {
        isDragging.current = true
        paintTarget.current = 'crossed'
        onCellSet(x, y, 'crossed')
        return
      }
      if (e.button !== 0) return
      const current = playerGrid[y][x]
      paintTarget.current = current === 'filled' ? 'empty' : 'filled'
      isDragging.current = true
      onCellSet(x, y, paintTarget.current)
    },
    [playerGrid, onCellSet],
  )

  const handleCellMouseEnter = useCallback(
    (x: number, y: number) => {
      if (!isDragging.current) return
      onCellSet(x, y, paintTarget.current)
    },
    [onCellSet],
  )

  const maxRowClueLen = Math.max(...clues.rowClues.map((c) => c.length), 0)
  const clueRowWidth = maxRowClueLen * Math.max(cellSize, 22)

  return (
    <div className={`puzzle-container${completed ? ' completed' : ''}${fading ? ' fading' : ''}`} ref={containerRef}>
      <div className="puzzle-layout">
        <div style={{ width: clueRowWidth }} />
        <CluePanel
          cellSize={cellSize}
          clues={clues.colClues}
          onArrowClick={(x) => onCrossLine(x, false)}
          orientation="col"
        />
      </div>
      <div className="puzzle-layout">
        <div className="row-clues-wrap" style={{ minWidth: clueRowWidth, width: clueRowWidth }}>
          <CluePanel
            cellSize={cellSize}
            clues={clues.rowClues}
            onArrowClick={(y) => onCrossLine(y, true)}
            orientation="row"
          />
        </div>
        <div
          className="grid-container"
          ref={gridRef}
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
          }}
        >
          {playerGrid.map((row, y) =>
            row.map((cell, x) => {
              const key = `${x},${y}`
              return (
                <div
                  className={`grid-cell cell-${cell}${wrongCells.has(key) ? ' cell-wrong' : ''}${stepCell && stepCell.r === y && stepCell.c === x ? ' cell-step' : ''}`}
                  key={key}
                  onMouseDown={(e) => handleCellMouseDown(e, x, y)}
                  onMouseEnter={() => handleCellMouseEnter(x, y)}
                  role="gridcell"
                  style={{ height: cellSize, width: cellSize }}
                  tabIndex={-1}
                />
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}
