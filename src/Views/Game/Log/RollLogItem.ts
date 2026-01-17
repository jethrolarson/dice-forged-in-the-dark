import { map } from 'ramda'
import { Component, h, bindView } from '@fun-land/fun-web'
import { DieResult } from '../../../Models/Die'
import { RollResult } from '../../../Models/GameModel'
import { FunState } from '@fun-land/fun-state'
import { DocumentReference } from '@firebase/firestore'
import { valuationMap } from '../RollValuation'
import { RedactionButton } from './RedactionButton'
import { DiceDisplay } from './DiceDisplay'
import { RollResultLabel } from './RollResultLabel'
import { RollMeta } from './RollMeta'
import { Timestamp } from './Timestamp'
import * as styles from './RollLog.css'

const getResults = map((d: DieResult) => d.value)

const highestIndexes = (diceRolled: RollResult['diceRolled']): [number, number] => {
  const results = getResults(diceRolled)
  if (results.length === 1) return [0, -1]
  return results.slice(1).reduce<[number, number]>(
    ([fst, snd], d, i) => {
      if (d > (results[fst] ?? 0)) return [i + 1, fst]
      if (d > (snd >= 0 ? (results[snd] ?? 0) : 0)) return [fst, i + 1]
      return [fst, snd]
    },
    [0, -1],
  )
}

export const RollLogItem: Component<{
  result: RollResult
  isLast: boolean
  gdoc: DocumentReference
  rollState: FunState<RollResult>
}> = (signal, { result, isLast, gdoc, rollState }) => {
  const { isZero, note, diceRolled, date, username, rollType, lines, user, id } = result
  const valuationMapItem = valuationMap[result.valuationType ?? 'Action']
  const valuation = valuationMapItem.valuation(result)
  const valuationLabel = valuationMapItem.label(result, valuation)
  const [highest, secondHighest] = highestIndexes(diceRolled)
  const excludedIndex = isZero ? highest : -1

  const title = lines?.[0] || rollType
  const moreLines = lines.slice(1)
  const highestIndex = isZero ? secondHighest : highest

  const redactionButton = RedactionButton<RollResult>()(signal, { gdoc, itemId: id, itemState: rollState })

  const content = bindView(signal, rollState.prop('redacted'), (contentSignal, redactedValue) => {
    const isRedacted = redactedValue === true

    return !isRedacted
      ? h('div', { className: styles.RollLog }, [
          h('div', { className: styles.result }, [
            DiceDisplay(contentSignal, {
              diceRolled,
              highestIndex,
              excludedIndex,
              isLast,
            }),
            RollResultLabel(contentSignal, { result: valuation, label: valuationLabel }),
          ]),
          h('div', { className: styles.metaWrap }, [
            RollMeta(contentSignal, {
              username,
              title,
              moreLines,
              note,
              redactionButton,
            }),
            Timestamp(contentSignal, { user, date }),
          ]),
        ])
      : h('div', { className: styles.RollLog }, [
          h('div', { className: styles.redactedPlaceholder }, [
            redactionButton,
            h('span', {}, ['[Redacted]']),
          ]),
        ])
  })

  return content
}
