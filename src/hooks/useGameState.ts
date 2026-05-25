import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { CellState } from '../types'
import { generateClues, isPuzzleComplete } from '../utils/clueGenerator'

export interface GameState {
  attempts: number
  bgUrl: string | null
  clues: { rowClues: number[][]; colClues: number[][] } | null
  completed: boolean
  elapsed: number
  fading: boolean
  lockedCells: boolean[][]
  lost: boolean
  mistakes: number[]
  playerGrid: CellState[][] | null
  showCelebration: boolean
  size: number
  solution: boolean[][] | null
  stepCell: { r: number; c: number } | null
  wrongCells: Set<string>
}

type Action =
  | {
      type: 'GENERATE'
      grid: boolean[][]
      clues: { rowClues: number[][]; colClues: number[][] }
      size: number
      bgUrl: string
    }
  | { type: 'SET_CELL'; grid: CellState[][] }
  | { type: 'LOCK_CELL'; x: number; y: number }
  | { type: 'ADD_MISTAKE' }
  | { type: 'LOSE' }
  | { type: 'START_FADE' }
  | { type: 'LOSE_FADE' }
  | { type: 'COMPLETE' }
  | { type: 'HIDE_CELEBRATION' }
  | { type: 'INCREMENT_ATTEMPTS' }
  | { type: 'SHOW_WRONG_CELLS'; cells: Set<string> }
  | { type: 'HIDE_WRONG_CELLS' }
  | { type: 'SET_ELAPSED'; elapsed: number }
  | { type: 'STEP_CELL'; row: number; col: number }
  | { type: 'STEP_FILL'; row: number; col: number }
  | { type: 'STEP_CLEAR' }
  | { type: 'RESET' }

function freshGrid(size: number): CellState[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty' as CellState))
}

function emptyLocked(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => false))
}

function fillAll(size: number): CellState[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'filled' as CellState))
}

const INIT: GameState = {
  attempts: 0,
  bgUrl: null,
  clues: null,
  completed: false,
  elapsed: 0,
  fading: false,
  lockedCells: [],
  lost: false,
  mistakes: [],
  playerGrid: null,
  showCelebration: false,
  size: 0,
  solution: null,
  stepCell: null,
  wrongCells: new Set(),
}

