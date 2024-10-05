import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'

import { stylesheet } from 'typestyle'
import { dieColors, DieResult } from '../../../Models/Die'
import { Note } from '../../../components/Note'
import { NewRoll } from '../RollForm/FormCommon'
import { DicePool, DicePoolState } from '../../../components/DicePool'
import { Character } from '../../../components/Character'
import { Tier, tierColor, TierSelect } from './TierSelect'
import { FormHeading } from '../../../components/FormHeading'
import { useEffect, useRef } from 'react'
import { e, h, div } from '../../../util'
import { ComboBox } from '../../../components/ComboBox'
import { approaches } from './ApproachSelect'
import { powers } from './PowerSelect'
import { DiceSceneRef } from '../../../components/DiceScene/DiceScene'

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
})

interface AssistForm$ {
  pool: string
  tier: Tier
  dicePool: DicePoolState
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
  dicePool: { pool: [] },
  note: '',
  pool: '',
  tier: Tier.T0,
  username: '',
})

export const AssistForm = ({
  uid,
  roll,
  active,
}: {
  uid: string
  roll: (rollResult: NewRoll) => unknown
  active: boolean
}) => {
  const $ = useFunState<AssistForm$>(init_AssistForm$())
  const { tier, pool, username, note } = $.get()
  const disabled = !username || !note || !pool
  const dicePool$ = $.prop('dicePool')
  const diceSceneRef = useRef<DiceSceneRef | null>(null)
  useEffect(() => {
    username && note ? diceSceneRef.current?.enable() : diceSceneRef.current?.disable()
  }, [username, note])
  useEffect(() => {
    if (tier === Tier.T0) {
      diceSceneRef.current?.addDie(dieColors.black, 'zero')
      diceSceneRef.current?.addDie(dieColors.black, 'zero2')
      diceSceneRef.current?.removeDie('assist')
    } else {
      diceSceneRef.current?.addDie(tierColor(tier), 'assist')
      diceSceneRef.current?.removeDie('zero')
      diceSceneRef.current?.removeDie('zero2')
    }
  }, [tier, active])
  return active
    ? div({ className: styles.AssistForm }, [
        e(DicePool, {
          key: 'dicepool',
          state: dicePool$,
          ref: diceSceneRef,
          sendRoll: rollIt(roll, uid, $),
          disableRemove: false,
          disabled,
        }),
        div({ key: 'form', className: styles.form }, [
          e(FormHeading, { key: 'head', title: 'Assist Roll' }),
          h('p', { key: 'subhead' }, ["Dive in to assist another player's action at the last second"]),
          h('p', { key: 'subhead2' }, ['Spend and roll one die of your choice']),
          div({ key: 'pool' }, [
            div(null, e(TierSelect, { key: 'tier', $: $.prop('tier') }), h('label', null, 'Tier')),
            e(ComboBox, {
              key: 'pool',
              $: $.prop('pool'),
              name: 'pool',
              data: [...approaches, ...powers],
              placeholder: 'Approach or Power',
              required: tier !== Tier.T0,
            }),
          ]),
          e(Character, { key: 'character', $: $.prop('username'), passThroughProps: { required: true } }),
          e(Note, { key: 'note', $: $.prop('note'), passThroughProps: { required: true } }),
        ]),
      ])
    : null
}
