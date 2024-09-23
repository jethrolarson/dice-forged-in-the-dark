import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { vector3ToVec3 } from './gfx_util'

type DiceData = {
  bodies: CANNON.Body[]
  meshes: THREE.Object3D<THREE.Object3DEventMap>[]
}

// Create the loader
const loader = new GLTFLoader()

class Dice {
  diceMaterial: CANNON.Material
  world: CANNON.World
  scene: THREE.Scene
  diceData: DiceData = {
    bodies: [],
    meshes: [],
  }
  jointBody: CANNON.Body | null = null
  jointConstraint: CANNON.PointToPointConstraint | null = null
  checkInterval: NodeJS.Timeout | null = null

  constructor(diceMaterial: CANNON.Material, world: CANNON.World, scene: THREE.Scene) {
    this.diceMaterial = diceMaterial
    this.world = world
    this.scene = scene
    this.createDice()
    this.createJointBody() // Joint body for dragging
  }

  private createDice() {
    const dieSize: CANNON.Vec3 = new CANNON.Vec3(1, 1, 1)
    const positions: CANNON.Vec3[] = [new CANNON.Vec3(0, 1, 0)]

    loader.load(
      'dice_model.glb',
      (gltf) => {
        const model = gltf.scene

        // Compute the bounding box and center the model
        const boundingBox = new THREE.Box3().setFromObject(model)
        const center = boundingBox.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.set(0.5, 0.5, 0.5)

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })

        // Clone model for each dice position
        positions.forEach((pos) => {
          const clonedModel = model.clone()
          clonedModel.position.copy(pos)
          this.scene.add(clonedModel)
          this.diceData.meshes.push(clonedModel)

          const diceBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(dieSize.scale(0.5)),
            material: this.diceMaterial,
            angularDamping: 0.1,
            linearDamping: 0.01,
          })
          diceBody.position.copy(pos)
          diceBody.angularVelocity.setZero()
          diceBody.velocity.setZero()

          this.diceData.bodies.push(diceBody)
          diceBody.updateMassProperties()
          this.world.addBody(diceBody)
        })
      },
      undefined,
      (error) => console.error('Error loading model:', error),
    )
  }

  private createJointBody() {
    const jointShape = new CANNON.Sphere(0.1)
    this.jointBody = new CANNON.Body({ mass: 0 })
    this.jointBody.addShape(jointShape)
    this.jointBody.collisionFilterGroup = 0
    this.jointBody.collisionFilterMask = 0
    this.world.addBody(this.jointBody)
  }

  addJointConstraint(diceBody: CANNON.Body) {
    if (!this.jointBody) return

    const pivot = new CANNON.Vec3(0, 0, 0) // Center of dice
    this.jointBody.position.copy(diceBody.position)
    this.jointConstraint = new CANNON.PointToPointConstraint(diceBody, pivot, this.jointBody, new CANNON.Vec3(0, 0, 0))
    this.world.addConstraint(this.jointConstraint)
  }

  removeJointConstraint() {
    if (this.jointConstraint) {
      this.world.removeConstraint(this.jointConstraint)
      this.jointConstraint = null
    }
  }

  moveJoint(position: CANNON.Vec3) {
    if (!this.jointBody || !this.jointConstraint) return

    const movementVector = new CANNON.Vec3().copy(position).vsub(this.jointBody.position)
    const angularVelocity = this.jointBody.angularVelocity

    if (angularVelocity.lengthSquared() > 0) {
      console.log('h')

      const projection = this.projectOnVector(movementVector, angularVelocity)
      const scaleFactor = 50000
      const torque = projection.scale(scaleFactor)
      this.jointBody.applyTorque(torque)
    } else {
      this.applyRandomAngularVelocityIfZero()
    }

    this.jointBody.position.copy(position)
    this.jointConstraint.update()
  }

  projectOnVector(vector: CANNON.Vec3, onto: CANNON.Vec3): CANNON.Vec3 {
    const dotProduct = vector.dot(onto)
    const ontoLengthSquared = onto.lengthSquared()
    return ontoLengthSquared === 0 ? new CANNON.Vec3(0, 0, 0) : onto.scale(dotProduct / ontoLengthSquared)
  }

  applyRandomAngularVelocityIfZero() {
    if (this.jointBody && this.jointBody.angularVelocity.lengthSquared() < 0.01) {
      const randomAngularVelocity = new CANNON.Vec3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
      )
      this.jointBody.angularVelocity.set(randomAngularVelocity.x, randomAngularVelocity.y, randomAngularVelocity.z)
    }
  }

  syncMeshes() {
    for (let i = 0; i < this.diceData.bodies.length; i++) {
      this.diceData.meshes[i]!.position.copy(this.diceData.bodies[i]!.position)
      this.diceData.meshes[i]!.quaternion.copy(this.diceData.bodies[i]!.quaternion)
    }
  }

  getHitDie(clientX: number, clientY: number, camera: THREE.Camera, rect: DOMRect): [CANNON.Body, CANNON.Vec3] | null {
    if (!this.diceData) return null
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    for (let i = 0; i < this.diceData.meshes.length; i++) {
      if (raycaster.intersectObject(this.diceData.meshes[i]!).length) {
        return [this.diceData.bodies[i]!, vector3ToVec3(raycaster.ray.direction)]
      }
    }
    return null
  }
}

