// DiceScene.tsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { div } from '../../../util'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import Dice from './Dice'

interface DiceSceneProps {
  onDiceRollComplete: (diceResults: number[]) => void
}

const DiceScene: React.FC<DiceSceneProps> = ({ onDiceRollComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if the mount point exists
    if (!mountRef.current) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 500, 1000)

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000,
    )
    camera.position.set(0, 8, -5)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(scene.fog.color)
    mountRef.current.appendChild(renderer.domElement)

    // const controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true // Enable smooth camera movement
    // controls.dampingFactor = 0.05 // Damping factor for smoother movement

    // Lights
    const ambientLight = new THREE.AmbientLight(0xaaaaaa)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10)
    const distance = 40
    directionalLight.position.set(-distance, distance, distance)

    directionalLight.castShadow = true

    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048

    directionalLight.shadow.camera.left = -distance
    directionalLight.shadow.camera.right = distance
    directionalLight.shadow.camera.top = distance
    directionalLight.shadow.camera.bottom = -distance

    directionalLight.shadow.camera.far = 3 * distance
    directionalLight.shadow.camera.near = distance
    directionalLight.shadow.mapSize.width = 4096 // Increase shadow map size
    directionalLight.shadow.mapSize.height = 4096
    directionalLight.shadow.bias = -0.00001 // Reduce shadow acne
    directionalLight.shadow.camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(directionalLight)

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

    // Materials
    const groundMaterial = new CANNON.Material('groundMaterial')
    const diceMaterial = new CANNON.Material('diceMaterial')

    world.addContactMaterial(
      new CANNON.ContactMaterial(diceMaterial, groundMaterial, {
        friction: 0.00001, // Adjusted friction
        restitution: 0.0, // Adjusted restitution (bounciness),
      }),
    )

    // Stats.js
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    // Click marker to be shown on interaction
    const clickMarker = makeMarker(scene)

    createCubeConstraints(8, 8, world, diceMaterial)

    // Dice
    const dice = new Dice(diceMaterial, world, scene)

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1)
    floorGeometry.rotateX(-Math.PI / 2)
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x2d173f })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.set(0, 0, 0)
    floor.receiveShadow = true
    scene.add(floor)

    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      type: CANNON.Body.STATIC,
      position: new CANNON.Vec3(0, 0, 0),
    })
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    world.addBody(floorBody)

    // Movement plane when dragging
    const planeGeometry = new THREE.PlaneGeometry(100, 100)
    const movementPlane = new THREE.Mesh(planeGeometry, floorMaterial)
    movementPlane.visible = false // Hide it..
    scene.add(movementPlane)

    const animate = () => {
      requestAnimationFrame(animate)

      // Step the physics world
      world.fixedStep()

      dice.syncMeshes()

      // Render the scene
      renderer.render(scene, camera)

      stats.update()
    }
    function showClickMarker() {
      clickMarker.visible = true
    }
    function moveClickMarker(position: THREE.Vector3) {
      clickMarker.position.copy(position)
    }

    function hideClickMarker() {
      clickMarker.visible = false
    }
    // This function moves the virtual movement plane for the mouseJoint to move in
    function moveMovementPlane(point: THREE.Vector3) {
      // Center at mouse position
      movementPlane.position.copy(point)

      // Make it face toward the camera
      movementPlane.quaternion.copy(camera.quaternion)
    }

    let jointConstraint: CANNON.PointToPointConstraint | undefined
    // Add a constraint between the cube and the jointBody
    // in the initeraction position
    function addJointConstraint(position: THREE.Vector3, constrainedBody: CANNON.Body, jointBody: CANNON.Body) {
      // Vector that goes from the body to the clicked point
      const pos = new CANNON.Vec3(position.x, position.y, position.z)
      const vector = pos.clone().vsub(constrainedBody.position)

      // Apply anti-quaternion to vector to tranform it into the local body coordinate system
      const antiRotation = constrainedBody.quaternion.inverse()
      const pivot = antiRotation.vmult(vector) // pivot is not in local body coordinates

      // Move the cannon click marker body to the click position
      jointBody.position.copy(pos)

      // Create a new constraint
      // The pivot for the jointBody is zero
      jointConstraint = new CANNON.PointToPointConstraint(constrainedBody, pivot, jointBody, new CANNON.Vec3(0, 0, 0))

      // Add the constraint to world
      world.addConstraint(jointConstraint)
    }

    // Remove constraint from world
    function removeJointConstraint() {
      jointConstraint && world.removeConstraint(jointConstraint)
      jointConstraint = undefined
    }
    let isDragging = false

    animate()

    let jointBody: CANNON.Body | undefined
    mountRef.current.addEventListener('pointerdown', (event) => {
      // Cast a ray from where the mouse is pointing and
      // see if we hit something
      const resp = dice.getHitDie(event.clientX, event.clientY, camera, renderer.domElement.getBoundingClientRect())
      // Return if the cube wasn't hit
      if (!resp) {
        return
      }
      const [hitPoint, diceBody, _jointBody] = resp
      jointBody = _jointBody
      // Move marker mesh on contact point
      showClickMarker()
      moveClickMarker(hitPoint)

      // Move the movement plane on the z-plane of the hit
      moveMovementPlane(hitPoint)

      // Create the constraint between the cube body and the joint body
      addJointConstraint(hitPoint, diceBody, jointBody)

      // Set the flag to trigger pointermove on next frame so the
      // movementPlane has had time to move
      requestAnimationFrame(() => {
        isDragging = true
      })
    })
    // This functions moves the joint body to a new postion in space
    // and updates the constraint
    function moveJoint(position: CANNON.Vec3) {
      if (!jointBody || !jointConstraint) {
        return
      }
      // Move the joint body to the new position
      jointBody.position.copy(position)

      // Update the constraint
      jointConstraint.update()
    }

    window.addEventListener('pointermove', (event) => {
      if (!isDragging) {
        return
      }

      // Project the mouse onto the movement plane
      const hitPoint = projectMouseToMovementPlane(
        event.clientX,
        event.clientY,
        renderer.domElement.getBoundingClientRect(),
        camera,
        movementPlane,
      )

      if (hitPoint) {
        // Move marker mesh on the contact point
        moveClickMarker(hitPoint)

        // Move the cannon constraint on the contact point
        moveJoint(new CANNON.Vec3(hitPoint.x, hitPoint.y, hitPoint.z))
      }
    })

    window.addEventListener('pointerup', () => {
      isDragging = false

      // Hide the marker mesh
      hideClickMarker()

      // Remove the mouse constraint from the world
      removeJointConstraint()
    })

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [])

  // Return the mount point
  return div(
    {
      ref: mountRef,
      style: { width: '100%', height: '100%', overflow: 'hidden', cursor: 'pointer' },
    },
    null,
  )
}

