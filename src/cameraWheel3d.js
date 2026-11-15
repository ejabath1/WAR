
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

  function animate() {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)
  }

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

    // Rotate actual 3D model
    rotateX(value) {
      rotationX += value
      wheelGroup.rotation.x = rotationX
    },

    rotateY(value) {
      rotationY += value
      wheelGroup.rotation.y = rotationY
    },

    resize,

    dispose() {
      resizeObserver.disconnect()
      renderer.dispose()
      container.innerHTML = ''
    }

  }
}
