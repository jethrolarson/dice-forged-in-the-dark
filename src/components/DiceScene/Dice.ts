import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import {
  createInvertedColorMaterial,
  loadModel,
  mapValue,
  randomInt,
  randomSpin,
  randomWithin,
  setRandomRotation,
} from './gfx_util'

import { Task, TaskManager } from '../../Views/Game/MIForm/TaskManager'
import { SoundManager } from './SoundManager'

const dieSize: CANNON.Vec3 = new CANNON.Vec3(1, 1, 1)
const randomDiePosition = (width: number, length: number): CANNON.Vec3 =>
  new CANNON.Vec3(randomWithin(-(width / 2), width / 2), 6, randomWithin(-(length / 2), length / 2))

export interface DiceParams {
  diceMaterial: CANNON.Material
  world: CANNON.World
  scene: THREE.Scene
  camera: THREE.Camera
  taskManager: TaskManager
  onRoll: (results: { value: number; color: number }[]) => unknown
  boxWidth: number
  boxLength: number
}

interface GameObject {
  syncMeshes: Task
}

interface DieData {
  body: CANNON.Body
  mesh: THREE.Mesh
  color: number
  id: string
  rolled: boolean
}

export class Dice implements GameObject {
  dice: DieData[] = []
  jointBody: CANNON.Body | null = null
  jointConstraint: CANNON.PointToPointConstraint | null = null

  private diceMaterial: CANNON.Material
  private world: CANNON.World
  private scene: THREE.Scene
  private camera: THREE.Camera
  private taskManager: TaskManager

  private boxWidth: number
  private boxLength: number
  private onRoll: DiceParams['onRoll']
  private playBox: CANNON.AABB

  private diceHitSounds: SoundManager
  constructor({ diceMaterial, world, scene, camera, taskManager, onRoll, boxWidth, boxLength }: DiceParams) {
    this.diceMaterial = diceMaterial
    this.world = world
    this.scene = scene
    this.camera = camera
    this.taskManager = taskManager
    this.onRoll = onRoll
    this.boxWidth = boxWidth - 1.6
    this.boxLength = boxLength - 2
    loadModel('/free_dice_model_d6_mid-poly_4k.glb')
    this.createJointBody() // Joint body for dragging
    this.playBox = this.createPlayBox(boxWidth, boxLength)

    this.diceHitSounds = new SoundManager('dice_sounds.ogg', 1, 1)
    this.diceHitSounds.loadAudio()
    const cameraForward = new THREE.Vector3()
    this.camera.getWorldDirection(cameraForward)
    const cameraUp = this.camera.up
    this.diceHitSounds.updateListenerPosition(camera.position, cameraForward, cameraUp)
  }

