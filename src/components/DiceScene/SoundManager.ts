export class SoundManager {
  private audioBuffer: AudioBuffer | null = null
  private audioContext: AudioContext
  private soundDuration: number
  private scale: number

  constructor(
    private audioFileUrl: string,
    soundDuration: number,
    scale: number,
  ) {
    this.audioContext = new window.AudioContext()
    this.soundDuration = soundDuration
    this.scale = scale
  }

  // Load and decode the audio file
  async loadAudio() {
    const response = await fetch(this.audioFileUrl)
    const arrayBuffer = await response.arrayBuffer()
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
  }

  // Play a specific sound slice by its index (0-based) at a specific position
  playSound(index: number, volume: number, position: { x: number; y: number; z: number }) {
    if (!this.audioBuffer) {
      console.error('Audio file not loaded yet!')
      return
    }

    const startTime = index * this.soundDuration
    const duration = this.soundDuration

    const soundSource = this.audioContext.createBufferSource()
    soundSource.buffer = this.audioBuffer

    // Create a gain node for volume control
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = volume

    // Create a panner node for 3D positioning
    const panner = this.audioContext.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = 1
    panner.maxDistance = 10000
    panner.rolloffFactor = 1
    panner.coneInnerAngle = 360
    panner.coneOuterAngle = 0
    panner.coneOuterGain = 0

    // Apply scaling to the position
    const scaledPosition = {
      x: position.x * this.scale,
      y: position.y * this.scale,
      z: position.z * this.scale,
    }

    // Set the position of the panner node
    panner.positionX.setValueAtTime(scaledPosition.x, this.audioContext.currentTime)
    panner.positionY.setValueAtTime(scaledPosition.y, this.audioContext.currentTime)
    panner.positionZ.setValueAtTime(scaledPosition.z, this.audioContext.currentTime)

    // Connect nodes and start playing sound
    soundSource.connect(gainNode)
    gainNode.connect(panner)
    panner.connect(this.audioContext.destination)
    soundSource.start(0, startTime, duration)
  }

  // Update the listener's position and orientation to match the camera
  updateListenerPosition(
    position: { x: number; y: number; z: number },
    forward: { x: number; y: number; z: number },
    up: { x: number; y: number; z: number },
  ) {
    const listener = this.audioContext.listener

    // Apply scaling to the listener's position
    const scaledPosition = {
      x: position.x * this.scale,
      y: position.y * this.scale,
      z: position.z * this.scale,
    }

    listener.positionX.setValueAtTime(scaledPosition.x, this.audioContext.currentTime)
    listener.positionY.setValueAtTime(scaledPosition.y, this.audioContext.currentTime)
    listener.positionZ.setValueAtTime(scaledPosition.z, this.audioContext.currentTime)

    // Orientation vectors are directional and should not be scaled
    listener.forwardX.setValueAtTime(forward.x, this.audioContext.currentTime)
    listener.forwardY.setValueAtTime(forward.y, this.audioContext.currentTime)
    listener.forwardZ.setValueAtTime(forward.z, this.audioContext.currentTime)

    listener.upX.setValueAtTime(up.x, this.audioContext.currentTime)
    listener.upY.setValueAtTime(up.y, this.audioContext.currentTime)
    listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime)
  }

  // Method to adjust the scaling factor
  setScale(scale: number) {
    this.scale = scale
  }
}
