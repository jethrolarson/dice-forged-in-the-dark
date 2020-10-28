import React, { FC } from 'react'
import { equals } from 'ramda'
import { style, stylesheet, classes } from 'typestyle'
import { RollResult } from './GameModel'

const styles = stylesheet({
  result: {
    position: 'relative',
    listStyle: 'none',
    padding: '10px',
    borderTop: '1px solid #aaa',
    $nest: {
      'li:first-child &': {
        border: '0'
      }
    }
  },
  dieResult: {
    backgroundImage: 'url(dice.png)',
    appearance: 'none',
    display: 'inline-block',
    width: 36,
    height: 36,
    color: 'transparent',
    backgroundSize: '214px 36px',
    borderRadius: 6,
    margin: '0 2px',
    backgroundBlendMode: 'multiply'
  },
  rollType: {
    position: 'absolute',
    pointerEvents: 'none',
    right: 20,
    bottom: 0,
    fontWeight: 500,
    fontSize: 50,
    color: '#333'
  }
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
      return <h1>Crit!</h1>
    case 'Success':
      return <h1>Success!</h1>
    case 'MixedSuccess':
      return (
        <>
          <h1>Mixed Success!</h1>
          But there are consequences...
        </>
      )
    case 'Miss':
      return <h1>Miss!</h1>
  }
}

const isToday = (ms: number) => new Date(ms).toDateString() === new Date().toDateString()

const dieColor = (excluded: boolean, highest: boolean, valuation: RollValuation, value: number) => {
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
  index: number
  excluded: boolean
  rollValuation: RollValuation
}> = ({ value, index, highest, excluded, rollValuation }) => {
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
                filter: 'invert(100%)'
              }
            : {})
        })
      )}>
      d
    </span>
  )
}

const highestIndexes = (results: RollResult['results']): [number, number] => {
  if (results.length === 1) return [0, -1]
  return results
    .slice(1)
    .reduce(
      ([fst, snd], d, i) =>
        d > results[fst] ? [i + 1, fst] : d > (snd >= 0 ? results[snd] : 0) ? [fst, i + 1] : [fst, snd],
      [0, -1]
    )
}

export const RollLog: FC<{ result: RollResult }> = ({
  result: { isZero, note, results, position, effect, date, username, rollType }
}) => {
  const valuation = valuate(isZero, results)
  const [highest, secondHighest] = highestIndexes(results)
  const excludedIndex = isZero ? highest : -1
  return (
    <div className={styles.result}>
      <em className={style({ float: 'right', color: '#aaa' })}>
        {!isToday(date) && new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
      </em>
      {username}
      <div>
        {position && `${position} Position`}
        <br />
        {effect && `${effect} Effect`}
      </div>
      <div className={style({ display: 'flex', alignItems: 'center' })}>
        {results.map((d, i) => (
          <ResultDie
            key={`result_${i}`}
            value={d}
            index={i}
            rollValuation={valuation}
            highest={(isZero ? secondHighest : highest) === i}
            excluded={excludedIndex === i}
          />
        ))}
      </div>
      <RollMessage result={valuation} />
      <div>{note}</div>
      <div className={styles.rollType}>{rollType}</div>
    </div>
  )
}
