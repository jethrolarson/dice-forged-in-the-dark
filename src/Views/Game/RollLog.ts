import { map } from 'ramda'
import { Component, h, hx, bindView } from '@fun-land/fun-web'
import { classes } from '../../util'
import { DieColor, DieColorType, DieResult } from '../../Models/Die'
import { RollResult } from '../../Models/GameModel'
import { Die, DieVisualState } from './Die'
import { funState, FunState } from '@fun-land/fun-state'
import { Note } from './Note'
import { RollValuation, valuationMap } from './RollValuation'
import * as styles from './RollLog.css'
import { DocumentReference, doc, updateDoc, collection } from '@firebase/firestore'

const rollResultStyle = (result: RollValuation): string => {
  switch (result) {
    case 'Crit':
      return classes(styles.resultLabel, styles.resultCrit)
    case 'Success':
      return classes(styles.resultLabel, styles.resultSuccess)
    case 'MixedSuccess':
      return classes(styles.resultLabel, styles.resultMixed)
    case 'Miss':
      return classes(styles.resultLabel, styles.resultMiss)
    case 'CritFail':
      return classes(styles.resultLabel, styles.resultCritFail)
  }
}

const RollMessage: Component<{ result: RollValuation; label: string }> = (signal, { result, label }) =>
  h('h1', { className: classes(styles.resultLabel, rollResultStyle(result)) }, [label])

const isToday = (ms: number): boolean => new Date(ms).toDateString() === new Date().toDateString()

const dieStyles = (
  value: number,
  excluded: boolean,
  highest: boolean,
  isLast: boolean,
  dieColor: string,
): { dieColor: string; dotColor: string; border?: boolean; glow?: boolean; pulse?: boolean } => {
  const _color = DieColor[dieColor as DieColorType] ?? dieColor
  if (excluded) {
    return { dieColor: 'transparent', dotColor: _color, border: true }
  }
  if (highest || value === 6) {
    return { dieColor: _color, dotColor: '#000', pulse: isLast }
  }
  return { dieColor: 'transparent', dotColor: _color, border: true }
}

const ResultDie: Component<{
  value: number
  size: number
  highest: boolean
  excluded: boolean
  isLast: boolean
  dieColor: string
}> = (signal, { value, size, highest, excluded, isLast, dieColor }) => {
  const { border, ...stateProps } = dieStyles(value, excluded, highest, isLast, dieColor)
  const $ = funState<DieVisualState>(stateProps)
  return Die(signal, { value, size, border, $ })
}

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

// Firebase update functions
const redactRoll = (gdoc: DocumentReference, rollId: string): void => {
  const rollRef = doc(collection(gdoc, 'rolls'), rollId)
  updateDoc(rollRef, { redacted: true }).catch((e) => {
    console.error(e)
    alert('Failed to redact roll')
  })
}

const unredactRoll = (gdoc: DocumentReference, rollId: string): void => {
  const rollRef = doc(collection(gdoc, 'rolls'), rollId)
  updateDoc(rollRef, { redacted: false }).catch((e) => {
    console.error(e)
    alert('Failed to unredact roll')
  })
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
  const len = diceRolled.length

  // Redaction toggle button - watch redaction state for title
  const redactionButton = hx(
    'button',
    {
      signal,
      props: { className: styles.redactionButton },
      on: {
        click: (e) => {
          e.stopPropagation()
          const isRedacted = rollState.prop('redacted').get() === true
          if (isRedacted) {
            unredactRoll(gdoc, id)
          } else {
            redactRoll(gdoc, id)
          }
        },
      },
    },
    ['✕'],
  )
  
  // Update button title when redaction state changes
  rollState.prop('redacted').watch(signal, (isRedacted) => {
    redactionButton.title = isRedacted 
      ? 'Unredact (show for everyone)' 
      : 'Redact (hide for everyone)'
  })
  
  // Set initial title
  redactionButton.title = rollState.prop('redacted').get() === true
    ? 'Unredact (show for everyone)'
    : 'Redact (hide for everyone)'

  // Make content reactive to redaction state
  const content = bindView(
    signal,
    rollState.prop('redacted'),
    (contentSignal, redactedValue) => {
      const isRedacted = redactedValue === true

      return !isRedacted
        ? h('div', { className: styles.RollLog }, [
            h('div', { className: styles.result }, [
              h(
                'div',
                { className: styles.dice },
                diceRolled.map(({ dieColor, value: d }, i) =>
                  ResultDie(contentSignal, {
                    size: len > 4 ? 36 : len === 1 ? 50 : 36,
                    value: d,
                    highest: (isZero ? secondHighest : highest) === i,
                    excluded: excludedIndex === i,
                    isLast,
                    dieColor,
                  }),
                ),
              ),
              RollMessage(contentSignal, { result: valuation, label: valuationLabel }),
            ]),
            h('div', { className: styles.metaWrap }, [
              h('div', { className: styles.meta }, [
                redactionButton,
                username && h('span', { className: styles.name }, [username, ':']),
                h('div', { className: title.length > 12 ? styles.smallRollType : styles.rollType }, [title]),
                ...moreLines.map((line) => h('div', { className: styles.line }, [line])),
                note && Note(contentSignal, { text: note }),
              ]),
              h('em', { className: styles.time }, [
                user,
                !isToday(date) ? new Date(date).toLocaleDateString() : '',
                ' ',
                new Date(date).toLocaleTimeString(),
              ]),
            ]),
          ])
        : h('div', { className: classes(styles.RollLog, styles.redactedCard) }, [
            h('div', { className: styles.redactedPlaceholder }, [
              redactionButton,
              h('span', {}, ['[Redacted]']),
            ]),
          ])
    },
  )

  return content
}
