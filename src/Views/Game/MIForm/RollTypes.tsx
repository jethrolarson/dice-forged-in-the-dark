import { FunState } from '@fun-land/fun-state'
import { FC } from 'react'
import { stylesheet } from 'typestyle'

const styles = stylesheet({
  rollTypes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gridGap: 10,
    margin: 10,
  },
})

export const RollTypes: FC<{ $: FunState<RollType> }> = ({ $: s }) => (
  <div className={styles.rollTypes}>
    <button onClick={s.set.bind(null, RollType.action)}>Action</button>
    <button onClick={s.set.bind(null, RollType.assist)}>Assist</button>
    <button onClick={s.set.bind(null, RollType.quality)}>Quality</button>
    <button onClick={s.set.bind(null, RollType.fortune)}>Fortune</button>
    <button onClick={s.set.bind(null, RollType.message)}>Message</button>
  </div>
)

export enum RollType {
  none = 'none',
  action = 'action',
  assist = 'assist',
  fortune = 'fortune',
  quality = 'quality',
  message = 'message',
}
