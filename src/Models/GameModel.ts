import { RollConfig, ValuationType } from './RollConfig'
import { bladesInTheDarkConfig } from './rollConfigPresets'

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
  lines?: string[]
  /** @deprecated */
  position?: string
  /** @deprecated */
  effect?: string
  results: number[]
  isZero: boolean
  rollType: string
  valuationType: ValuationType
}

export interface Message extends LogItemCommon {
  kind: 'Message'
}

export type LogItem = RollResult | Message

export interface GameState extends PersistedState {
  mode: 'Roll' | 'Message'
}

export interface PersistedState {
  rolls: LogItem[]
  title: string
  rollConfig: RollConfig
}

export const initialPersistedState: PersistedState = {
  rolls: [],
  title: '',
  rollConfig: bladesInTheDarkConfig,
}

export const initialGameState: GameState = {
  ...initialPersistedState,
  mode: 'Roll',
}
