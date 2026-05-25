import type { Page } from './types'

interface MainMenuProps {
  navigate: (page: Page) => void
}

export function MainMenu({ navigate }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
          Nonogram Maker
        </h1>
        <p className="text-white/40 text-sm mt-2">Create and solve picture puzzles</p>
      </div>

      <div className="flex flex-col gap-3 w-64">
        <button
          className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white transition-all duration-200 border cursor-pointer"
          onClick={() => navigate('create')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.2)'
          }}
          style={{
            background: 'rgba(var(--accent-rgb), 0.2)',
            borderColor: 'rgba(var(--accent-rgb), 0.3)',
          }}
          type="button"
        >
          Create Puzzle
        </button>

        <button
          className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white/80 transition-all duration-200 border border-white/10 cursor-pointer hover:bg-white/5"
          onClick={() => navigate('saved')}
          type="button"
        >
          Saved Puzzles
        </button>

        <button
          className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white/80 transition-all duration-200 border border-white/10 cursor-pointer hover:bg-white/5"
          onClick={() => navigate('scoreboard')}
          type="button"
        >
          Scoreboard
        </button>

        <button
          className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white/50 transition-all duration-200 border border-white/5 cursor-pointer hover:bg-white/5"
          onClick={() => window.close()}
          type="button"
        >
          Exit
        </button>
      </div>
    </div>
  )
}
