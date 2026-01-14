import { map } from 'ramda'
import { Component, h } from '@fun-land/fun-web'
import { classes, style, stylesheet } from 'typestyle'
import { DieColor, DieColorType, DieResult } from '../../Models/Die'
import { RollResult } from '../../Models/GameModel'
import { Die } from './Die'
import { Note } from './Note'
import { RollValuation, valuationMap } from './RollValuation'

const circleSize = 120

const styles = stylesheet({
  RollLog: {
    listStyle: 'none',
    display: 'flex',
    margin: '18px 12px',
    fontSize: '1rem',
  },
  metaWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
  },
  meta: {
    border: `solid var(--border-color)`,
    borderWidth: '1px 1px 1px 0',
    minHeight: circleSize,
    borderRadius: '0 var(--br) var(--br) 0',
    padding: '4px 8px 8px',
    marginTop: 6,
    background: 'var(--bg-log-meta)',
  },
  time: {
    textAlign: 'right',
    color: 'var(--fc-deem)',
    fontSize: '0.9rem',
    display: 'block',
    margin: '4px 16px 0',
  },
  name: {
    marginTop: 6,
    lineHeight: 1,
  },
  dice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    background: 'var(--bg-dice)',
    flexWrap: 'wrap',
    flexGrow: 1,
    padding: 10,
    borderRadius: 'calc(var(--br) - 2px) calc(var(--br) - 2px) 0 0',
    $nest: {
      '&>*': {
        margin: 3,
      },
    },
  },
  line: { fontWeight: 500 },
  rollType: {
    fontSize: '1.7rem',
    fontFamily: 'var(--ff-heading)',
  },
  smallRollType: {
    fontSize: '1.17rem',
  },
  result: {
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: `2px solid var(--border-color)`,
    borderRadius: 'var(--br)',
    width: circleSize,
    minHeight: circleSize,
    marginBottom: 4,
  },
  resultLabel: {
    textAlign: 'center',
    display: 'inline-block',
    color: 'hsl(200, 60%, 8%)',
    textTransform: 'uppercase',
    padding: '4px 8px',
    lineHeight: '1',
    borderRadius: '0 0 var(--br) var(--br)',
    margin: '0 -2px -2px',
    fontSize: '1.5rem',
  },
  note: {
    marginTop: 2,
    fontStyle: 'italic',
    $nest: {
      img: {
        maxWidth: '100%',
      },
    },
  },
})

const rollResultStyle = (result: RollValuation): string => {
  switch (result) {
    case 'Crit':
      return style({ background: 'var(--bg-result-crit)', boxShadow: 'var(--bs-result-crit)' })
    case 'Success':
      return style({ background: 'var(--bg-result-success)', boxShadow: 'var(--bs-result-success)' })
    case 'MixedSuccess':
      return style({ background: 'var(--bg-result-mixed)', boxShadow: 'var(--bs-result-mixed)' })
    case 'Miss':
      return style({ background: 'var(--bg-result-miss)', color: '#fff', boxShadow: 'var(--bs-result-miss)' })
    case 'CritFail':
      return style({ background: 'var(--bg-result-critfail)', color: '#fff', boxShadow: 'var(--bs-result-critfail)' })
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
}> = (signal, { value, size, highest, excluded, isLast, dieColor }) =>
  Die(signal, { value, size, ...dieStyles(value, excluded, highest, isLast, dieColor) })

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

export const RollLogItem: Component<{ result: RollResult; isLast: boolean }> = (signal, { result, isLast }) => {
  const { isZero, note, diceRolled, date, username, rollType, lines, user } = result
  const valuationMapItem = valuationMap[result.valuationType ?? 'Action']
  const valuation = valuationMapItem.valuation(result)
  const valuationLabel = valuationMapItem.label(result, valuation)
  const [highest, secondHighest] = highestIndexes(diceRolled)
  const excludedIndex = isZero ? highest : -1

  const title = lines?.[0] || rollType
  const moreLines = lines.slice(1)
  const len = diceRolled.length
  return h('div', { className: styles.RollLog }, [
    h('div', { className: styles.result }, [
      h(
        'div',
        { className: styles.dice },
        diceRolled.map(({ dieColor, value: d }, i) =>
          ResultDie(signal, {
            size: len > 4 ? 36 : len === 1 ? 50 : 36,
            value: d,
            highest: (isZero ? secondHighest : highest) === i,
            excluded: excludedIndex === i,
            isLast,
            dieColor,
          }),
        ),
      ),
      RollMessage(signal, { result: valuation, label: valuationLabel }),
    ]),
    h('div', { className: styles.metaWrap }, [
      h('div', { className: styles.meta }, [
        username && h('span', { className: styles.name }, [username, ':']),
        h('div', { className: title.length > 12 ? styles.smallRollType : styles.rollType }, [title]),
        ...moreLines.map((line, i) => h('div', { className: styles.line }, [line])),
        note && Note(signal, { text: note }),
      ]),
      h('em', { className: styles.time }, [
        user,
        !isToday(date) ? new Date(date).toLocaleDateString() : '',
        ' ',
        new Date(date).toLocaleTimeString(),
      ]),
    ]),
  ])
}
