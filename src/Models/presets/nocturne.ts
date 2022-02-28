import { RollConfig } from '../RollConfig'
import { fortune, engagement, acquire, healing, other, indulge } from './common'

export const config: RollConfig = {
  system: 'A Nocturne',
  rollTypes: [
    {
      name: 'Action',
      valuationType: 'Action',
      sections: [
        {
          sectionType: 'normal',
          name: 'Action',
          optionGroups: [
            {
              name: 'Action',
              line: 0,
              rollOptions: [
                'Fight',
                'Hunt',
                'Pilot',
                'Scramble',
                'Command',
                'Consort',
                'Sneak',
                'Sway',
                'Analyze',
                'Operate',
                'Scan',
                'Hack',
              ],
              fixedOptions: true,
            },
          ],
        },
        {
          sectionType: 'normal',
          name: 'Stakes',
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
          sectionType: 'normal',
          name: 'Attribute',
          optionGroups: [
            {
              name: 'Attribute',
              rollOptions: ['Guts', 'Savvy', 'Systems'],
              fixedOptions: true,
              line: 0,
            },
          ],
        },
      ],
    },
    fortune,
    engagement,
    acquire,
    healing,
    {
      name: 'Chaos',
      valuationType: 'Action',
      sections: [],
    },
    other,

    { ...indulge, name: 'externalize' },
  ],
}

export default config
