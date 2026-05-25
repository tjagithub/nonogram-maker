import type { Page } from './types'

interface ScoreboardProps {
  navigate: (page: Page) => void
}

export function Scoreboard({ navigate }: ScoreboardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h2 className="text-2xl font-bold text-white/80">Scoreboard</h2>
      <p className="text-white/30">No scores recorded yet.</p>
      <button
        className="text-white/50 hover:text-white/80 cursor-pointer underline underline-offset-2"
        onClick={() => navigate('menu')}
        type="button"
      >
        Back to Menu
      </button>
    </div>
  )
}
