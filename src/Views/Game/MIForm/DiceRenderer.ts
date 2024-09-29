import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Dice from './Dice'
import { TaskManager } from './TaskManager'
import { loadTexture } from './gfx_util'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class DiceRenderer {
  dice: Dice
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private movementPlane: THREE.Mesh
  private scene: THREE.Scene
  private world: CANNON.World
  constructor(element: HTMLElement, onRoll: (results: number[]) => unknown) {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x000000, 500, 1000)
    this.camera = this.setupCamera(element.clientWidth / element.clientHeight)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(element.clientWidth, element.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(this.scene.fog.color)
    element.appendChild(this.renderer.domElement)
    // this.debug()
    // Lights
    this.setupLights()

    const solver = new CANNON.GSSolver()
    solver.iterations = 20 // Higher iterations for more accuracy
    solver.tolerance = 0.001 // Adjust the tolerance for the solver

    // Physics World
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -20, 0),
      broadphase: new CANNON.NaiveBroadphase(),
      allowSleep: true,
      solver,
    })

    // Floor
    this.createFloor()

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

    this.world.addContactMaterial(
      new CANNON.ContactMaterial(diceMaterial, groundMaterial, {
        friction: 0.00001, // Adjusted friction
        restitution: 0.1, // Adjusted restitution (bounciness),
      }),
    )

    const boxWidth = 8.6
    const boxLength = 12.6
    createCubeConstraints(boxWidth, boxLength, 14, this.world, diceMaterial, this.scene)

    const taskManager = new TaskManager()
    const meshSyncManager = new TaskManager()
    // Dice
    this.dice = new Dice({
      diceMaterial,
      world: this.world,
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
      this.world.fixedStep()
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

  setupCamera(aspect: number) {
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 2000)
    camera.position.set(0, 10, -7)
    camera.lookAt(new THREE.Vector3(0, 0, 0.4))
    this.scene.add(camera)
    return camera
  }

  addLightingTestSphere() {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32) // radius 1, and higher segments for smoothness
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // white color to better compare lighting
      roughness: 0.5, // some roughness for comparison
      metalness: 0.0, // no metalness for a neutral surface
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

    // Position the sphere at a known location
    sphere.position.set(0, 1, 0) // Adjust Y to place it above the ground

    // Enable shadows for better lighting comparison
    sphere.castShadow = true
    sphere.receiveShadow = true

    this.scene.add(sphere)
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
    directionalLight.position.set(0, 20, 3)
    directionalLight.castShadow = true
    directionalLight.shadow.bias = -0.001
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)
    this.scene.add(new THREE.DirectionalLightHelper(directionalLight, 3))
  }

  async createFloor() {
    const baseTexture = await loadTexture('fabric-016_felt-100x100cm_b.png')
    const normalMap = await loadTexture('fabric-016_felt-100x100cm_n.png')
    const roughnessMap = await loadTexture('fabric-016_felt-100x100cm_s.png')

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: baseTexture,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      color: 0x440478,
      roughness: 1.6, // Adjust for felt-like roughness
      metalness: 0.0, // No metalness for fabric
    })

    // // Optional: Adjust texture scaling if needed
    // baseTexture.wrapS = THREE.RepeatWrapping
    // baseTexture.wrapT = THREE.RepeatWrapping
    // baseTexture.repeat.set(10, 10) // Adjust this to tile the texture

    const floorGeometry = new THREE.PlaneGeometry(100, 100)
    floorGeometry.rotateX(-Math.PI / 2)

    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.receiveShadow = true

    const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() })
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(floorBody)

    this.scene.add(floor)
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

  debug() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.enableDamping = true // Enable smooth camera movement
    controls.dampingFactor = 0.05 // Damping factor for smoother movement
  }
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

  const createBoxWall = async (position: CANNON.Vec3, dimensions: CANNON.Vec3, transparent: boolean = false) => {
    const wallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
    const wallShape = new CANNON.Box(dimensions)
    wallBody.addShape(wallShape)
    wallBody.position.copy(position)
    world.addBody(wallBody)
    if (transparent) return
    const baseTexture = await loadTexture('arroway-textures_leather-004/leather-004-brown_d.jpg')
    const normalMap = await loadTexture('arroway-textures_leather-004/leather-004_n.png')
    const roughnessMap = await loadTexture('arroway-textures_leather-004/leather-004_r.png')

    const leatherMaterial = new THREE.MeshStandardMaterial({
      map: baseTexture,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 1.0, // Adjust for roughness
      metalness: 0.0, // No metalness for leather
    })

    // Create a THREE.Mesh for the wall with the leather texture
    const geometry = new THREE.BoxGeometry(dimensions.x * 2, dimensions.y * 2, dimensions.z * 2)
    const wallMesh = new THREE.Mesh(geometry, leatherMaterial)

    wallMesh.position.copy(position)
    wallMesh.castShadow = true
    wallMesh.receiveShadow = true

    // Add the wall mesh to the scene
    scene.add(wallMesh)
  }

  const h = height / 2
  // Back Wall (Z = -width / 2)
  createBoxWall(new CANNON.Vec3(0, h, -length / 2), new CANNON.Vec3(width / 2, h, wallThickness), true)

  // Front Wall (Z = width / 2)
  createBoxWall(new CANNON.Vec3(0, h, length / 2), new CANNON.Vec3(width / 2, h, wallThickness))

  // Left Wall (X = -length / 2)
  createBoxWall(new CANNON.Vec3(-width / 2, h, 0), new CANNON.Vec3(wallThickness, h, length / 2))

  // Right Wall (X = length / 2)
  createBoxWall(new CANNON.Vec3(width / 2, h, 0), new CANNON.Vec3(wallThickness, h, length / 2))

  // Roof (Y = height)
  createBoxWall(new CANNON.Vec3(0, height, 0), new CANNON.Vec3(width / 2, wallThickness, length / 2), true)
}
