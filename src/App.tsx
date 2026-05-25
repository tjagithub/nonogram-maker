import { useState } from 'react'
import { Fireworks } from './components/Fireworks'
import { FlipTimer } from './components/FlipTimer'
import { GameGrid } from './components/GameGrid'
import { ImageSelector } from './components/ImageSelector'
import { useGameState } from './hooks/useGameState'
import { MainMenu } from './pages/MainMenu'
import { SavedPuzzles } from './pages/SavedPuzzles'
import { Scoreboard } from './pages/Scoreboard'
import { Button } from './components/ui/button'
import type { Page } from './pages/types'

function App() {
  const [page, setPage] = useState<Page>('menu')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const {
    state,
    handleGenerate,
    handleCellSet,
    handleDone,
    handleSolve,
    handleClear,
    handleStepSolveButton,
    handleCrossLine,
  } = useGameState()

  const mistakes = state.mistakes
  const bigX = Math.floor(mistakes.length / 5)
  const smallX = mistakes.length % 5

  if (page === 'menu') return <MainMenu navigate={setPage} />
  if (page === 'saved') return <SavedPuzzles navigate={setPage} />
  if (page === 'scoreboard') return <Scoreboard navigate={setPage} />

  return (
    <div className={`app theme-crimson`}>
      <header className="app-header">
        <div className="flex items-center gap-3">
          <button
            className="text-white/40 hover:text-white/80 text-sm cursor-pointer bg-none border-none p-1"
            onClick={() => setSidebarOpen((o) => !o)}
            type="button"
            title="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
          <button
            className="text-white/40 hover:text-white/80 text-sm cursor-pointer bg-none border-none"
            onClick={() => setPage('menu')}
            type="button"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold tracking-tight m-0" style={{ color: 'var(--accent)' }}>
            Nonogram Maker
          </h1>
          <div className="flex-1" />
        </div>
      </header>
      <main className="app-main">
        <div className="glass-container">
          <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
            <div className="sidebar-inner">
              <ImageSelector onGenerate={handleGenerate} />
              {state.solution && (
                <div className="sidebar-controls">
                  <FlipTimer seconds={state.elapsed} />
                  <span className="attempts-display">Attempts: {state.attempts}</span>
                  <div className="btn-row">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>Clear</Button>
                    {state.playerGrid?.every((r) => r.every((c) => c !== 'empty'))
                      ? <Button variant="default" size="sm" className="flex-1" disabled>Done</Button>
                      : <Button variant="default" size="sm" className="flex-1" onClick={handleDone}
                          style={{ background: 'rgba(var(--accent-rgb), 0.25)', borderColor: 'rgba(var(--accent-rgb), 0.4)' }}>
                          Hint
                        </Button>
                    }
                  </div>
                  <div className="btn-row">
                    <Button variant="secondary" size="sm" className="flex-1"
                      onClick={handleSolve} disabled={state.completed}
                      style={!state.completed ? { background: 'rgba(46,125,50,0.25)', borderColor: 'rgba(46,125,50,0.4)' } : undefined}>
                      Solve
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1"
                      onClick={handleStepSolveButton} disabled={state.completed}
                      style={!state.completed ? { background: 'rgba(21,101,192,0.25)', borderColor: 'rgba(21,101,192,0.4)' } : undefined}>
                      Step Solve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>
          <section className="puzzle-area">
            {!state.solution ? (
              <div className="welcome">
                <h2>Welcome to Nonogram Maker!</h2>
                <p>Select an image, adjust the difficulty, and generate a nonogram puzzle.</p>
                <div className="instructions">
                  <h3>How to play:</h3>
                  <ul>
                    <li><strong>Left-click + drag</strong> to reveal cells</li>
                    <li><strong>Right-click + drag</strong> to mark cells as X</li>
                    <li>Click the <strong>▲ / ▶</strong> arrows on clue edges to X an entire row/column</li>
                    <li><strong>Hint</strong> checks your progress and flashes wrong cells</li>
                    <li><strong>Solve</strong> reveals the full image instantly</li>
                    <li><strong>Step Solve</strong> animates through the solution cell by cell</li>
                    <li>Each mistake costs a life — too many and you lose!</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="puzzle-row">
                  {mistakes.length > 0 && (
                    <div className="mistake-bar">
                      {Array.from({ length: bigX }, (_, i) => (
                        <div className="mistake-big-x" key={`big-x-${i}`} />
                      ))}
                      {smallX > 0 && (
                        <div className="mistake-grid">
                          {Array.from({ length: 4 }, (_, i) => (
                            <div className={`mistake-small-x${i < smallX ? '' : ' hidden'}`} key={`small-x-${i}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <GameGrid
                    bgUrl={state.bgUrl!}
                    clues={state.clues!}
                    completed={state.completed}
                    fading={state.fading}
                    onCellSet={handleCellSet}
                    onCrossLine={handleCrossLine}
                    playerGrid={state.playerGrid!}
                    size={state.size}
                    solution={state.solution}
                    stepCell={state.stepCell}
                    wrongCells={state.wrongCells}
                  />
                </div>
                {state.completed && (
                  <div className={`completion-banner${state.lost ? ' lost' : ''}`}>
                    {state.lost ? 'Game Over!' : 'Puzzle Complete!'} {Math.floor(state.elapsed / 60)}:
                    {String(state.elapsed % 60).padStart(2, '0')}
                    {state.attempts > 0 && ` (${state.attempts} ${state.attempts === 1 ? 'attempt' : 'attempts'})`}
                  </div>
                )}
                {state.showCelebration && <Fireworks />}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
