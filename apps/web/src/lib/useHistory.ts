import { useCallback, useState } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

/** Small undo/redo state container used by the template editor. */
export function useHistory<T>(initial: T) {
  const [hist, setHist] = useState<HistoryState<T>>({ past: [], present: initial, future: [] })

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setHist((h) => {
      const value = typeof next === 'function' ? (next as (prev: T) => T)(h.present) : next
      if (Object.is(value, h.present)) return h
      return { past: [...h.past, h.present], present: value, future: [] }
    })
  }, [])

  // reset() clears history — used when (re)loading a saved template.
  const reset = useCallback((value: T) => {
    setHist({ past: [], present: value, future: [] })
  }, [])

  const undo = useCallback(() => {
    setHist((h) =>
      h.past.length === 0
        ? h
        : {
            past: h.past.slice(0, -1),
            present: h.past[h.past.length - 1]!,
            future: [h.present, ...h.future],
          },
    )
  }, [])

  const redo = useCallback(() => {
    setHist((h) =>
      h.future.length === 0
        ? h
        : { past: [...h.past, h.present], present: h.future[0]!, future: h.future.slice(1) },
    )
  }, [])

  return {
    state: hist.present,
    set,
    reset,
    undo,
    redo,
    canUndo: hist.past.length > 0,
    canRedo: hist.future.length > 0,
  }
}
