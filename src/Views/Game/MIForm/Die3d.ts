import React, { useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Triplet, useBox } from '@react-three/cannon'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { e } from '../../../util'

interface DiceProps {
  position: Triplet
  args: Triplet
  color: string
  rollTrigger: number
  onRollComplete: (value: number) => void
}

const Dice: React.FC<DiceProps> = ({ position, args, color, rollTrigger, onRollComplete }) => {
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    mass: 1,
    position,
    args,
    linearDamping: 0.9, // Increased linear damping
    angularDamping: 1, // Increased angular damping
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 0.5,
    allowSleep: true,
  }))

  const [rolling, setRolling] = useState(false)

  const getFaceValue = React.useCallback(() => {
    if (!ref.current) return null

    const up = new THREE.Vector3(0, 1, 0)
    up.applyQuaternion(ref.current.quaternion)

    const tolerance = 0.1

    if (Math.abs(up.y - 1) < tolerance) return 1
    if (Math.abs(up.y + 1) < tolerance) return 6
    if (Math.abs(up.x - 1) < tolerance) return 3
    if (Math.abs(up.x + 1) < tolerance) return 4
    if (Math.abs(up.z - 1) < tolerance) return 2
    if (Math.abs(up.z + 1) < tolerance) return 5

    return null
  }, [ref])
  useEffect(() => {
    // Reset position and rotation
    api.position.set(position[0], position[1], position[2])
    api.rotation.set(0, 0, 0)

    // Apply minimal force and torque
    const forceMagnitude = 1 // Further reduced value
    const torqueMagnitude = 0.5 // Further reduced value

    const force: Triplet = [
      (Math.random() - 0.5) * forceMagnitude,
      Math.random() * 2 + 2,
      (Math.random() - 0.5) * forceMagnitude,
    ]
    const torque: Triplet = [
      (Math.random() - 0.5) * torqueMagnitude,
      (Math.random() - 0.5) * torqueMagnitude,
      (Math.random() - 0.5) * torqueMagnitude,
    ]

    api.velocity.set(force[0], force[1], force[2])
    api.angularVelocity.set(torque[0], torque[1], torque[2])
    setRolling(true)
  }, [rollTrigger, api, position])

  useFrame(() => {
    if (!rolling || !ref.current) return

    // Access the physics body
    const body = ref.current.userData as { body: CANNON.Body }
    if (!body.body) return

    const velocity = body.body.velocity
    const angularVelocity = body.body.angularVelocity

    const speed = velocity.length()
    const angularSpeed = angularVelocity.length()

    if (speed < 0.1 && angularSpeed < 0.1) {
      setRolling(false)
      const faceValue = getFaceValue()
      console.log('Dice result:', faceValue)
      if (faceValue !== null) {
        onRollComplete(faceValue)
      }
    }
  })

  return e(
    'mesh',
    { ref: ref, castShadow: true, receiveShadow: true },
    e('boxGeometry', { args: args }),
    e('meshStandardMaterial', { color: color }),
  )
}

export default Dice
