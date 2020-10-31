import React, { FC } from 'react'
import { equals } from 'ramda'
import { style, stylesheet, classes } from 'typestyle'
import diceSprite from './dice.png'
import { RollResult } from './GameModel'
import { borderColor } from './colors'

const styles = stylesheet({
  RollLog: {
    listStyle: 'none',
    padding: '10px',
    position: 'relative',
    height: 240,
    margin: 10,
  },
  metaWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  meta: {
    border: `1px solid ${borderColor}`,
    marginLeft: 80,
    padding: 10,
    height: 160,
  },
  displacer: {
    float: 'left',
    shapeOutside: 'circle(50% at -10px 70px)',
    width: 200,
    height: 200,
  },
  time: {
    textAlign: 'right',
    color: 'hsl(170, 50%, 46%)',
    gridArea: 'result',
    fontSize: 12,
  },
  name: {},
  dice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    border: `2px solid ${borderColor}`,
    backgroundColor: '#102629',
    borderRadius: 300,
    width: 180,
    height: 180,
    padding: 28,
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
  effect: {},
  position: {},
  rollType: {
    fontSize: 30,
  },
  result: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    $nest: {
      h1: {
        textAlign: 'center',
        display: 'inline-block',
        background: `${borderColor}`,
        marginTop: -20,
        marginBottom: 4,
        color: 'hsl(200, 60%, 8%)',
        textTransform: 'uppercase',
        padding: '4px 8px',
        lineHeight: '1',
      },
    },
  },
  note: {},
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
      return <h1>Crit</h1>
    case 'Success':
      return <h1>Success</h1>
    case 'MixedSuccess':
      return <h1>Mixed</h1>
    case 'Miss':
      return <h1>Fail</h1>
  }
}

const isToday = (ms: number): boolean => new Date(ms).toDateString() === new Date().toDateString()

const dieColor = (excluded: boolean, highest: boolean, valuation: RollValuation, value: number): string => {
  if (!excluded) {
    if (value === 6) return 'green'
    if (highest) {
      return valuation === 'MixedSuccess' ? 'hsl(56, 90%, 70%)' : 'hsl(0, 60%, 50%)'
    }
  }
  return 'transparent'
}

const ResultDie: FC<{
  value: number
  highest: boolean
  excluded: boolean
  rollValuation: RollValuation
}> = ({ value, highest, excluded, rollValuation }) => {
  return (
    <span
      title={excluded ? 'excluded ' : value.toString()}
      className={classes(
        styles.dieResult,
        style({
          backgroundPositionX: -35.6 * (value - 1),
          backgroundColor: dieColor(excluded, highest, rollValuation, value),
          ...(excluded
            ? {
                filter: 'invert(100%)',
              }
            : {}),
        }),
      )}>
      d
    </span>
  )
}

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
              value={d}
              rollValuation={valuation}
              highest={(isZero ? secondHighest : highest) === i}
              excluded={excludedIndex === i}
            />
          ))}
        </div>
        <RollMessage result={valuation} />
        <em className={styles.time}>
          {!isToday(date) && new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
        </em>
      </div>
      <div className={styles.metaWrap}>
        <div className={styles.meta}>
          <div className={styles.displacer}></div>
          <span className={styles.name}>{username}</span>
          <div className={styles.rollType}>{rollType}</div>
          <div className={styles.position}>{position && `${position} Position`}</div>
          <div className={styles.effect}>{effect && `${effect} Effect`}</div>
          <div className={styles.note}>{note}</div>
        </div>
      </div>
    </div>
  )
}
