// TODO replace with SoundManager
export const getSound = (filename: string): Promise<HTMLAudioElement> => {
  const diceAudioEl = new Audio(filename)
  diceAudioEl.volume = 0.4
  return new Promise<HTMLAudioElement>((resolve) => {
    diceAudioEl.addEventListener('canplaythrough', () => {
      resolve(diceAudioEl)
    })
  })
}

const rollSound = getSound('communication-channel-519.mp3')
const winSound = getSound('win.mp3')
const warnSound = getSound('warn.mp3')
const critSound = getSound('crit.mp3')
const messageSound = getSound('message.mp3')
const addSound = getSound('addSound.mp3')

const playSound = (sound: Promise<HTMLAudioElement>) => (): Promise<void> =>
  sound.then((s: HTMLAudioElement) => s.play())

export const playRollSound = playSound(rollSound)
export const playWinSound = playSound(winSound)
export const playWarnSound = playSound(warnSound)
export const playCritSound = playSound(critSound)
export const playMessageSound = playSound(messageSound)
export const playAddSound = playSound(addSound)
