import { RollConfig } from '../RollConfig'
import { acquire, engagement, fortune, healing, indulge, other } from './common'

export const config: RollConfig = {
  system: 'Blades in the Dark',
  rollTypes: [
    {
      name: 'Action',
      valuationType: 'Action',
      sections: [
        {
          name: 'Action',
          sectionType: 'normal',
          optionGroups: [
            {
              name: 'Action',
              rollOptions: [
                'Attune',
                'Command',
                'Consort',
                'Finesse',
                'Hunt',
                'Prowl',
                'Skirmish',
                'Study',
                'Survey',
                'Sway',
                'Tinker',
                'Wreck',
              ],
              line: 0,
              fixedOptions: true,
            },
          ],
        },
        {
          name: 'Stakes',
          sectionType: 'normal',
          optionGroups: [
            { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate'], line: 1 },
            { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme'], line: 2 },
          ],
        },
      ],
    },
    {
      name: 'Resist',
      valuationType: 'Resist',
      sections: [
        {
          name: 'Resist',
          sectionType: 'normal',
          optionGroups: [
            {
              name: 'Attribute',
              rollOptions: ['Insight', 'Prowess', 'Resolve'],
              line: 0,
              fixedOptions: true,
            },
          ],
        },
      ],
    },
    fortune,
    engagement,
    acquire,
    healing,
    indulge,
    other,
  ],
}
export default config
