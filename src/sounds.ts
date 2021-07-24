export const getSound = (filename: string): (() => Promise<HTMLAudioElement>) =>
  ((): (() => Promise<HTMLAudioElement>) => {
    let loadingAudio = false
    let diceAudioEl: HTMLAudioElement
    return (): Promise<HTMLAudioElement> => {
      diceAudioEl = new Audio(filename)
      diceAudioEl.volume = 0.4
      return new Promise<HTMLAudioElement>((resolve) => {
        if (!loadingAudio) {
          loadingAudio = true
          diceAudioEl.addEventListener('canplaythrough', () => {
            resolve(diceAudioEl)
          })
        }
        return resolve(diceAudioEl)
      })
    }
  })()

export const getRollSound = getSound('communication-channel-519.mp3')
export const getWinSound = getSound('win.mp3')
export const getWarnSound = getSound('warn.mp3')
export const getCritSound = getSound('crit.mp3')
export const getMessageSound = getSound('message.mp3')
export const getAddSound = getSound('addSound.mp3')

const playSound = (filename: string): Promise<void> => getSound(filename)().then((s: HTMLAudioElement) => s.play())

export const playAddSound = (): Promise<void> => playSound('addSound.mp3')
