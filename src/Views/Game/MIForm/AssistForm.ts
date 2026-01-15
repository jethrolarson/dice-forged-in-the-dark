import { funState, FunState } from '@fun-land/fun-state'
import { Component, h } from '@fun-land/fun-web'
import { stylesheet } from 'typestyle'
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

const styles = stylesheet({
  AssistForm: {
    minHeight: 200,
    display: 'grid',
    gap: 12,
    margin: 12,
    $nest: {
      p: {
        margin: 0,
        fontSize: '1.17rem',
        fontStyle: 'italic',
      },
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  hidden: {
    display: 'none',
  },
})

interface AssistForm$ {
  pool: string
  tier: Tier
  note: string
  username: string
}

const rollIt =
  (roll: (rollResult: NewRoll) => unknown, uid: string, state: FunState<AssistForm$>) =>
  (diceRolled: DieResult[]): void => {
    const { note, tier, pool, username } = state.get()
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
  username: '',
})

export const AssistForm: Component<{
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active$: FunState<boolean>
}> = (signal, { uid, roll, active$ }) => {
  const $ = funState<AssistForm$>(init_AssistForm$())

  const dicePool = DicePool(signal, {
    sendRoll: rollIt(roll, uid, $),
    disableAdd$: funState(false),
  })

  const diceApi = dicePool.$api

  // Watch state to manage dice and enable/disable
  $.watch(signal, ({ username, note, pool, tier }) => {
    const shouldEnable = username && note && pool
    shouldEnable ? diceApi.enable() : diceApi.disable()

    // Manage dice based on tier (only when active)
    if (active$.get()) {
      if (tier === Tier.T0) {
        diceApi.addDie(dieColors.black, 'zero')
        diceApi.addDie(dieColors.black, 'zero2')
        diceApi.removeDie('assist')
      } else {
        diceApi.addDie(tierColor(tier), 'assist')
        diceApi.removeDie('zero')
        diceApi.removeDie('zero2')
      }
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
      Character(signal, { $: $.prop('username'), passThroughProps: { required: true } }),
      Note(signal, { $: $.prop('note'), passThroughProps: { required: true } }),
    ]),
  ])

  // Watch active state to toggle visibility
  active$.watch(signal, (active) => {
    container.className = active ? styles.AssistForm : styles.hidden
  })

  return container
}
