import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { div } from '../../../util'
import Stats from 'three/examples/jsm/libs/stats.module'
import Dice from './Dice'

interface DiceSceneProps {
  onDiceRollComplete: (diceResults: number[]) => void
}

const DiceScene: React.FC<DiceSceneProps> = ({ onDiceRollComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const diceRef = useRef<Dice | null>(null)
  const movementPlaneRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xaaaaaa)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10)
    directionalLight.position.set(-40, 40, 40)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -20, 0),
    })

    // Dice
    diceRef.current = new Dice(new CANNON.Material('diceMaterial'), world, scene)

    // Floor
    const floor = createFloor(world, scene)
    scene.add(floor)

    // Movement Plane (for dragging dice)
    const movementPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    movementPlane.rotateX(-Math.PI / 2) // Set it horizontal
    movementPlane.position.set(0, 2, 0) // Start slightly above the floor
    scene.add(movementPlane)
    movementPlaneRef.current = movementPlane

    const animate = () => {
      requestAnimationFrame(animate)
      world.fixedStep()
      diceRef.current?.syncMeshes()
      renderer.render(scene, camera)
    }

    animate()

    let isDragging = false

    // Handle pointer down (when clicking on dice)
    const onPointerDown = (event: PointerEvent) => {
      const dice = diceRef.current
      if (!dice) return

      const resp = dice.getHitDie(event.clientX, event.clientY, camera, renderer.domElement.getBoundingClientRect())
      if (!resp) return

      const [diceBody, rayDir] = resp

      if (isDragging) {
        dice.removeJointConstraint()
      } else {
        dice.addJointConstraint(diceBody)
        // Ensure movement plane doesn't clip into the floor
        movementPlane.position.copy(diceBody.position).setY(2)
      }
      isDragging = !isDragging
    }
    mountRef.current.addEventListener('pointerdown', onPointerDown)

    // Handle pointer move (for dragging the dice)
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return
      const dice = diceRef.current
      const movementPlane = movementPlaneRef.current
      if (!dice || !movementPlane) return

      const hitPoint = projectMouseToMovementPlane(
        event.clientX,
        event.clientY,
        renderer.domElement.getBoundingClientRect(),
        camera,
        movementPlane,
      )

      if (hitPoint) {
        const liftedHitPoint = new CANNON.Vec3(hitPoint.x, Math.max(hitPoint.y + 0.5, 1), hitPoint.z)
        dice.moveJoint(liftedHitPoint)
      }
    }
    window.addEventListener('pointermove', onPointerMove)

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
    }
  }, [])

  return div({ ref: mountRef, style: { width: '100%', height: '100%', overflow: 'hidden' } }, null)
}

// Helper functions
function createFloor(world: CANNON.World, scene: THREE.Scene) {
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

function projectMouseToMovementPlane(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  camera: THREE.Camera,
  movementPlane: THREE.Mesh,
): THREE.Vector3 | null {
  const mouse = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObject(movementPlane)
  return hits[0] ? hits[0].point : null
}

export default DiceScene