function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'GENERATE':
      return {
        ...s,
        attempts: 0,
        bgUrl: a.bgUrl,
        clues: a.clues,
        completed: false,
        elapsed: 0,
        fading: false,
        lockedCells: emptyLocked(a.size),
        lost: false,
        mistakes: [],
        playerGrid: freshGrid(a.size),
        showCelebration: false,
        size: a.size,
        solution: a.grid,
        wrongCells: new Set(),
      }
    case 'SET_CELL':
      return { ...s, playerGrid: a.grid }
    case 'LOCK_CELL': {
      const next = s.lockedCells.map((r) => [...r])
      next[a.y][a.x] = true
      return { ...s, lockedCells: next }
    }
    case 'ADD_MISTAKE':
      return { ...s, mistakes: [...s.mistakes, s.mistakes.length] }
    case 'LOSE':
      return { ...s, lost: true }
    case 'START_FADE':
      return { ...s, fading: true, showCelebration: true }
    case 'LOSE_FADE':
      return { ...s, fading: true, showCelebration: false }
    case 'COMPLETE':
      return { ...s, completed: true, fading: false, playerGrid: fillAll(s.size) }
    case 'HIDE_CELEBRATION':
      return { ...s, showCelebration: false }
    case 'INCREMENT_ATTEMPTS':
      return { ...s, attempts: s.attempts + 1 }
    case 'SHOW_WRONG_CELLS':
      return { ...s, wrongCells: a.cells }
    case 'HIDE_WRONG_CELLS':
      return { ...s, wrongCells: new Set() }
    case 'SET_ELAPSED':
      return { ...s, elapsed: a.elapsed }
    case 'STEP_CELL':
      return { ...s, stepCell: { c: a.col, r: a.row } }
    case 'STEP_FILL': {
      if (!s.playerGrid || !s.solution) return s
      if (!s.solution[a.row][a.col]) return s
      const g = s.playerGrid.map((r) => [...r])
      g[a.row][a.col] = 'filled'
      return { ...s, playerGrid: g }
    }
    case 'STEP_CLEAR':
      return { ...s, stepCell: null }
    case 'RESET':
      return { ...INIT }
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, INIT)

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = useRef(0)
  const startedRef = useRef(false)
  const cellMistakesRef = useRef<Set<string>>(new Set())

  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    if (startedRef.current) return
    stopTimer()
    startRef.current = Date.now()
    startedRef.current = true
    tickRef.current = setInterval(() => {
      dispatch({ elapsed: Math.floor((Date.now() - startRef.current) / 1000), type: 'SET_ELAPSED' })
    }, 250)
  }, [stopTimer])

  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!state.fading) return
    const t = setTimeout(() => dispatch({ type: 'COMPLETE' }), 500)
    return () => clearTimeout(t)
  }, [state.fading])

  useEffect(() => {
    if (!state.showCelebration) return
    const t = setTimeout(() => dispatch({ type: 'HIDE_CELEBRATION' }), 2000)
    return () => clearTimeout(t)
  }, [state.showCelebration])

  const handleGenerate = useCallback(
    (grid: boolean[][], bgUrl: string) => {
      stopTimer()
      if (flashRef.current) clearTimeout(flashRef.current)
      if (stepRef.current) {
        clearInterval(stepRef.current)
        stepRef.current = null
      }
      startedRef.current = false
      cellMistakesRef.current = new Set()
      dispatch({ bgUrl, clues: generateClues(grid), grid, size: grid.length, type: 'GENERATE' })
    },
    [stopTimer],
  )

  const handleCellSet = useCallback(
    (x: number, y: number, cellState: CellState) => {
      if (state.completed || state.lost || !state.solution || state.fading || stepRef.current) return
      if (state.lockedCells[y]?.[x]) return

      startTimer()
      const grid = state.playerGrid!.map((r) => [...r])
      if (grid[y][x] === cellState) return

      if (cellState === 'filled' && !state.solution[y][x]) {
        const key = `${x},${y}`
        if (!cellMistakesRef.current.has(key)) {
          cellMistakesRef.current.add(key)
          grid[y][x] = 'crossed'
          dispatch({ grid, type: 'SET_CELL' })
          dispatch({ type: 'LOCK_CELL', x, y })
          dispatch({ type: 'ADD_MISTAKE' })
          const limit = state.size <= 8 ? 5 : state.size <= 16 ? 15 : 30
          if (cellMistakesRef.current.size >= limit) dispatch({ type: 'LOSE' })
        }
        return
      }

      grid[y][x] = cellState
      dispatch({ grid, type: 'SET_CELL' })
    },
    [
      state.completed,
      state.lost,
      state.solution,
      state.fading,
      state.playerGrid,
      state.lockedCells,
      state.size,
      startTimer,
    ],
  )

  const handleDone = useCallback(() => {
    if (!state.playerGrid || !state.solution) return

    const playerBool = state.playerGrid.map((r) => r.map((c) => c === 'filled'))
    if (isPuzzleComplete(state.solution, playerBool)) {
      stopTimer()
      dispatch({ type: 'START_FADE' })
      return
    }

    const wrong = new Set<string>()
    for (let y = 0; y < state.solution.length; y++) {
      for (let x = 0; x < state.solution[y].length; x++) {
        if ((state.playerGrid[y][x] === 'filled') !== state.solution[y][x]) wrong.add(`${x},${y}`)
      }
    }
    if (flashRef.current) clearTimeout(flashRef.current)
    flashRef.current = setTimeout(() => dispatch({ type: 'HIDE_WRONG_CELLS' }), 1000)
    dispatch({ type: 'INCREMENT_ATTEMPTS' })
    dispatch({ cells: wrong, type: 'SHOW_WRONG_CELLS' })
  }, [state.playerGrid, state.solution, stopTimer])

  const handleSolve = useCallback(() => {
    stopTimer()
    dispatch({ type: 'START_FADE' })
  }, [stopTimer])

  const handleClear = useCallback(() => {
    stopTimer()
    if (flashRef.current) clearTimeout(flashRef.current)
    if (stepRef.current) {
      clearInterval(stepRef.current)
      stepRef.current = null
    }
    startedRef.current = false
    cellMistakesRef.current = new Set()
    dispatch({ type: 'RESET' })
  }, [stopTimer])

  const handleCrossLine = useCallback(
    (index: number, isRow: boolean) => {
      if (state.completed || !state.playerGrid || !state.solution || state.fading || stepRef.current) return
      const grid = state.playerGrid.map((r) => [...r])
      const sz = state.size
      let allX = true
      if (isRow) {
        for (let x = 0; x < sz; x++) {
          if (grid[index][x] === 'empty') allX = false
        }
        for (let x = 0; x < sz; x++) {
          if (allX) {
            if (grid[index][x] === 'crossed') grid[index][x] = 'empty'
          } else {
            if (grid[index][x] === 'empty') grid[index][x] = 'crossed'
          }
        }
      } else {
        for (let y = 0; y < sz; y++) {
          if (grid[y][index] === 'empty') allX = false
        }
        for (let y = 0; y < sz; y++) {
          if (allX) {
            if (grid[y][index] === 'crossed') grid[y][index] = 'empty'
          } else {
            if (grid[y][index] === 'empty') grid[y][index] = 'crossed'
          }
        }
      }
      dispatch({ grid, type: 'SET_CELL' })
    },
    [state.completed, state.playerGrid, state.solution, state.fading, state.size],
  )

  const startStepInterval = useCallback(() => {
    const sz = state.size
    const sol = state.solution
    if (!sz || !sol) return
    if (stepRef.current) return
    let idx = 0
    const total = sz * sz
    stepRef.current = setInterval(() => {
      if (idx >= total) {
        if (stepRef.current) {
          clearInterval(stepRef.current)
          stepRef.current = null
        }
        dispatch({ type: 'STEP_CLEAR' })
        dispatch({ type: 'START_FADE' })
        return
      }
      const r = Math.floor(idx / sz)
      const c = idx % sz
      dispatch({ col: c, row: r, type: 'STEP_FILL' })
      dispatch({ col: c, row: r, type: 'STEP_CELL' })
      idx++
    }, 50)
  }, [state.size, state.solution])

  const handleStepSolveButton = useCallback(() => {
    stopTimer()
    startedRef.current = false
    startStepInterval()
  }, [stopTimer, startStepInterval])

  useEffect(
    () => () => {
      if (stepRef.current) clearInterval(stepRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!state.lost) return
    stopTimer()
    const t = setTimeout(() => startStepInterval(), 500)
    return () => clearTimeout(t)
  }, [state.lost, stopTimer, startStepInterval])

  return {
    handleCellSet,
    handleClear,
    handleCrossLine,
    handleDone,
    handleGenerate,
    handleSolve,
    handleStepSolveButton,
    state,
  }
}
