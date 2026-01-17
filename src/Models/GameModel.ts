import { DieResult } from './Die'
import { RollConfig, ValuationType } from './RollConfig'
import { presets } from './rollConfigPresets'

export interface GameView {
  kind: 'GameView'
  id: string
}

export interface GameSettingsView {
  kind: 'GameSettingsView'
  id: string
}

interface LogItemCommon {
  user: string
  username: string // this is actually character but we can't change for legacy reasons
  note: string
  date: number
  id: string
  uid: string
  redacted?: boolean
}

export interface RollResult extends LogItemCommon {
  kind: 'Roll'
  lines: string[]
  diceRolled: DieResult[]
  isZero: boolean
  rollType: string
  valuationType: ValuationType
}

export interface Message extends LogItemCommon {
  kind: 'Message'
}

export interface Line extends LogItemCommon {
  kind: 'Paint'
  paintType: 'line'
  coords: [x1: number, y1: number, x2: number, y2: number]
  color: string
  width: number
}

export type LogItem = RollResult | Message

export interface LoadedGameState extends PersistedState {
  readonly kind: 'LoadedGameState'
  rollsLoaded: boolean
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
  miroId: string
  theme: string
  system: string
}

export const initialPersistedState = (creatorId: string): PersistedState => ({
  rolls: [],
  title: '',
  rollConfig: presets[0],
  owners: [creatorId],
  players: [],
  miroId: '',
  system: '',
  theme: '',
})

export enum Theme {
  Future = 'Future',
  Future2 = 'Future2',
  Simple = 'Simple',
}

export const defaultTheme = Theme.Future2

export const initialLoadedGameState = (persistedState: PersistedState): LoadedGameState => ({
  kind: 'LoadedGameState',
  ...persistedState,
  rollsLoaded: false,
  miroId: persistedState.miroId ?? '',
  theme: persistedState.theme ?? defaultTheme,
})

export const initialGameState: LoadingGameState = {
  kind: 'LoadingGameState',
}
