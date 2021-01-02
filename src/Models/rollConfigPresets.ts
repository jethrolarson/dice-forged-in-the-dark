import { RollConfig, RollType } from './RollConfig'

const fortune: RollType = {
  name: 'Fortune',
}

const engagement: RollType = {
  name: 'Engagement',
}

const healing: RollType = {
  name: 'Healing',
}

const other: RollType = {
  name: 'Other',
  valuationType: 'Ask',
  optionGroups: [
    {
      name: 'Roll Type',
    },
    {
      name: '',
    },
    {
      name: '',
    },
  ],
}

export const bladesInTheDarkConfig: RollConfig = {
  system: 'Blades in the Dark',
  rollTypes: [
    {
      name: 'Action',
      optionGroups: [
        {
          name: 'Action',
          rollOptions: [
            'None',
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
        },
        { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate'] },
        { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme'] },
      ],
    },
    {
      name: 'Resist',
      valuationType: 'Resist',
      optionGroups: [
        {
          name: 'Attribute',
          rollOptions: ['Insight', 'Prowess', 'Resolve'],
        },
      ],
    },
    fortune,
    engagement,
    healing,
    other,
  ],
}

export const nocturneRollConfig: RollConfig = {
  system: 'A Nocturne',
  rollTypes: [
    {
      name: 'Action',
      optionGroups: [
        {
          name: 'Action',
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
        },
        { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate', 'Dire'] },
        { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme', 'Transcendant'] },
      ],
    },
    {
      name: 'Resist',
      valuationType: 'Resist',
      optionGroups: [
        {
          name: 'Attribute',
          rollOptions: ['Guts', 'Savvy', 'Systems'],
        },
      ],
    },
    fortune,
    engagement,
    healing,
    other,
  ],
}

export const presets = [bladesInTheDarkConfig, nocturneRollConfig]
