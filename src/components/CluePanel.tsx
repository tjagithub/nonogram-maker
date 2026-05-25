interface CluePanelProps {
  cellSize: number
  clues: number[][]
  onArrowClick?: (index: number) => void
  orientation: 'row' | 'col'
}

export function CluePanel({ clues, orientation, cellSize, onArrowClick }: CluePanelProps) {
  if (orientation === 'col') {
    return (
      <div className="clue-panel-col">
        {clues.map((col, x) => (
          <div
            className="clue-col-group"
            key={`col-${x}`}
            style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'flex-end', width: cellSize }}
          >
            {col.map((val, i) => (
              <div
                className="clue-cell"
                key={`col-${x}-${i}`}
                style={{ fontSize: Math.max(10, cellSize - 4), height: cellSize, width: cellSize }}
              >
                {val}
              </div>
            ))}
            {onArrowClick && (
              <button
                className="clue-arrow clue-arrow-col"
                onClick={() => onArrowClick(x)}
                style={{ fontSize: Math.max(8, cellSize * 0.35), height: cellSize * 0.5, width: cellSize }}
                title="Toggle column X"
                type="button"
              >
                ▼
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="clue-panel-row">
      {clues.map((row, y) => (
        <div
          className="clue-row"
          key={`row-${y}`}
          style={{ alignItems: 'center', display: 'flex', height: cellSize, justifyContent: 'flex-end' }}
        >
          {row.map((val, i) => (
            <span
              className="clue-num"
              key={`row-${y}-${i}`}
              style={{
                fontSize: Math.max(10, cellSize - 4),
                lineHeight: `${cellSize}px`,
                minWidth: cellSize - 6,
                textAlign: 'center',
              }}
            >
              {val}
            </span>
          ))}
          {onArrowClick && (
            <button
              className="clue-arrow clue-arrow-row"
              onClick={() => onArrowClick(y)}
              style={{ fontSize: Math.max(8, cellSize * 0.35), height: cellSize, width: cellSize * 0.5 }}
              title="Toggle row X"
              type="button"
            >
              ▶
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
