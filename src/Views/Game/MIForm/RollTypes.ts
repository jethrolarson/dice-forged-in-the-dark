import { FunState } from '@fun-land/fun-state'
import { Component, h, hx } from '@fun-land/fun-web'
import { styles } from './RollTypes.css'

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
