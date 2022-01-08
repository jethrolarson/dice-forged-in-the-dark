import { ColorHelper } from 'csx'
import { number } from 'fp-ts'
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

export enum DieType {
  d2 = 'd2',
  d4 = 'd4',
  d6 = 'd6',
  d8 = 'd8',
  d10 = 'd10',
  d12 = 'd12',
  d20 = 'd20',
}

export enum DieColor {
  white = '#92d2d0',
  yellow = 'hsl(31, 100%, 64%)',
  red = 'hsl(0, 60%, 50%)',
  green = 'hsl(149, 59%, 55%)',
  purple = 'hsl(230, 65%, 64%)',
}

export interface DieResult {
  dieColor: ColorHelper
  dieType: DieType
  value: number
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

export type Point = [number, number]

export type Paint = Line // | circle | square | text | Path

export interface Line extends LogItemCommon {
  kind: 'Paint'
  paintType: 'line'
  coords: [x1: number, y1: number, x2: number, y2: number]
  color: string
  width: number
}

export type LogItem = RollResult | Message | Paint

export interface LoadedGameState extends PersistedState {
  readonly kind: 'LoadedGameState'
  rollsLoaded: boolean
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
  rollsLoaded: false,
})

export const initialGameState: LoadingGameState = {
  kind: 'LoadingGameState',
}
