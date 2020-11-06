export interface GameView {
  kind: 'GameView'
  id: string
}

export interface GameSettingsView {
  kind: 'GameSettingsView'
  id: string
}

export interface RollResult {
  username: string
  position: string
  effect: string
  results: number[]
  isZero: boolean
  note: string
  date: number
  id: string
  rollType: string
}

export interface GameState extends PersistedState {
  rollType: string
  note: string
  position: string
  effect: string
  username: string
  settingsOpen: boolean
  hoveredDieButton: number
}

export interface PersistedState {
  rolls: RollResult[]
  title: string
  positionOptions: string
  effectOptions: string
  rollTypeOptions: string
}

export const initialPersistedState: PersistedState = {
  rolls: [],
  title: '',
  positionOptions: 'Controlled,Risky,Desperate',
  effectOptions: 'None,Limited,Standard,Great,Extreme',
  rollTypeOptions:
    'Attune,Command,Consort,Finesse,Hunt,Prowl,Skirmish,Study,Survey,Sway,Tinker,Wreck,Insight,Prowess,Resolve,Fortune',
}

export const initialGameState: GameState = {
  ...initialPersistedState,
  note: '',
  rollType: '',
  position: '',
  effect: '',
  username: 'anonymous',
  settingsOpen: false,
  hoveredDieButton: -1,
}
