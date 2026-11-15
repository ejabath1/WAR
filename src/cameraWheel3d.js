
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export function initCameraWheel() {
  const container = document.querySelector('#ar-wheel-canvas')

  if (!container) return null

  const scene = new THREE.Scene()

  const camera = new THREE.OrthographicCamera(
    -1, 1, 1, -1, 0.1, 100
  )

  camera.position.set(0, 0, 10)

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 2))

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(3, 4, 5)
  scene.add(light)

  // Main wheel group
  const wheelGroup = new THREE.Group()
  scene.add(wheelGroup)

  const loader = new GLTFLoader()

  let currentModel = null
  let requestNumber = 0

  // Actual 3D wheel size
  let wheelScale = 1

  // Rotation
  let rotationX = 0
  let rotationY = 0

  // Smooth AR tracking
const targetRotation = new THREE.Vector3()

const clock = new THREE.Clock()

  function loadModel(path) {
    const thisRequest = ++requestNumber

    loader.load(
      path,

      (gltf) => {
        if (thisRequest !== requestNumber) return

        if (currentModel) {
          wheelGroup.remove(currentModel)
        }

        currentModel = gltf.scene

        // Calculate the complete model bounds
currentModel.updateMatrixWorld(true)

const box = new THREE.Box3().setFromObject(currentModel)

const center = box.getCenter(new THREE.Vector3())
const sphere = box.getBoundingSphere(new THREE.Sphere())

// Centre the wheel
currentModel.position.sub(center)

// Fit the complete wheel inside the viewer
const radius = sphere.radius

if (radius > 0) {
  const targetRadius = 0.72
  currentModel.scale.setScalar(targetRadius / radius)
}

currentModel.updateMatrixWorld(true)

        wheelGroup.add(currentModel)

        // Apply current size
        wheelGroup.scale.setScalar(wheelScale)

        // Apply current rotation
        wheelGroup.rotation.set(rotationX, rotationY, 0)

        console.log('AR alloy loaded successfully')
      },

      undefined,

      (error) => {
        console.error('Camera wheel model failed to load:', error)
      }
    )
  }

  // Fit renderer to its container
  function resize() {
    const width = container.clientWidth
    const height = container.clientHeight

    if (!width || !height) return

    renderer.setSize(width, height, false)

    const aspect = width / height

    camera.left = -aspect
    camera.right = aspect
    camera.top = 1
    camera.bottom = -1

    camera.updateProjectionMatrix()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  resize()

  
function smoothAngle(current, target, speed, delta) {

  const difference = THREE.MathUtils.euclideanModulo(
    target - current + Math.PI,
    Math.PI * 2
  ) - Math.PI

  return current + difference * (
    1 - Math.exp(-speed * delta)
  )
}

function animate() {

  requestAnimationFrame(animate)

  const delta = Math.min(clock.getDelta(), 0.05)

  // Smooth all three rotation axes
  wheelGroup.rotation.x = smoothAngle(
    wheelGroup.rotation.x,
    targetRotation.x,
    9,
    delta
  )

  wheelGroup.rotation.y = smoothAngle(
    wheelGroup.rotation.y,
    targetRotation.y,
    9,
    delta
  )

  wheelGroup.rotation.z = smoothAngle(
    wheelGroup.rotation.z,
    targetRotation.z,
    9,
    delta
  )

  renderer.render(scene, camera)
}

animate()


  animate()

  // Load first alloy
  loadModel('/models/wheel1/scene-converted.glb')

  return {

    setModel(path) {
      loadModel(path)
    },

    // Change actual 3D model size
    setScale(value) {
      wheelScale = THREE.MathUtils.clamp(value, 0.5, 2.5)
      wheelGroup.scale.setScalar(wheelScale)
    },

   
    // Rotate actual 3D model manually
    rotateX(value) {
      rotationX += value
      wheelGroup.rotation.x = rotationX
    },

    rotateY(value) {
      rotationY += value
      wheelGroup.rotation.y = rotationY
    },

    // Apply rotation received from Python OpenCV
    setTrackingRotation(rotation) {

  const toRadians = THREE.MathUtils.degToRad

  targetRotation.set(
    toRadians(rotation.x),
    toRadians(rotation.y),
    toRadians(rotation.z)
  )

},


    resize,

    dispose() {
      resizeObserver.disconnect()
      renderer.dispose()
      container.innerHTML = ''
    }

  }
}
