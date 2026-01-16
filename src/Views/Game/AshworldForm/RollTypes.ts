import { FunState } from '@fun-land/fun-state'

import { Component, h, hx } from '@fun-land/fun-web'
import { styles } from './RollTypes.css'

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

export const RollTypes: Component<{ $: FunState<RollType> }> = (signal, { $ }) => {
  const buttons = actionMap.map(([type, label]) => ({ button: hx(
      'button',
      {
        signal,
        props: { className: styles.tab },
        on: { click: () => $.mod((t) => (t === type ? RollType.none : type)) },
      },
      [label],
    ), type }),
  )

  // Watch state and update button styling
  $.watch(signal, (selectedType) => {
    buttons.forEach(({ button, type }) => {
      button.className = selectedType === type ? `${styles.active} ${styles.tab}` : styles.tab
    })
  })

  return h(
    'div',
    { className: styles.rollTypes },
    buttons.map((b) => b.button),
  )
}
