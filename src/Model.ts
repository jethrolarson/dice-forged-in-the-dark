import { GameSettingsView, GameView } from './Models/GameModel'
import { LoginView } from './LoginModel'

export interface AppState {
  view: View
  games: Array<{ id: string; title: string }>
}

export interface Error404View {
  kind: 'Error404View'
}

export const error404View: Error404View = {
  kind: 'Error404View',
}

export interface DefaultView {
  kind: 'DefaultView'
}

export const defaultView: DefaultView = {
  kind: 'DefaultView',
}

export type View = Error404View | DefaultView | GameView | GameSettingsView | LoginView

export const initialState = (view: View): AppState => ({
  view,
  games: [],
})
