import React, { FC } from 'react'
import { equals } from 'ramda'
import { classes, style, stylesheet } from 'typestyle'
import diceSprite from './dice.png'
import { RollResult } from './GameModel'
import { borderColor } from './colors'
import { Die } from './Die'
import { color, ColorHelper } from 'csx'

const circleSize = 140

const styles = stylesheet({
  RollLog: {
    listStyle: 'none',
    position: 'relative',
    margin: '24px 12px',
    fontSize: 12,
  },
  metaWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  meta: {
    border: `1px solid ${borderColor}`,
    marginLeft: circleSize / 2 + 2,
    padding: 6,
    height: circleSize,
    borderRadius: '0 8px 8px 0',
  },
  displacer: {
    float: 'left',
    shapeOutside: `circle(50% at -5px ${(circleSize - 14) / 2}px)`,
    width: circleSize + 6,
    height: circleSize + 6,
  },
  time: {
    textAlign: 'right',
    color: 'hsl(170, 50%, 46%)',
    fontSize: 10,
    display: 'block',
    margin: '4px 16px',
  },
  name: {},
  dice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    flexWrap: 'wrap',
    border: `2px solid ${borderColor}`,
    background: '#112d33',
    borderRadius: 300,
    width: circleSize,
    height: circleSize,
    padding: 14,
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
  effect: { fontWeight: 500 },
  position: { fontWeight: 500 },
  rollType: {
    fontSize: 24,
  },
  result: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
  },
  resultLabel: {
    textAlign: 'center',
    display: 'inline-block',
    marginTop: -20,
    marginBottom: 4,
    color: 'hsl(200, 60%, 8%)',
    textTransform: 'uppercase',
    padding: '4px 8px',
    lineHeight: '1',
    borderRadius: 1.5,
  },
  note: {
    marginTop: 2,
    fontStyle: 'italic',
  },
})

type RollValuation = 'Success' | 'MixedSuccess' | 'Crit' | 'Miss'

const valuate = (isZero: boolean, results: number[]): RollValuation => {
  const successes = results.filter(equals(6)).length
  const winThreshold = isZero ? 2 : 1
  if (successes > winThreshold) {
    return 'Crit'
  }
  if (successes >= winThreshold) {
    return 'Success'
  }
  const mixed = results.filter((d) => d > 3).length
  if (mixed >= winThreshold) {
    return 'MixedSuccess'
  }
  return 'Miss'
}

const RollMessage: FC<{ result: RollValuation }> = ({ result }) => {
  switch (result) {
    case 'Crit':
      return <h1 className={classes(styles.resultLabel, style({ background: '#fff940' }))}>Crit</h1>
    case 'Success':
      return <h1 className={classes(styles.resultLabel, style({ background: '#49d08b' }))}>Success</h1>
    case 'MixedSuccess':
      return <h1 className={classes(styles.resultLabel, style({ background: '#ffa547' }))}>Mixed</h1>
    case 'Miss':
      return (
        <h1 className={classes(styles.resultLabel, style({ background: 'hsl(0, 60%, 50%)', color: '#fff' }))}>Fail</h1>
      )
  }
}

const isToday = (ms: number): boolean => new Date(ms).toDateString() === new Date().toDateString()

const dieColor = (
  excluded: boolean,
  highest: boolean,
  valuation: RollValuation,
  value: number,
): { dieColor: ColorHelper; dotColor: ColorHelper; border?: boolean; glow?: boolean } => {
  if (excluded) {
    return { dieColor: color('hsla(0, 0%, 0%, 0)'), dotColor: color('hsl(0, 60%, 50%)'), border: true }
  }
  if (value === 6) return { dieColor: color('#49d08b'), dotColor: color('#000'), glow: true }
  if (highest) {
    return valuation === 'MixedSuccess'
      ? { dieColor: color('#ffa547'), dotColor: color('#000'), glow: true }
      : { dieColor: color('hsl(0, 60%, 50%)'), dotColor: color('#fff'), glow: true }
  }
  return { dieColor: color('hsla(0, 0%, 0%, 0)'), dotColor: color(borderColor), border: true }
}

const ResultDie: FC<{
  value: number
  size: number
  highest: boolean
  excluded: boolean
  rollValuation: RollValuation
}> = ({ value, size, highest, excluded, rollValuation }) => (
  <Die value={value} size={size} {...dieColor(excluded, highest, rollValuation, value)} />
)

const highestIndexes = (results: RollResult['results']): [number, number] => {
  if (results.length === 1) return [0, -1]
  return results.slice(1).reduce(
    ([fst, snd], d, i) => {
      if (d > results[fst]) return [i + 1, fst]
      if (d > (snd >= 0 ? results[snd] : 0)) return [fst, i + 1]
      return [fst, snd]
    },
    [0, -1],
  )
}

export const RollLog: FC<{ result: RollResult }> = ({
  result: { isZero, note, results, position, effect, date, username, rollType },
}) => {
  const valuation = valuate(isZero, results)
  const [highest, secondHighest] = highestIndexes(results)
  const excludedIndex = isZero ? highest : -1
  return (
    <div className={styles.RollLog}>
      <div className={styles.result}>
        <div className={styles.dice}>
          {results.map((d, i) => (
            <ResultDie
              key={`result_${i}`}
              size={results.length > 4 ? 30 : results.length === 1 ? 50 : 36}
              value={d}
              rollValuation={valuation}
              highest={(isZero ? secondHighest : highest) === i}
              excluded={excludedIndex === i}
            />
          ))}
        </div>
        <RollMessage result={valuation} />
      </div>
      <div className={styles.metaWrap}>
        <div className={styles.meta}>
          <div className={styles.displacer}></div>
          <span className={styles.name}>{username} rolls:</span>
          <div className={styles.rollType}>{rollType}</div>
          <div className={styles.position}>{position && `${position} Position`}</div>
          <div className={styles.effect}>{effect && `${effect} Effect`}</div>
          {note && <div className={styles.note}>&ldquo;{note}&rdquo;</div>}
        </div>
      </div>
      <em className={styles.time}>
        {!isToday(date) && new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
      </em>
    </div>
  )
}
