import { useEffect, useState } from 'react'
import type { AgentProfile } from '../../types/chat'
import { useLauncherEngaged } from '../../hooks/useLauncherEngaged'
import styles from '../../styles/widget.module.css'
import { LauncherAvatar } from './LauncherAvatar'

type Props = {
  agent: AgentProfile
  onClick: () => void
  hidden: boolean
  unreadCount: number
}

const PULSE_INTERVAL_MS = 5000

export function ChatLauncher({ agent, onClick, hidden, unreadCount }: Props) {
  const { engaged, markEngaged } = useLauncherEngaged()
  const [pulseGeneration, setPulseGeneration] = useState(0)
  const showPulse = !engaged && !hidden && pulseGeneration > 0

  useEffect(() => {
    if (engaged || hidden) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    setPulseGeneration((g) => g + 1)

    const intervalId = window.setInterval(() => {
      setPulseGeneration((g) => g + 1)
    }, PULSE_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [engaged, hidden])

  const handleClick = () => {
    markEngaged()
    onClick()
  }

  return (
    <div
      className={`${styles.launcherWrap} ${hidden ? styles.launcherHidden : ''}`}
    >
      {showPulse && (
        <span className={styles.launcherRipples} aria-hidden>
          <span
            key={`${pulseGeneration}-1`}
            className={styles.launcherRipple}
          />
          <span
            key={`${pulseGeneration}-2`}
            className={`${styles.launcherRipple} ${styles.launcherRippleDelay}`}
          />
        </span>
      )}
      <button
        type="button"
        className={styles.launcher}
        onClick={handleClick}
        aria-label="Открыть чат"
        aria-expanded={!hidden}
      >
        <LauncherAvatar agent={agent} />
        {unreadCount > 0 && (
          <span className={styles.badge} aria-live="polite">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
