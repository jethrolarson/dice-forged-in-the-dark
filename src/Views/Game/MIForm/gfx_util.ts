import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export const vector3ToVec3 = (vec: THREE.Vector3): CANNON.Vec3 => new CANNON.Vec3(vec.x, vec.y, vec.z)
