import styles from '../../styles/widget.module.css'

export function TypingIndicator() {
  return (
    <div className={styles.messageRow} aria-label="Ассистент печатает">
      <div className={styles.messageAvatarSpacer} />
      <div className={styles.bubbleAssistant}>
        <div className={styles.typing}>
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
        </div>
      </div>
    </div>
  )
}
