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
      sections: [
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
              fixedOptions: true,
            },
          ],
        },
        {
          name: 'Stakes',
          optionGroups: [
            { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate'] },
            { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme'] },
          ],
        },
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
      sections: [
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
              fixedOptions: true,
            },
          ],
        },
        {
          name: 'Stakes',
          optionGroups: [
            { name: 'Position', rollOptions: ['Controlled', 'Risky', 'Desperate'] },
            { name: 'Effect', rollOptions: ['None', 'Limited', 'Standard', 'Great', 'Extreme'] },
          ],
        },
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

const perseusConfig: RollConfig = {
  system: 'Project: Perseus',
  rollTypes: [
    {
      name: 'Agent',
      valuationType: 'Action',
      sections: [
        {
          name: 'Move',
          optionGroups: [
            {
              name: 'Agent Move',
              rollOptions: [
                'Engage in Violence',
                'Seize an Opportunity',
                'Manipulate',
                'Sneak',
                'Flee',
                'Pursue',
                'Sleight of Hand',
                'Escape Bonds',
                'Detect the Supernatural',
                'Use the Supernatural as Intended',
                'Push the Limits',
              ],
            },

            {
              name: 'Action',
              rollOptions: ['Charm', 'Maneuver', 'Supernatural', 'Violence'],
            },
          ],
        },
      ],
    },
    {
      name: 'Operator',
      valuationType: 'Action',
      sections: [
        {
          name: 'Move',
          optionGroups: [
            {
              name: 'Operator Move',
              rollOptions: [
                'Gather Info',
                'Cover Identity',
                'Hack the Planet',
                'Plant Gear',
                'Establish Contact',
                'R&R',
                'Mission Debrief',
              ],
            },
            {
              name: 'Resource',
              rollOptions: ['Library', 'Systems', 'Armory', 'Contacts'],
            },
          ],
        },
      ],
    },
    other,
  ],
}

const xThreatConfig: RollConfig = {
  system: 'X-Threat Playtest 2.0.0',
  rollTypes: [
    {
      name: 'Action',
      sections: [
        {
          optionGroups: [
            {
              name: 'Tier',
              columns: 3,
              showLabel: true,
              rollOptions: ['I', 'II', 'III'],
              fixedOptions: true,
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
              fixedOptions: true,
            },
          ],
          name: 'Approach',
        },
        {
          optionGroups: [
            {
              rollOptions: [],
              name: 'Resource',
            },
            {
              rollOptions: [],
              name: 'Device',
            },
          ],
          name: 'details',
        },
        {
          name: 'Stakes',
          optionGroups: [
            {
              rollOptions: ['Controlled', 'Risky', 'Desperate'],
              name: 'Position',
            },
            {
              name: 'Effect',
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

export const presets = [bladesInTheDarkConfig, nocturneRollConfig, perseusConfig, xThreatConfig]
