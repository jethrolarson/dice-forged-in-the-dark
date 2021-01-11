import * as O from 'fp-ts/lib/Option'

export interface LoginView {
  kind: 'LoginView'
}
export const loginView: LoginView = {
  kind: 'LoginView',
}

export const loginPath = (path: string): O.Option<LoginView> => (path === 'login' ? O.some(loginView) : O.none)
