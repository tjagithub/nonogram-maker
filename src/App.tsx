import { useState } from 'react'
import { Fireworks } from './components/Fireworks'
import { FlipTimer } from './components/FlipTimer'
import { GameGrid } from './components/GameGrid'
import { ImageSelector } from './components/ImageSelector'
import { useGameState } from './hooks/useGameState'
import { MainMenu } from './pages/MainMenu'
import { SavedPuzzles } from './pages/SavedPuzzles'
import { Scoreboard } from './pages/Scoreboard'
import type { Page } from './pages/types'

function App() {
  const [page, setPage] = useState<Page>('menu')
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
            className="text-white/40 hover:text-white/80 text-sm cursor-pointer bg-none border-none"
            onClick={() => setPage('menu')}
            type="button"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold tracking-tight m-0" style={{ color: 'var(--accent)' }}>
            Nonogram Maker
          </h1>
        </div>
      </header>
      <main className="app-main">
        <div className="glass-container">
          <aside className="sidebar">
            <ImageSelector onGenerate={handleGenerate} />
            {state.solution && (
              <div className="sidebar-controls">
                <FlipTimer seconds={state.elapsed} />
                <span className="attempts-display">Attempts: {state.attempts}</span>
                <div className="btn-row">
                  <button className="clear-btn" onClick={handleClear} type="button">
                    Clear
                  </button>
                  <button className="done-btn" disabled={state.completed} onClick={handleDone} type="button">
                    {state.playerGrid?.every((r) => r.every((c) => c !== 'empty')) ? 'Done' : 'Hint'}
                  </button>
                </div>
                <div className="btn-row">
                  <button className="solve-btn" disabled={state.completed} onClick={handleSolve} type="button">
                    Solve
                  </button>
                  <button className="step-btn" disabled={state.completed} onClick={handleStepSolveButton} type="button">
                    Step Solve
                  </button>
                </div>
              </div>
            )}
          </aside>
          <section className="puzzle-area">
            {!state.solution ? (
              <div className="welcome">
                <h2>Welcome to Nonogram Maker!</h2>
                <p>Select an image, adjust the difficulty, and generate a nonogram puzzle.</p>
                <div className="instructions">
                  <h3>How to play:</h3>
                  <ul>
                    <li>
                      <strong>Left-click + drag</strong> to reveal cells
                    </li>
                    <li>
                      <strong>Right-click + drag</strong> to mark cells as (X)
                    </li>
                    <li>Reveal the correct cells to see the image</li>
                    <li>Each clue tells you the length of consecutive filled cells</li>
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
