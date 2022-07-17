import { FC } from 'react'
import { classes, style, stylesheet } from 'typestyle'
import { RollResult } from '../../Models/GameModel'
import { Die } from './Die'
import { RollValuation, valuationMap } from './RollValuation'
import { Note } from './Note'
import { map, prop } from 'ramda'
import { div, e, h } from '../../util'

const circleSize = 120

const styles = stylesheet({
  RollLog: {
    listStyle: 'none',
    display: 'flex',
    margin: '18px 12px',
    fontSize: 12,
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
    fontSize: 10,
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
    fontSize: 20,
  },
  smallRollType: {
    fontSize: 14,
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
    fontSize: 18,
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

const RollMessage = ({ result, label }: { result: RollValuation; label: string }) =>
  h('h1', { className: classes(styles.resultLabel, rollResultStyle(result)) }, [label])

const isToday = (ms: number): boolean => new Date(ms).toDateString() === new Date().toDateString()

const dieStyles = (
  value: number,
  excluded: boolean,
  highest: boolean,
  isLast: boolean,
  dieColor: string,
): { dieColor: string; dotColor: string; border?: boolean; glow?: boolean; pulse?: boolean } => {
  if (excluded) {
    return { dieColor: 'transparent', dotColor: dieColor, border: true }
  }
  if (highest || value === 6) {
    return { dieColor, dotColor: '#000', pulse: isLast }
  }
  return { dieColor: 'transparent', dotColor: dieColor, border: true }
}

const ResultDie: FC<{
  value: number
  size: number
  highest: boolean
  excluded: boolean
  isLast: boolean
  dieColor: string
}> = ({ value, size, highest, excluded, isLast, dieColor }) =>
  e(Die, { value, size, ...dieStyles(value, excluded, highest, isLast, dieColor) })

const getResults = map(prop('value'))

const highestIndexes = (diceRolled: RollResult['diceRolled']): [number, number] => {
  const results = getResults(diceRolled)
  if (results.length === 1) return [0, -1]
  return results.slice(1).reduce<[number, number]>(
    ([fst, snd], d, i) => {
      if (d > (results[fst] ?? 0)) return [i + 1, fst]
      if (d > (snd >= 0 ? results[snd] ?? 0 : 0)) return [fst, i + 1]
      return [fst, snd]
    },
    [0, -1],
  )
}

export const RollLogItem = ({ result, isLast }: { result: RollResult; isLast: boolean }) => {
  const { isZero, note, diceRolled, date, username, rollType, lines } = result
  const valuationMapItem = valuationMap[result.valuationType ?? 'Action']
  const valuation = valuationMapItem.valuation(result)
  const valuationLabel = valuationMapItem.label(result, valuation)
  const [highest, secondHighest] = highestIndexes(diceRolled)
  const excludedIndex = isZero ? highest : -1

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const title = lines?.[0] || rollType
  const moreLines = lines.slice(1)
  const len = diceRolled.length
  return div({ className: styles.RollLog }, [
    div({ key: 'result', className: styles.result }, [
      div(
        { key: 'dice', className: styles.dice },
        diceRolled.map(({ dieColor, value: d }, i) =>
          e(ResultDie, {
            key: `result_${i}`,
            size: len > 4 ? 36 : len === 1 ? 50 : 36,
            value: d,
            highest: (isZero ? secondHighest : highest) === i,
            excluded: excludedIndex === i,
            isLast,
            dieColor,
          }),
        ),
      ),
      e(RollMessage, { key: 'rollMessage', result: valuation, label: valuationLabel }),
    ]),
    div({ key: 'metaWrap', className: styles.metaWrap }, [
      div({ key: 'meta', className: styles.meta }, [
        username && h('span', { key: 'name', className: styles.name }, [username, ' rolls:']),
        div({ key: 'rollType', className: title.length > 12 ? styles.smallRollType : styles.rollType }, [title]),
        moreLines.map((line, i) => div({ className: styles.line, key: `line${i}` }, [line])),
        note && e(Note, { key: 'note', text: note }),
      ]),
      h('em', { key: 'time', className: styles.time }, [
        !isToday(date) && new Date(date).toLocaleDateString(),
        ' ',
        new Date(date).toLocaleTimeString(),
      ]),
    ]),
  ])
}
