export type CellState = 'empty' | 'filled' | 'crossed'

export interface Clues {
  colClues: number[][]
  rowClues: number[][]
}

export interface PuzzleState {
  clues: Clues
  grid: boolean[][]
  size: number
}
