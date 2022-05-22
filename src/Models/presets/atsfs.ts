import { RollConfig } from '../RollConfig'

const config: RollConfig = {
  system: 'ATSFS',
  rollTypes: [
    {
      valuationType: 'Action',
      name: 'Encounter',
      sections: [
        {
          optionGroups: [
            {
              name: 'Action',
              rollOptions: [
                'Administer',
                'Assess',
                'Coerce',
                'Commune',
                'Convince',
                'Grapple',
                'Rush',
                'Slip',
                'Tinker',
              ],
              line: 0,
              fixedOptions: true,
              columns: 3,
            },
          ],
          sectionType: 'normal',
          name: 'Action',
        },
        {
          sectionType: 'normal',
          name: 'Stakes',
          optionGroups: [
            {
              rollOptions: ['Controlled', 'Risky', 'Desperate'],
              line: 1,
              name: 'Position',
            },
            {
              line: 2,
              rollOptions: ['None', 'Limited', 'Standard', 'Great'],
              name: 'Effect',
            },
          ],
        },
      ],
    },
    {
      name: 'Storm',
      valuationType: 'Action',
      excludeCharacter: true,
      sections: [
        {
          name: 'Action',
          optionGroups: [
            {
              name: 'Action',
              rollOptions: ['Search', 'Travel', 'Watch', 'Camp', 'Undertake'],
              line: 0,
              fixedOptions: true,
              columns: 3,
            },
          ],
          sectionType: 'normal',
        },
        {
          sectionType: 'row',
          sections: [
            {
              sectionType: 'modifier',
              baseModifier: 0,
              dieColor: 'white',
              dieType: 'd6',
              max: 12,
              min: 0,
              name: 'Extra Time',
              showLabel: true,
              line: 1,
            },
            {
              sectionType: 'modifier',
              baseModifier: 0,
              dieColor: 'green',
              dieType: 'd6',
              max: 6,
              min: 0,
              name: 'Fortune',
              showLabel: true,
              line: 2,
            },
          ],
        },
        {
          sectionType: 'row',
          sections: [
            {
              sectionType: 'modifier',
              baseModifier: 0,
              dieColor: 'yellow',
              dieType: 'd6',
              max: 1,
              min: -1,
              name: 'Group Risk',
              showLabel: true,
              tooltip: 'You have to subtract dice manually when negative',
              line: 3,
            },
            {
              sectionType: 'modifier',
              baseModifier: 0,
              dieColor: 'purple',
              dieType: 'd6',
              max: 4,
              min: -4,
              name: 'Individual Risk',
              showLabel: true,
              tooltip: 'You have to subtract dice manually when negative',
              line: 4,
            },
          ],
        },
        {
          sectionType: 'normal',
          name: 'Threat',
          optionGroups: [
            {
              showLabel: true,
              tooltip: 'Subtract these from the dice pool',
              rollOptions: ['Free', 'Engaged -1', 'Routed -2', 'Conquered -3'],
              line: 5,
              fixedOptions: true,
              name: 'Threat',
            },
          ],
        },
      ],
    },
    {
      sections: [
        {
          name: 'Action',
          sectionType: 'normal',
          optionGroups: [
            {
              columns: 1,
              rollOptions: [
                'Craft (Tinker)',
                'Jury-Rig (Tinker)',
                'Treat (Administer)',
                'Console (Commune)',
                'Reconcile (Commune All)',
                'Cook (Commune All)',
                'Rest (Reason)',
                "Practice (Don't Roll)",
                "Fortify (Don't Roll)",
              ],
              name: 'Action',
              fixedOptions: true,
              line: 0,
            },
          ],
        },
      ],
      name: 'Camp Action',
      valuationType: 'Action',
    },
    {
      name: 'Resist',
      sections: [
        {
          sectionType: 'normal',
          optionGroups: [
            {
              rollOptions: ['Reason', 'Form', 'Spirit'],
              line: 0,
              columns: 3,
              fixedOptions: true,
              name: 'Attribute',
            },
          ],
          name: 'Resist',
        },
      ],
      valuationType: 'Resist',
    },
    {
      name: 'Luck',
      sections: [],
      valuationType: 'Action',
    },
    {
      name: 'Other',
      valuationType: 'Ask',
      sections: [
        {
          optionGroups: [
            {
              name: 'Roll Type',
              line: 0,
            },
            {
              line: 1,
              name: '',
            },
            {
              line: 2,
              name: '',
            },
          ],
          name: 'Details',
          sectionType: 'normal',
        },
      ],
    },
  ],
}
export default config
