import { GameView } from './GameModel'

export type AppState = {
  view: View
  games: { id: string; title: string }[]
}

export interface Error404View {
  kind: 'Error404View'
}

export const error404View: Error404View = {
  kind: 'Error404View'
}

export interface DefaultView {
  kind: 'DefaultView'
}

export const defaultView: DefaultView = {
  kind: 'DefaultView'
}

export type View = Error404View | DefaultView | GameView

export const initialState = (view: View): AppState => ({
  view,
  games: []
})
