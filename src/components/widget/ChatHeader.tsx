import type { AgentProfile } from '../../types/chat'
import type { Theme } from '../../hooks/useTheme'
import styles from '../../styles/widget.module.css'
import { ChevronDownIcon, CloseIcon, MoonIcon, SunIcon } from './Icons'

type Props = {
  agent: AgentProfile
  theme: Theme
  onToggleTheme: () => void
  onMinimize: () => void
  onClose: () => void
}

export function ChatHeader({
  agent,
  theme,
  onToggleTheme,
  onMinimize,
  onClose,
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.avatar} aria-hidden>
        {agent.initials}
      </div>
      <div className={styles.headerInfo}>
        <p className={styles.headerName}>{agent.name}</p>
        <p className={styles.headerStatus}>
          <span className={styles.statusDot} />
          {agent.status === 'online' ? 'В сети' : 'Не в сети'}
          <span aria-hidden> · </span>
          <span>{agent.title}</span>
        </p>
      </div>
      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMinimize}
          aria-label="Свернуть"
        >
          <ChevronDownIcon />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <CloseIcon />
        </button>
      </div>
    </header>
  )
}
