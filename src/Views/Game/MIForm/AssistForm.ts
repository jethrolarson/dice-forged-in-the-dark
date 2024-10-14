import { FunState } from '@fun-land/fun-state'
import useFunState from '@fun-land/use-fun-state'

import { useCallback, useEffect, useRef } from 'react'
import { stylesheet } from 'typestyle'
import { dieColors, DieResult } from '../../../Models/Die'
import { Character } from '../../../components/Character'
import { ComboBox } from '../../../components/ComboBox'
import { DicePool, DicePool$, init_DicePool$ } from '../../../components/DicePool'
import { DiceSceneRef } from '../../../components/DiceScene/DiceScene'
import { FormHeading } from '../../../components/FormHeading'
import { Note } from '../../../components/Note'
import { div, e, h } from '../../../util'
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
})

interface AssistForm$ {
  pool: string
  tier: Tier
  dicePool: DicePool$
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
  dicePool: init_DicePool$(),
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
  const addDie = (color: number, id?: string) => {
    diceSceneRef.current?.addDie(color, id)
  }
  const removeDie = useCallback((id: string) => {
    diceSceneRef.current?.removeDie(id)
  }, [])
  const enable = useCallback(() => {
    diceSceneRef.current?.enable()
  }, [])
  const disable = useCallback(() => {
    diceSceneRef.current?.disable()
  }, [])
  useEffect(() => {
    username && note && pool ? enable() : disable()
  }, [username, note, pool])
  useEffect(() => {
    if (tier === Tier.T0) {
      addDie(dieColors.black, 'zero')
      addDie(dieColors.black, 'zero2')
      removeDie('assist')
    } else {
      addDie(tierColor(tier), 'assist')
      removeDie('zero')
      removeDie('zero2')
    }
  }, [tier, active])
  return active
    ? div({ className: styles.AssistForm, key: 'assistForm' }, [
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
            div(
              { key: 'tierWrap' },
              e(TierSelect, { key: 'tier', $: $.prop('tier') }),
              h('label', { key: 'tierLabel' }, 'Tier'),
            ),
            e(ComboBox, {
              key: 'pool',
              $: $.prop('pool'),
              name: 'pool',
              data: [...approaches, ...powers],
              placeholder: 'Approach or Power',
              required: true,
            }),
          ]),
          e(Character, { key: 'character', $: $.prop('username'), passThroughProps: { required: true } }),
          e(Note, { key: 'note', $: $.prop('note'), passThroughProps: { required: true } }),
        ]),
      ])
    : null
}
