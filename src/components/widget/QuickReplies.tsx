import { mockQuickReplies } from '../../mocks/quickReplies.mock'
import styles from '../../styles/widget.module.css'

type Props = {
  visible: boolean
  onSelect: (text: string) => void
  disabled?: boolean
}

export function QuickReplies({ visible, onSelect, disabled }: Props) {
  if (!visible) return null

  return (
    <div className={styles.quickReplies}>
      {mockQuickReplies.map((text) => (
        <button
          key={text}
          type="button"
          className={styles.quickReply}
          disabled={disabled}
          onClick={() => onSelect(text)}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
