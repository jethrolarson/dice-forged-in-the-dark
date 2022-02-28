import { RollConfig } from '../RollConfig'
import { other } from './common'

const config: RollConfig = {
  system: 'X-Threat 2',
  rollTypes: [
    {
      name: 'Action',
      sections: [
        {
          sectionType: 'normal',
          optionGroups: [
            {
              name: 'Tier',
              columns: 3,
              showLabel: true,
              rollOptions: ['I', 'II', 'III'],
              fixedOptions: true,
              line: 0,
            },
          ],
          name: 'Tier',
        },
        {
          optionGroups: [
            {
              name: 'Approach',
              showLabel: true,
              rollOptions: ['Charm', 'Deceit', 'Force', 'Precision', 'Ingenuity', 'Grace'],
              line: 1,
              fixedOptions: true,
            },
          ],
          sectionType: 'normal',
          name: 'Approach',
        },
        {
          optionGroups: [
            {
              rollOptions: [],
              line: 2,
              name: 'Resource',
            },
            {
              rollOptions: [],

              line: 3,
              name: 'Device',
            },
          ],
          sectionType: 'normal',
          name: 'details',
        },
        {
          name: 'Stakes',
          sectionType: 'normal',
          optionGroups: [
            {
              line: 4,
              rollOptions: ['Controlled', 'Risky', 'Desperate'],
              name: 'Position',
            },
            {
              name: 'Effect',
              line: 5,
              rollOptions: ['Limited', 'Standard', 'Great'],
            },
          ],
        },
      ],
      valuationType: 'Action',
    },
    other,
  ],
}
export default config
