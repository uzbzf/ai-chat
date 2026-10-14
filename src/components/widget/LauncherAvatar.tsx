import type { AgentProfile } from '../../types/chat'
import styles from '../../styles/widget.module.css'

type Props = {
  agent: AgentProfile
}

function MinimalOperatorIcon() {
  const stroke = 2.35
  return (
    <svg
      className={styles.launcherIcon}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="16"
        cy="13.5"
        r="5.75"
        stroke="currentColor"
        strokeWidth={stroke}
      />
      <path
        d="M8 17v3.5a2.6 2.6 0 002.6 2.6M24 17v3.5a2.6 2.6 0 01-2.6 2.6"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path
        d="M8.5 17h-1.2a8.7 8.7 0 0115.4 0H24"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path
        d="M21 21h6"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <circle cx="27.25" cy="21" r="1.75" fill="currentColor" />
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
