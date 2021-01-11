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
  uid: string
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

export interface LoadedGameState extends PersistedState {
  readonly kind: 'LoadedGameState'
  mode: 'Roll' | 'Message'
}

export interface LoadingGameState {
  readonly kind: 'LoadingGameState'
}

export interface MissingGameState {
  readonly kind: 'MissingGameState'
}

export interface ErrorGameState {
  readonly kind: 'ErrorGameState'
}

export const missingGameState: MissingGameState = { kind: 'MissingGameState' }

export type GameState = LoadedGameState | LoadingGameState | MissingGameState | ErrorGameState

export interface PersistedState {
  rolls: LogItem[]
  title: string
  rollConfig: RollConfig
  owners: string[]
  players: string[]
}

export const initialPersistedState = (creatorId: string): PersistedState => ({
  rolls: [],
  title: '',
  rollConfig: bladesInTheDarkConfig,
  owners: [creatorId],
  players: [],
})

export const initialLoadedGameState = (persistedState: PersistedState): LoadedGameState => ({
  kind: 'LoadedGameState',
  ...persistedState,
  mode: 'Roll',
})

export const initialGameState: LoadingGameState = {
  kind: 'LoadingGameState',
}