  private createPlayBox(boxWidth: number, boxLength: number) {
    const playBox = new CANNON.AABB({
      lowerBound: new CANNON.Vec3(-boxWidth / 2, 0, -boxLength / 2), // min point
      upperBound: new CANNON.Vec3(boxWidth / 2, 20, boxLength / 2), // max point
    })
    const scaleFactor = 1.5 // Scale box up so that collisions don't count as OOB

    // Compute half extents and scale the bounds
    const halfExtents = playBox.upperBound.vsub(playBox.lowerBound).scale(0.5 * scaleFactor)

    // Update lower and upper bounds
    const center = playBox.lowerBound.vadd(playBox.upperBound).scale(0.5)
    playBox.lowerBound = center.vsub(halfExtents)
    playBox.upperBound = center.vadd(halfExtents)
    this.taskManager.addTask(this.checkDiceBoundsTask)
    return playBox
  }
  public async addDie(color: number, id?: string): Promise<string> {
    const existingDie = id && this.dice.find((m) => m.id === id)
    if (existingDie) {
      if (color) (existingDie.mesh.material as THREE.MeshStandardMaterial).color.set(color)
      return id
    }
    const mesh = findMesh(await loadModel('/free_dice_model_d6_mid-poly_4k.glb'))
    if (!mesh) throw Error('failed to load dice mesh')
    // Compute the bounding box and center the model
    const boundingBox = new THREE.Box3().setFromObject(mesh)
    const center = boundingBox.getCenter(new THREE.Vector3())
    mesh.position.sub(center)
    mesh.scale.setScalar(0.5)

    mesh.castShadow = true
    mesh.receiveShadow = true
    const originalMaterial = mesh.material as THREE.MeshStandardMaterial
    const clonedModel = mesh.clone()
    if (color === 0x0) {
      clonedModel.material = createInvertedColorMaterial(originalMaterial.map!)
    } else {
      const adjustedMaterial = originalMaterial.clone()
      adjustedMaterial.color.set(color)
      clonedModel.material = adjustedMaterial
    }
    if (id) clonedModel.uuid = id
    const position = randomDiePosition(this.boxWidth, this.boxLength)
    clonedModel.position.copy(position)

    this.scene.add(clonedModel)

    const diceBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(dieSize.scale(0.5)),
      material: this.diceMaterial,
      angularDamping: 0.0,
      linearDamping: 0.01,
    })
    diceBody.position.copy(position)
    setRandomRotation(diceBody)
    const die = {
      mesh: clonedModel,
      body: diceBody,
      id: clonedModel.uuid,
      color,
      rolled: false,
    }
    this.dice.push(die)

    diceBody.addEventListener('collide', this.handleCollision)

    this.world.addBody(diceBody)
    return clonedModel.uuid
  }

  private handleCollision = (event: { body: CANNON.Body; target: CANNON.Body }) => {
    const collidedBody = event.body
    const die = this.dice.find((d) => d.body === event.target)
    if (!die) throw Error('collided die doesnt exist?')

    const isDiceCollision = this.dice.some((die) => die.body === collidedBody)
    // Trigger side effects for hitting a surface
    this.triggerCollisionEffect(die, isDiceCollision)
  }

  private lastSound = 0
  private triggerCollisionEffect(die: DieData, isDiceCollision: boolean) {
    const impactStrength = die.body.velocity.length()
    const now = performance.now()
    if (impactStrength < 3 || now - this.lastSound < 16) return
    this.lastSound = now
    const maxImpact = 120
    const volume = isDiceCollision
      ? mapValue(impactStrength, 0, maxImpact, 0, 10)
      : mapValue(impactStrength, 0, maxImpact, 0, 2)

    // Get the die's position
    const position = die.body.position

    // Convert position to a plain object if necessary
    const diePosition = { x: position.x, y: position.y, z: position.z }
    const soundIndex = isDiceCollision ? randomInt(10, 11) : randomInt(0, 2)
    // Play the sound at the die's position
    this.diceHitSounds.playSound(soundIndex, volume, diePosition)
  }

  private createJointBody() {
    const jointShape = new CANNON.Sphere(0.1)
    this.jointBody = new CANNON.Body({ mass: 0 })
    this.jointBody.addShape(jointShape)
    this.jointBody.collisionFilterGroup = 0
    this.jointBody.collisionFilterMask = 0
    this.world.addBody(this.jointBody)
  }

  private addJointConstraint(diceBody: CANNON.Body) {
    if (!this.jointBody) return

    const pivot = CANNON.Vec3.ZERO.clone() // Center of dice
    this.jointBody.position.copy(diceBody.position)
    this.jointConstraint = new CANNON.PointToPointConstraint(diceBody, pivot, this.jointBody, CANNON.Vec3.ZERO.clone())
    this.world.addConstraint(this.jointConstraint)
  }

  private moveJoint(position: CANNON.Vec3) {
    if (!this.jointBody || !this.jointConstraint) return
    // Clamp the joint position within the play area bounds
    const clampedPosition = new CANNON.Vec3(
      Math.max(-(this.boxWidth / 2), Math.min(this.boxWidth / 2, position.x)),
      position.y,
      Math.max(-(this.boxLength / 2), Math.min(this.boxLength / 2, position.z)),
    )
    // Move the main die
    this.jointBody.position.copy(clampedPosition)
    this.jointConstraint.update()
  }

  isDragging = false

  private diceCheck: Task | null = null
  onPointerDown(event: PointerEvent, x: number, y: number, movementPlane: THREE.Mesh) {
    //prevent double clicks
    if (event.button === 2 || this.isDragging) return
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    // cancel any pending score evaluations
    const resp = this.getHitDie(x, y, rect)
    if (!resp) {
      //bump the table
      this.bump()
      return
    }

    // Let players fiddle with the dice freely if the roll isn't active
    if (this.diceCheck) {
      if (this.disabled) this.diceCheck = null
      else return
    }

    const [die] = resp

    const targetPos = projectMouseToMovementPlane(x, y, rect, this.camera, movementPlane)
    if (targetPos) {
      this.liftDieTowardsCamera(die, targetPos, 150)
    } else console.error('failed to find target')

    this.isDragging = true
  }

  bump() {
    // Generate a random force with X and Z components, and always positive Y component (upward)
    const force = new CANNON.Vec3(randomWithin(-1.5, 1.5), randomWithin(2, 3), randomWithin(-1.5, 1.5))
    this.dice.forEach(({ body }) => {
      body.applyImpulse(force)
    })
  }

  public disabled = true
  disable() {
    this.disabled = true
  }
  enable() {
    this.disabled = false
  }

  onPointerUp(event: PointerEvent) {
    if (event.button === 2) {
      event.preventDefault()
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const hitDie = this.getHitDie(event.clientX, event.clientY, rect)

      if (hitDie) {
        const [_, index] = hitDie
        this.removeByIndex(index)
      }
    } else if (this.jointConstraint) {
      this.isDragging = false

      this.diceCheck = this.taskManager.addInterval(100, this.checkDiceStopped)
      const diceBody = this.jointConstraint.bodyA
      this.orbitingDice.concat([diceBody]).forEach((d) => {
        d.type = CANNON.Body.DYNAMIC
        d.velocity.copy(diceBody.velocity)
        d.applyImpulse(new CANNON.Vec3(0, 4, 0))
        d.applyTorque(randomSpin(150, 220))
      })
      this.orbitingDice = []

      this.world.removeConstraint(this.jointConstraint)
      this.jointConstraint = null
    }
  }

  private currentLiftTask: Task | null = null

  liftDieTowardsCamera(die: DieData, targetPosition: THREE.Vector3, duration: number) {
    const startPosition = die.body.position.clone()
    let startTime: number | null = null

    // If a lift task is already running, remove it
    if (this.currentLiftTask) {
      this.taskManager.removeTask(this.currentLiftTask)
    }

    // Temporarily disable gravity by setting the body type to STATIC
    die.body.type = CANNON.Body.STATIC

    // Define the new lift task
    const liftTask: Task = () => {
      if (startTime === null) startTime = performance.now()
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / duration, 1)

      // Manually interpolate between start and target position
      die.body.position.set(
        THREE.MathUtils.lerp(startPosition.x, targetPosition.x, t),
        THREE.MathUtils.lerp(startPosition.y, targetPosition.y, t),
        THREE.MathUtils.lerp(startPosition.z, targetPosition.z, t),
      )

      // If the animation is complete, reset gravity, remove the task, and apply spin
      if (t >= 1) {
        die.body.type = CANNON.Body.DYNAMIC
        die.rolled = true
        die.body.velocity.set(0, 0, 0) // Reset velocity
        die.body.angularVelocity.set(0, 0, 0) // Reset angular velocity
        die.body.applyTorque(randomSpin(150, 200))
        return true // Task complete
      }

      return false // Continue task
    }

    // Store the task reference for future cancellation
    this.currentLiftTask = liftTask

    // Add the new lift task to the task manager
    this.taskManager.addTask(liftTask)

    // Attach the joint constraint after the die is lifted
    this.addJointConstraint(die.body)
  }

  move(x: number, y: number, camera: THREE.Camera, rect: DOMRect, movementPlane: THREE.Mesh) {
    if (!this.isDragging) return
    const hitPoint = projectMouseToMovementPlane(x, y, rect, camera, movementPlane)

    if (hitPoint) {
      const liftedHitPoint = new CANNON.Vec3(hitPoint.x, Math.max(hitPoint.y + 0.5, 1), hitPoint.z)

      // Move the primary die with the joint
      this.moveJoint(liftedHitPoint)

      // Check for intersections with other dice
      this.collectIntersectedDice(x, y, this.camera, rect)
    }
  }

  private collectIntersectedDice(clientX: number, clientY: number, camera: THREE.Camera, rect: DOMRect) {
    const mouse = normalizeMouse(new THREE.Vector2(clientX, clientY), rect)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const meshes = this.dice.map(({ mesh }) => mesh)
    // Loop through the dice and check for intersections
    const intersected = raycaster.intersectObjects(meshes)
    // If any dice are intersected, add them to the group
    intersected.forEach((intersect) => {
      const mesh = intersect.object as THREE.Mesh
      const index = meshes.indexOf(mesh)
      if (index !== -1 && this.dice[index]) {
        const die = this.dice[index]
        const diceBody = die.body
        if (this.jointConstraint?.bodyA === diceBody || this.orbitingDice.includes(diceBody)) return
        die.rolled = true
        this.pickUpDie(diceBody)
      }
    })
  }
  orbitingDice: CANNON.Body[] = []

  private pickUpDie(diceBody: CANNON.Body) {
    // Temporarily disable gravity by setting the body type to STATIC
    diceBody.type = CANNON.Body.STATIC

    // Add the picked-up dice to the orbiting dice array if it's not already there
    if (!this.orbitingDice.includes(diceBody)) {
      this.orbitingDice.push(diceBody)
    }
    // Start orbiting dice when the first die is picked up
    if (this.orbitingDice.length === 1) {
      this.taskManager.addTask(this.updateOrbitingDice)
    }
  }

  syncMeshes: Task = () => {
    for (const die of this.dice) {
      die.mesh.position.copy(die.body.position)
      die.mesh.quaternion.copy(die.body.quaternion)
    }
    return false // sync forever
  }

  // Method to remove die from scene and physics world
  removeByIndex(index: number) {
    if (index >= 0 && index < this.dice.length) {
      const die = this.dice[index]
      if (!die) throw Error(`no die found to remove at index ${index}`)
      this.dice.splice(index, 1)
      // Remove from physics world
      this.world.removeBody(die.body)

      // Remove from scene
      this.scene.remove(die.mesh)

      // Remove from arrays
    }
  }

  removeDie(id: string) {
    const index = this.dice.findIndex((m) => m.id === id)
    this.removeByIndex(index)
  }

  private getHitDie(clientX: number, clientY: number, rect: DOMRect): [die: DieData, index: number] | null {
    const mouse = normalizeMouse(new THREE.Vector2(clientX, clientY), rect)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)

    for (let i = 0; i < this.dice.length; i++) {
      const die = this.dice[i]
      if (die && raycaster.intersectObject(die.mesh).length > 0) {
        return [die, i]
      }
    }
    return null
  }

  reset() {
    while (this.dice.length) {
      const die = this.dice.pop()!
      this.world.removeBody(die.body)
      this.scene.remove(die.mesh)
      die.body.removeEventListener('collide', this.handleCollision)
    }
  }

  private checkDiceStopped: Task = () => {
    let allStopped = true
    for (const die of this.dice) {
      const speed = die.body.velocity.length()
      const angularSpeed = die.body.angularVelocity.length()
      if (speed > 0.02 || angularSpeed > 0.02 || die.body.position.y > 1.02) {
        allStopped = false
        break
      }
    }

    if (allStopped) {
      const results = this.determineDiceResults()
      if (results.find((r) => r.value === null)) {
        console.info('One or more dice arent level. Try bumping the table.')
        return false
      }

      if (!this.disabled) {
        if (this.dice.every((d) => d.rolled)) {
          setTimeout(() => this.onRoll(results as Parameters<DiceParams['onRoll']>[0]), 500)
        } else {
          alert('not all dice were rolled')
        }
      }
      this.dice.forEach((d) => {
        d.rolled = false
      })
      this.diceCheck = null
      return true
    }
    return false
  }

  private updateOrbitingDice: Task = () => {
    if (!this.orbitingDice.length || !this.jointConstraint) return false // No dice to orbit or no joint constraint

    const centralDice = this.jointConstraint.bodyA // The original dice being moved
    const time = performance.now()

    // Update the position of each orbiting die based on a circular orbit around the central die
    this.orbitingDice.forEach((orbitingDie, index) => {
      const angle = time * 0.005 + (Math.PI * 2 * index) / this.orbitingDice.length // Vary the angle based on time and dice index
      const radius = 1.6 // Set a radius for orbit

      orbitingDie.position.set(
        centralDice.position.x + Math.cos(angle) * radius,
        centralDice.position.y,
        centralDice.position.z + Math.sin(angle) * radius,
      )

      orbitingDie.velocity.set(0, 0, 0) // Ensure the velocity doesn't interfere with the orbit
    })

    return false // Keep this task running
  }

  private determineDiceResults(): { value: number | null; color: number; id: string }[] {
    return this.dice.map(({ mesh, color, id }) => ({
      value: getFaceValue(mesh),
      color,
      id,
    }))
  }

  private checkDiceBoundsTask: Task = () => {
    this.dice.forEach((die) => {
      const { body } = die
      body.updateAABB()
      // Check if the die's AABB is fully contained within the playbox's AABB
      if (!this.playBox.contains(body.aabb)) {
        die.rolled = false
        body.position.copy(randomDiePosition(this.boxWidth, this.boxLength))
        body.velocity.setZero() // Reset linear velocity
        body.angularVelocity.setZero() // Reset angular velocity
      }
    })

    return false // Keep task running
  }
}

