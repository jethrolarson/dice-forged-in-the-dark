import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { dieColors, DieResult } from '../../../Models/Die'
import { Character } from '../../../components/Character'
import { ComboBox } from '../../../components/ComboBox'
import { DicePool } from '../../../components/DicePool'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { approaches } from './ApproachSelect'
import { powers } from './PowerSelect'
import { Tier, tierColor, TierSelect } from './TierSelect'
import { styles } from './AssistForm.css'

interface AssistForm$ {
  pool: string
  tier: Tier
  note: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>, username$: FunState<string>) =>
  (diceRolled: DieResult[]): void => {
    const { note, tier, pool } = state.get()
    const username = username$.get()
    const isZero = diceRolled.some((d) => d.dieColor === 'black')
    roll({
      note,
      rollType: 'Action',
      lines: ['Assist', `${tier} ${pool}`],
      username,
      isZero,
      diceRolled,
      date: Date.now(),
      kind: 'Roll',
      valuationType: 'Action',
      uid,
    })
    state.set(init_AssistForm$())
  }

const init_AssistForm$ = (): AssistForm$ => ({
  note: '',
  pool: '',
  tier: Tier.T0,
})

export const AssistForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
  username$: FunState<string>
}> = (signal, { uid, roll, active$, username$ }) => {
  const $ = funState<AssistForm$>(init_AssistForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $, username$),
    disableAdd$: funState(false),
    active$,
  })

  // Watch state to manage dice and enable/disable
  $.watch(signal, ({ note, pool, tier }) => {
    const username = username$.get()
    const shouldEnable = username && note && pool
    shouldEnable ? dicePool.$api.enable() : dicePool.$api.disable()

    // Manage dice based on tier (only when active)
    if (active$.get()) {
      if (tier === Tier.T0) {
        dicePool.$api.addDie(dieColors.black, 'zero')
        dicePool.$api.addDie(dieColors.black, 'zero2')
        dicePool.$api.removeDie('assist')
      } else {
        dicePool.$api.addDie(tierColor(tier), 'assist')
        dicePool.$api.removeDie('zero')
        dicePool.$api.removeDie('zero2')
      }
    }
  })
  
  // Sync dice when scene becomes active
  active$.watch(signal, (active) => {
    if (active) {
      // Defer sync to ensure scene is created (may be async if dimensions not ready)
      requestAnimationFrame(() => {
        const { tier } = $.get()
        if (tier === Tier.T0) {
          dicePool.$api.addDie(dieColors.black, 'zero')
          dicePool.$api.addDie(dieColors.black, 'zero2')
          dicePool.$api.removeDie('assist')
        } else {
          dicePool.$api.addDie(tierColor(tier), 'assist')
          dicePool.$api.removeDie('zero')
          dicePool.$api.removeDie('zero2')
        }
      })
    }
  })

  // Create all components once
  const container = h('div', {}, [
    dicePool,
    h('div', { className: styles.form }, [
      FormHeading(signal, { title: 'Assist Roll' }),
      h('p', {}, ["Dive in to assist another player's action at the last second"]),
      h('p', {}, ['Spend and roll one die of your choice']),
      h('div', {}, [
        h('div', {}, [TierSelect(signal, { $: $.prop('tier') }), h('label', {}, ['Tier'])]),
        ComboBox(signal, {
          $: $.prop('pool'),
          name: 'pool',
          data: [...approaches, ...powers],
          placeholder: 'Approach or Power',
          required: true,
        }),
      ]),
      Character(signal, { $: username$, passThroughProps: { required: true } }),
      Note(signal, { $: $.prop('note'), passThroughProps: { required: true } }),
    ]),
  ])

  // Watch active state to toggle visibility
  active$.watch(signal, (active) => {
    container.className = active ? styles.AssistForm : styles.hidden
  })

  return container
}
