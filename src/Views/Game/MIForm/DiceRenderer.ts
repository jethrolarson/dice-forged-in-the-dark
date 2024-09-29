import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Dice from './Dice'
import { TaskManager } from './TaskManager'

export class DiceRenderer {
  dice: Dice
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private movementPlane: THREE.Mesh
  private scene: THREE.Scene
  constructor(element: HTMLElement, onRoll: (results: number[]) => unknown) {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x000000, 500, 1000)

    this.camera = new THREE.PerspectiveCamera(50, element.clientWidth / element.clientHeight, 0.1, 2000)
    this.camera.position.set(0, 10, -7)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0.4))
    this.scene.add(this.camera)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(element.clientWidth, element.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(this.scene.fog.color)
    element.appendChild(this.renderer.domElement)

    // Lights
    this.setupLights()

    const solver = new CANNON.GSSolver()
    solver.iterations = 20 // Higher iterations for more accuracy
    solver.tolerance = 0.001 // Adjust the tolerance for the solver

    // Physics World
    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -20, 0),
      broadphase: new CANNON.NaiveBroadphase(),
      allowSleep: true,
      solver,
    })

    // Floor
    const floor = createFloor(world)
    this.scene.add(floor)

    // Movement Plane (for dragging dice)
    this.movementPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    this.movementPlane.rotateX(-Math.PI / 2) // Set it horizontal
    this.movementPlane.position.set(0, 2.5, 0) // Start slightly above the floor
    this.scene.add(this.movementPlane)
    // Materials
    const groundMaterial = new CANNON.Material('groundMaterial')
    const diceMaterial = new CANNON.Material('diceMaterial')

    world.addContactMaterial(
      new CANNON.ContactMaterial(diceMaterial, groundMaterial, {
        friction: 0.00001, // Adjusted friction
        restitution: 0.1, // Adjusted restitution (bounciness),
      }),
    )

    const boxWidth = 8.6
    const boxLength = 12.6
    createCubeConstraints(boxWidth, boxLength, 14, world, diceMaterial, this.scene)

    const taskManager = new TaskManager()
    const meshSyncManager = new TaskManager()
    // Dice
    this.dice = new Dice({
      diceMaterial,
      world,
      scene: this.scene,
      camera: this.camera,
      taskManager,
      onRoll,
      boxWidth,
      boxLength,
    })
    meshSyncManager.addTask(this.dice.syncMeshes)

    let previousTime = performance.now()

    const animate = () => {
      // Calculate the time elapsed between frames (delta)
      const currentTime = performance.now()
      const delta = currentTime - previousTime // Convert to seconds
      previousTime = currentTime
      world.fixedStep()
      // Run all tasks in the update manager with delta
      taskManager.update(delta)
      meshSyncManager.update(delta)
      // Render the scene
      this.renderer.render(this.scene, this.camera)

      // Request the next frame
      requestAnimationFrame(animate)
    }

    animate()
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xaaaaaa)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10)
    directionalLight.position.set(-40, 40, 40)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
  }

  // Handle pointer down (when clicking on dice)
  onPointerDown = (event: PointerEvent) => {
    if (!this.dice) return

    this.dice.clickDie(event, event.clientX, event.clientY, this.movementPlane)
  }

  onPointerUp = (event: PointerEvent) => {
    this.dice.onPointerUp(event)
  }

  // Handle window resize
  onResize = () => {
    const { clientHeight, clientWidth } = this.renderer.domElement
    this.camera.aspect = clientWidth / clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight)
  }

  // Handle pointer move (for dragging the dice)
  onPointerMove = (event: PointerEvent) => {
    this.dice.move(
      event.clientX,
      event.clientY,
      this.camera,
      this.renderer.domElement.getBoundingClientRect(),
      this.movementPlane,
    )
  }
}

// Helper functions
export const createFloor = (world: CANNON.World) => {
  const floorGeometry = new THREE.PlaneGeometry(100, 100)
  floorGeometry.rotateX(-Math.PI / 2)
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x2d173f })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.receiveShadow = true

  const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() })
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(floorBody)

  return floor
}

export const createCubeConstraints = (
  width: number, // Width along the Z-axis
  length: number, // Length along the X-axis
  height: number, // Height of the walls
  world: CANNON.World,
  diceMaterial: CANNON.Material,
  scene: THREE.Scene,
) => {
  const wallThickness = 0.1 // A smaller value to reduce gap issues
  const wallMaterial = new CANNON.Material('wallMaterial')

  // Low friction contact material between dice and walls
  const lowFrictionContactMaterial = new CANNON.ContactMaterial(wallMaterial, diceMaterial, {
    friction: 0.00001, // Low friction value
    restitution: 0.3, // Adjusted for realistic bounce
  })
  world.addContactMaterial(lowFrictionContactMaterial)

  const createBoxWall = (position: CANNON.Vec3, dimensions: CANNON.Vec3, color = 0xffffff) => {
    const wallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
    const wallShape = new CANNON.Box(dimensions)
    wallBody.addShape(wallShape)
    wallBody.position.copy(position)
    world.addBody(wallBody)

    // Visual Wireframe Wall
    const geometry = new THREE.BoxGeometry(dimensions.x * 2, dimensions.y * 2, dimensions.z * 2)
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)

    wireframe.position.copy(position)
    scene.add(wireframe)
  }

  const h = height / 2
  // Back Wall (Z = -width / 2)
  createBoxWall(new CANNON.Vec3(0, h, -length / 2), new CANNON.Vec3(width / 2, h, wallThickness))

  // Front Wall (Z = width / 2)
  createBoxWall(new CANNON.Vec3(0, h, length / 2), new CANNON.Vec3(width / 2, h, wallThickness))

  // Left Wall (X = -length / 2)
  createBoxWall(new CANNON.Vec3(-width / 2, h, 0), new CANNON.Vec3(wallThickness, h, length / 2))

  // Right Wall (X = length / 2)
  createBoxWall(new CANNON.Vec3(width / 2, h, 0), new CANNON.Vec3(wallThickness, h, length / 2))

  // Roof (Y = height)
  createBoxWall(new CANNON.Vec3(0, height, 0), new CANNON.Vec3(width / 2, wallThickness, length / 2))
}
