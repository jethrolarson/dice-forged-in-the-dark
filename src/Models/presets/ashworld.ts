import { RollConfig } from '../RollConfig'
import { fortune, other } from './common'

const approaches = ['Charm', 'Deceit', 'Force', 'Focus', 'Ingenuity']
const standardPowers = ['Speed', 'Strength', 'Cycles', 'Stealth', 'Data', 'Fortitude']

const config: RollConfig = {
  system: 'Ashworld 0.1',
  rollTypes: [
    {
      name: 'Action',
      hideDice: true,
      sections: [
        {
          sectionType: 'normal',
          name: 'Odds',
          optionGroups: [
            {
              name: 'Odds',
              line: 4,
              fixedOptions: true,
              columns: 3,
              showLabel: true,
              rollOptions: [
                {
                  name: 'Bad',
                },
                {
                  name: 'Even',
                  addDieWhenSelected: ['d6', 'd6'],
                },
                { name: 'Good', addDieWhenSelected: ['d6', 'd6'] },
              ],
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
