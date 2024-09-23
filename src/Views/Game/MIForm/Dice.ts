import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EdgeSplitModifier } from 'three/examples/jsm/modifiers/EdgeSplitModifier'

type DiceData = {
  bodies: CANNON.Body[]
  meshes: THREE.Object3D<THREE.Object3DEventMap>[]
  joints: CANNON.Body[]
}

// Create the loader
const loader = new GLTFLoader()

class Dice {
  diceMaterial: CANNON.Material
  world: CANNON.World
  scene: THREE.Scene
  diceData: DiceData = {
    bodies: [],
    joints: [],
    meshes: [],
  }
  checkInterval: NodeJS.Timeout | null = null

  constructor(diceMaterial: CANNON.Material, world: CANNON.World, scene: THREE.Scene) {
    this.diceMaterial = diceMaterial
    this.world = world
    this.scene = scene
    this.createDice()
  }

  private createDice() {
    const dieSize: CANNON.Vec3 = new CANNON.Vec3(1, 1, 1)
    const positions: CANNON.Vec3[] = [new CANNON.Vec3(0, 1, 0)]

    loader.load(
      'dice_model.glb',
      (gltf) => {
        const model = gltf.scene

        // // Add axes helper to visualize orientation
        // const axesHelper = new THREE.AxesHelper(5)
        // this.scene.add(axesHelper)
        // Compute the bounding box of the model
        const boundingBox = new THREE.Box3().setFromObject(model)

        // Get the center of the bounding box
        const center = boundingBox.getCenter(new THREE.Vector3())

        // Subtract the center to move the model's geometry to the origin
        model.position.sub(center)

        model.scale.set(0.5, 0.5, 0.5)

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })

        // For each dice position, clone the model and create the CANNON body
        positions.forEach((pos) => {
          const clonedModel = model.clone()
          clonedModel.position.copy(pos)
          this.scene.add(clonedModel) // Add to the scene
          this.diceData.meshes.push(clonedModel)
          // Create a CANNON physics body for the dice
          const diceBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(dieSize.scale(0.5)), // Scale the box shape to match the model size
            material: this.diceMaterial,
            angularDamping: 0.01,
            linearDamping: 0.01,
          })
          diceBody.position.copy(pos)
          diceBody.angularVelocity.setZero()
          diceBody.velocity.setZero()

          this.diceData.bodies.push(diceBody)
          diceBody.updateMassProperties()
          this.world.addBody(diceBody)

          // Add a joint for physics interaction
          const jointShape = new CANNON.Sphere(0.1)
          const jointBody = new CANNON.Body({ mass: 0 })
          jointBody.addShape(jointShape)
          jointBody.collisionFilterGroup = 0
          jointBody.collisionFilterMask = 0
          this.world.addBody(jointBody)
          this.diceData.joints.push(jointBody)
        })
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
      },
    )
  }

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

  getHitDie(
    clientX: number,
    clientY: number,
    camera: THREE.Camera,
    rect: DOMRect,
  ): [THREE.Vector3, CANNON.Body, CANNON.Body] | null {
    if (!this.diceData) return null
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    for (let i = 0; i < this.diceData.meshes.length; i++) {
      const hits = raycaster.intersectObject(this.diceData.meshes[i]!)
      if (hits.length > 0 && hits[0]) return [hits[0].point, this.diceData.bodies[i]!, this.diceData.joints[i]!]
    }
    return null
  }

  syncMeshes() {
    for (let i = 0; i < this.diceData.bodies.length; i++) {
      this.diceData.meshes[i]!.position.copy(this.diceData.bodies[i]!.position)
      this.diceData.meshes[i]!.quaternion.copy(this.diceData.bodies[i]!.quaternion)
    }
  }
}

export default Dice
