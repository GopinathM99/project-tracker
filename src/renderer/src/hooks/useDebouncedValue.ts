import { useState, useEffect } from 'react'

/**
 * Returns a debounced version of the given value.
 * The returned value only updates after `delay` ms of inactivity.
 * NFR-003: Prevents search from running on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
