import { useState, useEffect, useRef } from 'react'

export function useOnlineStatus(): { isOnline: boolean; wasOffline: boolean } {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const wasOfflineRef = useRef(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    function handleOnline(): void {
      setIsOnline(true)
    }

    function handleOffline(): void {
      setIsOnline(false)
      wasOfflineRef.current = true
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
