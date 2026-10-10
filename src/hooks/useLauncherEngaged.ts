import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-chat-launcher-used'

function readEngaged(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useLauncherEngaged() {
  const [engaged, setEngaged] = useState(readEngaged)

  const markEngaged = useCallback(() => {
    if (engaged) return
    setEngaged(true)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [engaged])

  return { engaged, markEngaged }
}
