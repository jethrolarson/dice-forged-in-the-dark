import { RollConfig } from '../RollConfig'
import { fortune, other } from './common'

const approaches = ['Charm', 'Deceit', 'Force', 'Focus', 'Ingenuity']
const standardPowers = ['Speed', 'Strength', 'Cycles', 'Stealth', 'Data', 'Fortitude']

const config: RollConfig = {
  system: 'X-Threat 3.1',
  rollTypes: [
    {
      name: 'Action',
      hideDice: true,
      sections: [
        {
          name: 'Approach',
          sectionType: 'builder',
          addDieWhenSelected: 'd6',
          dieColor: 'green',
          line: 1,
          optionGroups: [
            {
              name: 'Approach',
              rollOptions: approaches,
              fixedOptions: true,
            },
            {
              name: 'Tier',
              columns: 6,
              rollOptions: ['⨷', '⓵', '⓶', '⓷', '⓸', '⓹'],
              fixedOptions: true,
            },
          ],
        },
        {
          name: 'Avatar Power',
          sectionType: 'builder',
          line: 2,
          addDieWhenSelected: 'd6',
          dieColor: 'yellow',
          optionGroups: [
            {
              name: 'Power',
              rollOptions: standardPowers,
              fixedOptions: false,
            },
            {
              name: 'Tier',
              columns: 6,
              rollOptions: ['⨷', '⓵', '⓶', '⓷', '⓸', '⓹'],
              fixedOptions: true,
            },
          ],
        },
        {
          name: 'Assist',
          sectionType: 'builder',
          addDieWhenSelected: 'd6',
          dieColor: 'purple',
          line: 3,
          optionGroups: [
            {
              name: 'Approach or Power',
              rollOptions: approaches.concat(standardPowers),
              fixedOptions: false,
            },
            {
              name: 'Tier',
              columns: 6,
              rollOptions: ['⨷', '⓵', '⓶', '⓷', '⓸', '⓹'],
              fixedOptions: true,
            },
          ],
        },
        {
          sectionType: 'modifier',
          baseModifier: 1,
          dieColor: 'white',
          dieType: 'd6',
          max: 2,
          min: 0,
          name: 'Factor',
          showLabel: true,
        },
        {
          name: 'Stakes',
          sectionType: 'builder',
          separator: ' / ',
          line: 0,
          optionGroups: [
            {
              rollOptions: ['Controlled', 'Risky', 'Desperate'],
              fixedOptions: true,
              showLabel: true,
              columns: 1,
              name: 'Position',
            },
            {
              name: 'Effect',
              showLabel: true,
              fixedOptions: true,
              columns: 1,
              rollOptions: ['Limited', 'Standard', 'Great'],
            },
          ],
        },
      ],
      valuationType: 'Action',
    },
    fortune,
    other,
  ],
}
export default config
