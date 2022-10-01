import { FunState } from '@fun-land/fun-state'
import { stylesheet } from 'typestyle'
import { button, div } from '../../../util'

const styles = stylesheet({
  rollTypes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gridGap: 10,
    margin: 10,
  },
  active: {
    background: 'var(--bg-button-selected)',
    color: 'var(--fc-button-selected)',
    borderColor: 'var(--bc-button-selected)',
  },
})

export enum RollType {
  none = 'none',
  action = 'action',
  assist = 'assist',
  fortune = 'fortune',
  quality = 'quality',
  message = 'message',
}

const actionMap = [
  [RollType.action, 'Action'],
  [RollType.assist, 'Assist'],
  [RollType.quality, 'Quality'],
  [RollType.fortune, 'Fortune'],
  [RollType.message, 'Message'],
] as const

export const RollTypes = ({ $ }: { $: FunState<RollType> }) =>
  div(
    { className: styles.rollTypes },
    actionMap.map(([type, label]) =>
      button(
        {
          key: type,
          className: $.get() === type ? styles.active : '',
          onClick: () => $.mod((t) => (t === type ? RollType.none : type)),
        },
        [label],
      ),
    ),
  )
