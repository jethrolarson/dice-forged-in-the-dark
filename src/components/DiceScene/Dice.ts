import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
  createInvertedColorMaterial,
  loadModel,
  randomSpin,
  randomWithin,
  setRandomRotation,
  vector3ToVec3,
} from './gfx_util'

import { Task, TaskManager } from '../../Views/Game/MIForm/TaskManager'

type DiceData = {
  bodies: CANNON.Body[]
  meshes: THREE.Mesh[]
}

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
  }
  public async addDie(color: number, id?: string): Promise<string> {
    const existingDie = id && this.dice.find((m) => m.id === id)
    if (existingDie) {
      ;(existingDie.mesh.material as THREE.MeshStandardMaterial).color.set(color)
      return id
    }
    const mesh = findMesh(await loadModel('/free_dice_model_d6_mid-poly_4k.glb'))!

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
    this.dice.push({
      mesh: clonedModel,
      body: diceBody,
      id: clonedModel.uuid,
      color,
    })
    diceBody.updateMassProperties()
    this.world.addBody(diceBody)
    return clonedModel.uuid
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
    if (this.diceCheck) return

    const [die] = resp

    const targetPos = projectMouseToMovementPlane(x, y, rect, this.camera, movementPlane)
    if (targetPos) {
      this.liftDieTowardsCamera(die.body, targetPos, 150)
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

  private disabled = true
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
        d.applyTorque(randomSpin(200, 400))
      })
      this.orbitingDice = []

      this.world.removeConstraint(this.jointConstraint)
      this.jointConstraint = null
    }
  }

  private currentLiftTask: Task | null = null

  liftDieTowardsCamera(diceBody: CANNON.Body, targetPosition: THREE.Vector3, duration: number) {
    const startPosition = diceBody.position.clone()
    let startTime: number | null = null

    // If a lift task is already running, remove it
    if (this.currentLiftTask) {
      this.taskManager.removeTask(this.currentLiftTask)
    }

    // Temporarily disable gravity by setting the body type to STATIC
    diceBody.type = CANNON.Body.STATIC

    // Define the new lift task
    const liftTask: Task = () => {
      if (startTime === null) startTime = performance.now()
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / duration, 1)

      // Manually interpolate between start and target position
      diceBody.position.set(
        THREE.MathUtils.lerp(startPosition.x, targetPosition.x, t),
        THREE.MathUtils.lerp(startPosition.y, targetPosition.y, t),
        THREE.MathUtils.lerp(startPosition.z, targetPosition.z, t),
      )

      // If the animation is complete, reset gravity, remove the task, and apply spin
      if (t >= 1) {
        diceBody.type = CANNON.Body.DYNAMIC
        diceBody.velocity.set(0, 0, 0) // Reset velocity
        diceBody.angularVelocity.set(0, 0, 0) // Reset angular velocity
        diceBody.applyTorque(randomSpin(200, 300))
        return true // Task complete
      }

      return false // Continue task
    }

    // Store the task reference for future cancellation
    this.currentLiftTask = liftTask

    // Add the new lift task to the task manager
    this.taskManager.addTask(liftTask)

    // Attach the joint constraint after the die is lifted
    this.addJointConstraint(diceBody)
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
      if (index !== -1) {
        const diceBody = this.dice[index]!.body
        if (this.jointConstraint?.bodyA === diceBody || this.orbitingDice.includes(diceBody)) return
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
      const die = this.dice[index]!
      const finalize = () => {
        // Remove from physics world
        this.world.removeBody(die.body)

        // Remove from scene
        this.scene.remove(die.mesh)

        // Remove from arrays
        this.dice.splice(index, 1)
      }
      this.taskManager.setTimeout(300, finalize)
      die.body.applyImpulse(new CANNON.Vec3(0, 70, 0))
      die.body.angularVelocity.set(randomWithin(-10, 10), randomWithin(-10, 10), randomWithin(-10, 10))
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
      if (raycaster.intersectObject(this.dice[i]!.mesh).length) {
        return [this.dice[i]!, i]
      }
    }
    return null
  }

  private checkDiceStopped: Task = () => {
    let allStopped = true
    for (let die of this.dice) {
      const speed = die.body.velocity.length()
      const angularSpeed = die.body.angularVelocity.length()
      if (speed > 0.02 || angularSpeed > 0.02 || die.body.position.y > 1.02) {
        allStopped = false
        break
      }
    }

    if (allStopped) {
      // TODO cancel roll and return dice to play mat if dice leave the dice tray
      const results = this.determineDiceResults()
      // TODO add some kind of timeout so that if dice land on end the user isn't softlocked
      if (results.find((r) => r.value === null)) return false
      if (!this.disabled) this.onRoll(results as Parameters<DiceParams['onRoll']>[0])
      console.log(results.map(({ value }) => value))
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

  private determineDiceResults(): { value: number | null; color: number }[] {
    return this.dice.map(({ mesh, color }) => ({
      value: getFaceValue(mesh),
      color,
    }))
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
