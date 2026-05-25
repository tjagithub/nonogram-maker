export function generateClues(grid: boolean[][]): {
  rowClues: number[][]
  colClues: number[][]
} {
  const size = grid.length
  const rowClues: number[][] = []
  const colClues: number[][] = []

  for (let y = 0; y < size; y++) {
    const clues: number[] = []
    let run = 0
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) {
        run++
      } else {
        if (run > 0) {
          clues.push(run)
          run = 0
        }
      }
    }
    if (run > 0) clues.push(run)
    if (clues.length === 0) clues.push(0)
    rowClues.push(clues)
  }

  for (let x = 0; x < size; x++) {
    const clues: number[] = []
    let run = 0
    for (let y = 0; y < size; y++) {
      if (grid[y][x]) {
        run++
      } else {
        if (run > 0) {
          clues.push(run)
          run = 0
        }
      }
    }
    if (run > 0) clues.push(run)
    if (clues.length === 0) clues.push(0)
    colClues.push(clues)
  }

  return { colClues, rowClues }
}

export function isPuzzleComplete(solution: boolean[][], playerGrid: boolean[][]): boolean {
  for (let y = 0; y < solution.length; y++) {
    for (let x = 0; x < solution[y].length; x++) {
      if (solution[y][x] !== playerGrid[y][x]) return false
    }
  }
  return true
}
