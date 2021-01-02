import React, { FC } from 'react'
import { classes, style, stylesheet } from 'typestyle'
import diceSprite from './dice.png'
import { RollResult } from './Models/GameModel'
import { borderColor } from './colors'
import { Die } from './Die'
import { color, ColorHelper } from 'csx'
import { RollValuation, valuationMap } from './RollValuation'

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
    minHeight: circleSize,
    borderRadius: '0 8px 8px 0',
  },
  displacer: {
    float: 'left',
    shapeOutside: `ellipse(71px 50% at 6px 70px)`,
    width: circleSize,
    height: circleSize,
  },
  time: {
    textAlign: 'right',
    color: 'hsl(170, 50%, 46%)',
    fontSize: 10,
    display: 'block',
    margin: '4px 16px',
  },
  name: {
    marginTop: 6,
  },
  dice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    flexWrap: 'wrap',
    border: `2px solid ${borderColor}`,
    background: 'radial-gradient(#112d33 51%, hsl(174deg 53% 32%))',
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
  line: { fontWeight: 500 },
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
    marginBottom: 6,
  },
})

const RollMessage: FC<{ result: RollValuation; label: string }> = ({ result, label }) => {
  let _style
  switch (result) {
    case 'Crit':
      _style = style({ background: '#fff940' })
      break
    case 'Success':
      _style = style({ background: '#49d08b' })
      break
    case 'MixedSuccess':
      _style = style({ background: '#ffa547' })
      break
    case 'Miss':
      _style = style({ background: 'hsl(0, 60%, 50%)', color: '#fff' })
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
              size={results.length > 4 ? 30 : results.length === 1 ? 50 : 36}
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
          <div className={styles.displacer}></div>
          <span className={styles.name}>{username} rolls:</span>
          <div className={styles.rollType}>{title}</div>
          {moreLines.map((line, i) => (
            <div className={styles.line} key={`line${i}`}>
              {line}
            </div>
          ))}
          {note && <div className={styles.note}>&ldquo;{note}&rdquo;</div>}
        </div>
      </div>
      <em className={styles.time}>
        {!isToday(date) && new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
      </em>
    </div>
  )
}
