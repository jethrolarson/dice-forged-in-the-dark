import { FunState } from '@fun-land/fun-state'
import { classes, stylesheet } from 'typestyle'
import { Component, h } from '@fun-land/fun-web'

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
    borderBottomColor: 'var(--bc-button) !important',
  },
  tab: {
    borderWidth: '0 0 2px',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    color: 'var(--fc)',
    fontWeight: 'bold',
  },
})

export enum RollType {
  none = 'none',
  action = 'action',
  resist = 'resist',
  message = 'message',
  fortune = 'fortune',
}

const actionMap = [
  [RollType.action, 'Action'],
  [RollType.resist, 'Resist'],
  [RollType.fortune, 'Fortune'],
  [RollType.message, 'Message'],
] as const

export const RollTypes: Component<{ $: FunState<RollType> }> = (signal, { $ }) =>
  h(
    'div',
    { className: styles.rollTypes },
    actionMap.map(([type, label]) =>
      h(
        'button',
        {
          className: classes($.get() === type ? styles.active : '', styles.tab),
          onClick: () => $.set(type),
        },
        [label],
      ),
    ),
  )
