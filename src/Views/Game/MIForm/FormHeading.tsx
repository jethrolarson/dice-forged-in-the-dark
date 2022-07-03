import { chevronLeft } from 'react-icons-kit/fa/chevronLeft'
import Icon from 'react-icons-kit'
import { stylesheet } from 'typestyle'

const styles = stylesheet({
  backButton: {
    border: 0,
    padding: '4px',
    marginRight: 4,
  },
  backButtonIcon: { $nest: { svg: { margin: '-2px 2px 0 0' } } },
})

export const FormHeading = ({ back, children }: { back: () => unknown; children: string }) => (
  <h3>
    <button
      className={styles.backButton}
      onClick={(e): void => {
        e.preventDefault()
        back()
      }}>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Icon icon={chevronLeft} size={18} className={styles.backButtonIcon} />
    </button>
    {children}
  </h3>
)
