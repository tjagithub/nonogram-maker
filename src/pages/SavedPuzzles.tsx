import type { Page } from './types'

interface SavedPuzzlesProps {
  navigate: (page: Page) => void
}

export function SavedPuzzles({ navigate }: SavedPuzzlesProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h2 className="text-2xl font-bold text-white/80">Saved Puzzles</h2>
      <p className="text-white/30">No saved puzzles yet.</p>
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