export default DiceScene

function makeMarker(scene: THREE.Scene) {
  const markerGeometry = new THREE.SphereGeometry(0.2, 8, 8)
  const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
  const clickMarker = new THREE.Mesh(markerGeometry, markerMaterial)
  clickMarker.visible = false // Hide it..
  scene.add(clickMarker)
  return clickMarker
}

function projectMouseToMovementPlane(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  camera: THREE.Camera,
  movementPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshLambertMaterial, THREE.Object3DEventMap>,
): THREE.Vector3 | null {
  // Get the mouse position relative to the canvas
  const mouse = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  )
  const raycaster = new THREE.Raycaster()
  // Raycasting from camera to the movement plane
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObject(movementPlane)
  return hits[0] ? hits[0].point : null
}
const createCubeConstraints = (size: number, height: number, world: CANNON.World, diceMaterial: CANNON.Material) => {
  const wallThickness = 0.1 // A smaller value to reduce gap issues
  const wallMaterial = new CANNON.Material('wallMaterial')

  // Low friction contact material between dice and walls
  const lowFrictionContactMaterial = new CANNON.ContactMaterial(wallMaterial, diceMaterial, {
    friction: 0.0001, // Low friction value
    restitution: 0, // Adjusted for realistic bounce
  })
  world.addContactMaterial(lowFrictionContactMaterial)

  const createBoxWall = (position: CANNON.Vec3, dimensions: CANNON.Vec3) => {
    const wallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
    const wallShape = new CANNON.Box(dimensions)
    wallBody.addShape(wallShape)
    wallBody.position.copy(position)
    world.addBody(wallBody)
  }

  // Back Wall (Z = -size / 2)
  createBoxWall(new CANNON.Vec3(0, height / 2, -size / 2), new CANNON.Vec3(size / 2, height / 2, wallThickness))

  // Front Wall (Z = size / 2)
  createBoxWall(new CANNON.Vec3(0, height / 2, size / 2), new CANNON.Vec3(size / 2, height / 2, wallThickness))

  // Left Wall (X = -size / 2)
  createBoxWall(new CANNON.Vec3(-size / 2, height / 2, 0), new CANNON.Vec3(wallThickness, height / 2, size / 2))

  // Right Wall (X = size / 2)
  createBoxWall(new CANNON.Vec3(size / 2, height / 2, 0), new CANNON.Vec3(wallThickness, height / 2, size / 2))

  // Roof (Y = height)
  createBoxWall(new CANNON.Vec3(0, height, 0), new CANNON.Vec3(size / 2, wallThickness, size / 2))
}
