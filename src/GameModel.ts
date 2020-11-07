export interface GameView {
  kind: 'GameView'
  id: string
}

export interface GameSettingsView {
  kind: 'GameSettingsView'
  id: string
}

interface LogItemCommon {
  username: string
  note: string
  date: number
  id: string
}

export interface RollResult extends LogItemCommon {
  kind: 'Roll'
  position: string
  effect: string
  results: number[]
  isZero: boolean
  rollType: string
}

export interface Message extends LogItemCommon {
  kind: 'Message'
}

type LogItem = RollResult | Message

export interface GameState extends PersistedState {
  mode: 'Roll' | 'Message'
}

export interface PersistedState {
  rolls: LogItem[]
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
  mode: 'Roll',
}
