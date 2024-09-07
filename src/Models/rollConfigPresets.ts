import xThreat2 from './presets/xThreat2'
import xThreat3 from './presets/xThreat3'
import nocturne from './presets/nocturne'
import bladesInTheDark from './presets/bladesInTheDark'
import atsfs from './presets/atsfs'

export const presets = [
  bladesInTheDark,
  nocturne,
  xThreat2,
  xThreat3,
  atsfs,
  { system: 'Ash World 0.1' },
  { system: 'mala-incognita' },
] as const
