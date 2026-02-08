import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

/**
 * Tests for hooks
 * Tests debounce, state management, effects
 */

// Simple debounce Hook for testing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

describe('Hooks', () => {
  describe('useDebounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    })

    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('hello', 500))
      expect(result.current).toBe('hello')
    })

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
        initialProps: { value: 'hello' },
      })

      expect(result.current).toBe('hello')

      // Change value
      rerender({ value: 'world' })

      // Value should still be old one immediately
      expect(result.current).toBe('hello')

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Now it should update
      expect(result.current).toBe('world')
    })

    it('should reset timer on value changes', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'a' },
      })

      rerender({ value: 'b' })
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('a')

      // Change value again before timer completes
      rerender({ value: 'c' })
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('a') // Still old value

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe('c') // Now updated
    })

    it('should handle rapid value changes', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'a' },
      })

      const values = ['b', 'c', 'd', 'e']
      values.forEach((val) => {
        rerender({ value: val })
        act(() => {
          vi.advanceTimersByTime(50)
        })
      })

      // All changes happened within debounce window
      expect(result.current).toBe('a')

      // Wait for final debounce
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current).toBe('e')
    })

    it('should work with different delay values', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'hello', delay: 1000 },
      })

      rerender({ value: 'world', delay: 1000 })

      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(result.current).toBe('hello')

      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(result.current).toBe('world')
    })
  })

  describe('useCallback patterns', () => {
    it('should memoize callback', () => {
      const callback = vi.fn()

      const { result, rerender } = renderHook(
        ({ dep }) => React.useCallback(callback, [dep]),
        {
          initialProps: { dep: 'a' },
        }
      )

      const firstCallback = result.current

      rerender({ dep: 'a' })
      expect(result.current).toBe(firstCallback)

      rerender({ dep: 'b' })
      expect(result.current).not.toBe(firstCallback)
    })
  })

  describe('useMemo patterns', () => {
    it('should memoize expensive computations', () => {
      const expensiveFn = vi.fn((value) => value * 2)

      const { result, rerender } = renderHook(
        ({ value }) => React.useMemo(() => expensiveFn(value), [value]),
        {
          initialProps: { value: 5 },
        }
      )

      expect(result.current).toBe(10)
      expect(expensiveFn).toHaveBeenCalledTimes(1)

      rerender({ value: 5 })
      expect(expensiveFn).toHaveBeenCalledTimes(1) // Not called again

      rerender({ value: 10 })
      expect(expensiveFn).toHaveBeenCalledTimes(2) // Called again with new value
      expect(result.current).toBe(20)
    })
  })
})
