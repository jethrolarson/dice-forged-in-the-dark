import React, { FC } from 'react'
import { classes, style, stylesheet } from 'typestyle'
import diceSprite from '../../dice.png'
import { RollResult } from '../../Models/GameModel'
import { borderColor } from '../../colors'
import { Die } from './Die'
import { color, ColorHelper } from 'csx'
import { RollValuation, valuationMap } from './RollValuation'
import { Note } from './Note'

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
    border: `solid ${borderColor}`,
    borderWidth: '1px 1px 1px 0',
    minHeight: circleSize,
    borderRadius: '0 8px 8px 0',
    padding: '4px 8px 8px',
    marginTop: 6,
    background: 'hsl(178deg 35% 55% / 11%)',
  },
  time: {
    textAlign: 'right',
    color: 'hsl(170, 50%, 46%)',
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
    background: 'radial-gradient(#112d33 51%, hsl(174deg 40% 27%))',
    flexWrap: 'wrap',
    flexGrow: 1,
    padding: 10,
    borderRadius: '6px 6px 0 0',
    $nest: {
      '&>*': {
        margin: 3,
      },
    },
  },
  dieResult: {
    backgroundImage: `url(${diceSprite})`,
    appearance: 'none',
    display: 'inline-block',
    width: 36,
    height: 36,
    color: 'transparent',
    backgroundSize: '214px 36px',
    borderRadius: 6,
    margin: '0 2px',
    backgroundBlendMode: 'multiply',
  },
  line: { fontWeight: 500 },
  rollType: {
    fontSize: 24,
  },
  smallRollType: {
    fontSize: 14,
  },
  result: {
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: `2px solid ${borderColor}`,
    borderRadius: 8,
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
    borderRadius: '0 0 8px 8px',
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

const RollMessage: FC<{ result: RollValuation; label: string }> = ({ result, label }) => {
  let _style
  switch (result) {
    case 'Crit':
      _style = style({ background: '#fff940', boxShadow: '0 0 5px 0px #fff940' })
      break
    case 'Success':
      _style = style({ background: '#49d08b', boxShadow: '0 0 5px 0px #49d08b' })
      break
    case 'MixedSuccess':
      _style = style({ background: '#ffa547', boxShadow: '0 0 5px 0px #ffa547' })
      break
    case 'Miss':
      _style = style({ background: 'hsl(0, 60%, 50%)', color: '#fff', boxShadow: '0 0 10px 0px hsl(0, 60%, 50%)' })
  }
  return <h1 className={classes(styles.resultLabel, _style)}>{label}</h1>
}

const isToday = (ms: number): boolean => new Date(ms).toDateString() === new Date().toDateString()

const dieColor = (
  excluded: boolean,
  highest: boolean,
  valuation: RollValuation,
  value: number,
  isLast: boolean,
): { dieColor: ColorHelper; dotColor: ColorHelper; border?: boolean; glow?: boolean; pulse?: boolean } => {
  if (excluded) {
    return { dieColor: color('hsla(0, 0%, 0%, 0)'), dotColor: color('hsl(0, 60%, 50%)'), border: true }
  }
  if (value === 6) return { dieColor: color('#49d08b'), dotColor: color('#000'), pulse: isLast }
  if (highest) {
    return valuation === 'MixedSuccess'
      ? { dieColor: color('#ffa547'), dotColor: color('#000'), pulse: isLast }
      : { dieColor: color('hsl(0, 60%, 50%)'), dotColor: color('#fff'), pulse: isLast }
  }
  return { dieColor: color('hsla(0, 0%, 0%, 0)'), dotColor: color(borderColor), border: true }
}

const ResultDie: FC<{
  value: number
  size: number
  highest: boolean
  excluded: boolean
  rollValuation: RollValuation
  isLast: boolean
}> = ({ value, size, highest, excluded, rollValuation, isLast }) => (
  <Die value={value} size={size} {...dieColor(excluded, highest, rollValuation, value, isLast)} />
)

const highestIndexes = (results: RollResult['results']): [number, number] => {
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

export const RollLogItem: FC<{ result: RollResult; isLast: boolean }> = ({ result, isLast }) => {
  const { isZero, note, results, position, effect, date, username, rollType, lines } = result
  const valuationMapItem = valuationMap[result.valuationType ?? 'Action']
  const valuation = valuationMapItem.valuation(result)
  const valuationLabel = valuationMapItem.label(result, valuation)
  const [highest, secondHighest] = highestIndexes(results)
  const excludedIndex = isZero ? highest : -1
  let title: string
  let moreLines: string[]
  if (lines?.length) {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    title = lines[0] || rollType
    moreLines = lines.slice(1)
  } else {
    title = rollType
    moreLines = [position ?? '', effect ?? '']
  }
  return (
    <div className={styles.RollLog}>
      <div className={styles.result}>
        <div className={styles.dice}>
          {results.map((d, i) => (
            <ResultDie
              key={`result_${i}`}
              size={results.length > 4 ? 36 : results.length === 1 ? 50 : 36}
              value={d}
              rollValuation={valuation}
              highest={(isZero ? secondHighest : highest) === i}
              excluded={excludedIndex === i}
              isLast={isLast}
            />
          ))}
        </div>
        <RollMessage result={valuation} label={valuationLabel} />
      </div>
      <div className={styles.metaWrap}>
        <div className={styles.meta}>
          <span className={styles.name}>{username} rolls:</span>
          <div className={title.length > 12 ? styles.smallRollType : styles.rollType}>{title}</div>
          {moreLines.map((line, i) => (
            <div className={styles.line} key={`line${i}`}>
              {line}
            </div>
          ))}
          {note && <Note text={note} />}
        </div>
        <em className={styles.time}>
          {!isToday(date) && new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
        </em>
      </div>
    </div>
  )
}
