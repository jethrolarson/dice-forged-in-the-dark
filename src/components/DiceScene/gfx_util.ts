import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export const vector3ToVec3 = (vec: THREE.Vector3): CANNON.Vec3 => new CANNON.Vec3(vec.x, vec.y, vec.z)
export const vec3ToVector3 = (vec: CANNON.Vec3): THREE.Vector3 => new THREE.Vector3(vec.x, vec.y, vec.z)

export const applyRandomAngularVelocityIfZero = (body: CANNON.Body) => {
  if (body.angularVelocity.lengthSquared() < 0.01) {
    const randomAngularVelocity = new CANNON.Vec3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
    )
    body.angularVelocity.set(randomAngularVelocity.x, randomAngularVelocity.y, randomAngularVelocity.z)
  }
}

export const projectOnVector = (vector: CANNON.Vec3, onto: CANNON.Vec3): CANNON.Vec3 => {
  const dotProduct = vector.dot(onto)
  const ontoLengthSquared = onto.lengthSquared()
  return ontoLengthSquared === 0 ? new CANNON.Vec3(0, 0, 0) : onto.scale(dotProduct / ontoLengthSquared)
}

export const randomUnitVector = (): CANNON.Vec3 => {
  const randomVector = new CANNON.Vec3(randomWithin(-0.5, 0.5), randomWithin(-0.5, 0.5), randomWithin(-0.5, 0.5))
  randomVector.normalize()
  return randomVector
}

export const randomSpin = (min: number, max: number): CANNON.Vec3 => randomUnitVector().scale(randomWithin(min, max))

export const randomWithin = (min: number, max: number): number => Math.random() * (max - min) + min

// Create the loader
const loader = new GLTFLoader()
const _modelCache: Record<string, THREE.Group<THREE.Object3DEventMap>> = {}
export const loadModel = (filename: string) =>
  _modelCache[filename]
    ? Promise.resolve(_modelCache[filename].clone())
    : new Promise<THREE.Group<THREE.Object3DEventMap>>((res, rej) =>
        loader.load(
          filename,
          (gltf) => {
            _modelCache[filename] = gltf.scene
            res(gltf.scene)
          },
          undefined,
          rej,
        ),
      )

const _textureCache: Record<string, THREE.Texture> = {}

export const loadTexture = (filename: string): Promise<THREE.Texture> =>
  _textureCache[filename]
    ? Promise.resolve(_textureCache[filename])
    : new Promise<THREE.Texture>((res, rej) => {
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(
          filename,
          (texture) => {
            _textureCache[filename] = texture
            console.log(`Texture loaded: ${filename}`)
            res(texture)
          },
          undefined,
          (error) => {
            console.error(`Failed to load texture: ${filename}`, error)
            rej(error)
          },
        )
      })

export const setRandomRotation = (body: CANNON.Body) => {
  // Create a random quaternion
  const randomQuaternion = new CANNON.Quaternion()

  // Generate random values for rotation
  const randomX = Math.random() * Math.PI * 2
  const randomY = Math.random() * Math.PI * 2
  const randomZ = Math.random() * Math.PI * 2

  // Set the quaternion based on random Euler angles
  randomQuaternion.setFromEuler(randomX, randomY, randomZ)

  // Apply the random quaternion to the body
  body.quaternion.copy(randomQuaternion)
}

/**
 * Utility function to create a material with inverted texture colors.
 * @param texture - The texture to apply and invert the colors for.
 * @returns Inverted color shader material.
 */
export function createInvertedColorMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture || null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec2 vUv;

      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        vec3 invertedColor = vec3(1.0) - texColor.rgb; // Invert color
        gl_FragColor = vec4(invertedColor, texColor.a); // Preserve original alpha
      }
    `,
    transparent: false,
    opacity: 1, // Ensure full opacity
  })
}

/** Axis-aligned Boundary Box */
export interface AABB {
  min: CANNON.Vec3
  max: CANNON.Vec3
}

export function isWithinBox(position: CANNON.Vec3, box: AABB): boolean {
  return (
    position.x >= box.min.x && position.x <= box.max.x &&
    position.y >= box.min.y && position.y <= box.max.y &&
    position.z >= box.min.z && position.z <= box.max.z
  );
}