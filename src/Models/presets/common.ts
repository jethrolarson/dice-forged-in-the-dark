import { RollType } from '../RollConfig'

export const fortune: RollType = {
  name: 'Fortune',
  valuationType: 'Action',
  sections: [],
}

export const engagement: RollType = {
  name: 'Engagement',
  valuationType: 'Action',
  excludeCharacter: true,
  sections: [],
}

export const healing: RollType = {
  name: 'Healing',
  valuationType: 'Action',
  sections: [],
}

export const acquire: RollType = {
  name: 'Acquire',
  valuationType: 'Action',
  sections: [],
}

export const indulge: RollType = {
  name: 'Indulge',
  valuationType: 'Highest',
  sections: [],
}

export const other: RollType = {
  name: 'Other',
  valuationType: 'Ask',
  sections: [
    {
      name: 'Details',
      sectionType: 'normal',
      optionGroups: [
        {
          name: 'Roll Type',
          line: 0,
        },
        {
          name: '',
          line: 1,
        },
        {
          name: '',
          line: 2,
        },
      ],
    },
  ],
}
