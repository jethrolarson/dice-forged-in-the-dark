import { FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { stylesheet } from 'typestyle'

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

export const RollTypes: Component<{ $: FunState<RollType> }> = (signal, { $ }) => {
  const buttons = actionMap.map(([type, label]) => {
    const button = hx(
      'button',
      { signal, props: { type: 'button' }, on: { click: () => $.mod((t) => (t === type ? RollType.none : type)) } },
      [label],
    )
    return { button, type }
  })

  // Watch state and update button styling
  $.watch(signal, (selectedType) => {
    buttons.forEach(({ button, type }) => {
      button.className = selectedType === type ? styles.active : ''
    })
  })

  return h(
    'div',
    { className: styles.rollTypes },
    buttons.map((b) => b.button),
  )
}