export default Dice


  //   rollDice() {
  //     // Reset dice positions and apply random forces
  //     for (let diceBody of this.diceData.bodies) {
  //       diceBody.velocity.setZero()
  //       diceBody.angularVelocity.setZero()
  //       diceBody.wakeUp()

  //       const forceMagnitude = 10
  //       const torqueMagnitude = 2
  //       const force = new CANNON.Vec3((Math.random() - 0.1) * forceMagnitude, 3, (Math.random() - 0.1) * forceMagnitude)
  //       const torque = new CANNON.Vec3(
  //         (Math.random() - 0.8) * torqueMagnitude,
  //         (Math.random() - 0.8) * torqueMagnitude,
  //         (Math.random() - 0.8) * torqueMagnitude,
  //       )

  //       diceBody.applyImpulse(force, diceBody.position)
  //       diceBody.applyTorque(torque)
  //     }

  //     if (this.checkInterval) clearInterval(this.checkInterval)
  //     this.checkInterval = setInterval(() => this.checkDiceStopped(), 100)
  //   }

  //   private checkDiceStopped() {
  //     let allStopped = true
  //     for (let diceBody of this.diceData.bodies) {
  //       const speed = diceBody.velocity.length()
  //       const angularSpeed = diceBody.angularVelocity.length()
  //       if (speed > 0.05 || angularSpeed > 0.05) {
  //         allStopped = false
  //         break
  //       }
  //     }

  //     if (allStopped) {
  //       if (this.checkInterval) clearInterval(this.checkInterval)
  //       this.determineDiceResults()
  //     }
  //   }

  //   private determineDiceResults() {
  //     return this.diceData.meshes.map((diceMesh) => this.getFaceValue(diceMesh))
  //   }

  //   private getFaceValue(diceMesh: THREE.Object3D<THREE.Object3DEventMap>): number | null {
  //     const up = new THREE.Vector3(0, 1, 0)
  //     up.applyQuaternion(diceMesh.quaternion)

  //     const tolerance = 0.1
  //     if (Math.abs(up.y - 1) < tolerance) return 1
  //     if (Math.abs(up.y + 1) < tolerance) return 6
  //     if (Math.abs(up.x - 1) < tolerance) return 3
  //     if (Math.abs(up.x + 1) < tolerance) return 4
  //     if (Math.abs(up.z - 1) < tolerance) return 2
  //     if (Math.abs(up.z + 1) < tolerance) return 5

  //     return 0
  //   }
  

