import { RollConfig, RollType } from './RollConfig'

const fortune: RollType = {
  name: 'Fortune',
  valuationType: 'Action',
}

const engagement: RollType = {
  name: 'Engagement',
  valuationType: 'Action',
}

const healing: RollType = {
  name: 'Healing',
  valuationType: 'Action',
}

const acquire: RollType = {
  name: 'Acquire',
  valuationType: 'Action',
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
      valuationType: 'Action',
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
          fixedOptions: true,
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
          fixedOptions: true,
        },
      ],
    },
    fortune,
    engagement,
    acquire,
    healing,
    other,
  ],
}

export const nocturneRollConfig: RollConfig = {
  system: 'A Nocturne',
  rollTypes: [
    {
      name: 'Action',
      valuationType: 'Action',
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
          fixedOptions: true,
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
          rollOptions: ['Guts', 'Savvy', 'Systems'],
          fixedOptions: true,
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
    },
    other,
  ],
}

export const presets = [bladesInTheDarkConfig, nocturneRollConfig]
