import { Component, h } from '@fun-land/fun-web'
import { classes } from '../../../util'
import { RollValuation } from '../RollValuation'
import * as styles from './RollLog.css'

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

export const RollResultLabel: Component<{ result: RollValuation; label: string }> = (signal, { result, label }) =>
  h('h1', { className: classes(styles.resultLabel, rollResultStyle(result)) }, [label])