function getFaceValue(diceMesh: THREE.Object3D<THREE.Object3DEventMap>): number | null {
  const up = new THREE.Vector3(0, 1, 0) // World "up" vector
  const tolerance = 0.999 // Dot product tolerance for alignment

  // normal vectors for each face of the dice
  const faceNormals = [
    { face: 1, normal: new THREE.Vector3(0, 0, 1) },
    { face: 2, normal: new THREE.Vector3(0, 1, 0) },
    { face: 3, normal: new THREE.Vector3(-1, 0, 0) },
    { face: 4, normal: new THREE.Vector3(1, 0, 0) },
    { face: 5, normal: new THREE.Vector3(0, -1, 0) },
    { face: 6, normal: new THREE.Vector3(0, 0, -1) },
  ]

  // Apply the dice's current rotation (quaternion) to each face normal
  faceNormals.forEach((f) => f.normal.applyQuaternion(diceMesh.quaternion))

  // Find the face whose normal is most aligned with the "up" vector
  for (const { face, normal } of faceNormals) {
    if (up.dot(normal) > tolerance) {
      return face
    }
  }

  // No face is sufficiently aligned with the "up" vector
  return null
}

function projectMouseToMovementPlane(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  camera: THREE.Camera,
  movementPlane: THREE.Mesh,
): THREE.Vector3 | null {
  const mouse = normalizeMouse(new THREE.Vector2(clientX, clientY), rect)
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObject(movementPlane)
  return hits[0] ? hits[0].point : null
}

const normalizeMouse = (mouse: THREE.Vector2, rect: DOMRect) => {
  return new THREE.Vector2(((mouse.x - rect.left) / rect.width) * 2 - 1, -((mouse.y - rect.top) / rect.height) * 2 + 1)
}

export default Dice

const findMesh = (object: THREE.Object3D): THREE.Mesh | null => {
  let foundMesh: THREE.Mesh | null = null
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      foundMesh = child as THREE.Mesh
    }
  })
  return foundMesh
}
