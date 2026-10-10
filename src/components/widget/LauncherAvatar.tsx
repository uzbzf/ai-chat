import type { AgentProfile } from '../../types/chat'
import styles from '../../styles/widget.module.css'

type Props = {
  agent: AgentProfile
}

function MinimalOperatorIcon() {
  return (
    <svg
      className={styles.launcherIcon}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="16" cy="12.5" r="4.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8.5 14.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9.5 16v2.2a2.5 2.5 0 002.5 2.5h.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M22.5 16v2.2a2.5 2.5 0 01-2.5 2.5h-.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M20 19.8h5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="25.6" cy="19.8" r="1.25" fill="currentColor" />
    </svg>
  )
}

/** Минималистичный аватар оператора на кнопке виджета */
export function LauncherAvatar({ agent }: Props) {
  if (agent.launcherAvatarUrl) {
    return (
      <img
        className={styles.launcherAvatar}
        src={agent.launcherAvatarUrl}
        alt=""
        width={58}
        height={58}
        decoding="async"
        draggable={false}
      />
    )
  }

  return <MinimalOperatorIcon />
}
