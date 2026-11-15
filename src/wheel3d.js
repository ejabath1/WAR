
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function initWheelViewer() {
  const container = document.querySelector('#wheel3d-container')

  if (!container) return

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x171717)

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )

  camera.position.set(0, 0, 4)

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 2))

  const light1 = new THREE.DirectionalLight(0xffffff, 3)
  light1.position.set(3, 4, 5)
  scene.add(light1)

  const light2 = new THREE.DirectionalLight(0xffffff, 2)
  light2.position.set(-4, 1, -3)
  scene.add(light2)

  // Camera controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.minDistance = 1.5
  controls.maxDistance = 8

  // Wheel model group
  const wheelGroup = new THREE.Group()
  scene.add(wheelGroup)

  const loader = new GLTFLoader()

  let currentModel = null

  function loadWheel(path) {
    container.dataset.loading = 'true'

    loader.load(
      path,

      (gltf) => {
        if (currentModel) {
          wheelGroup.remove(currentModel)
        }

        currentModel = gltf.scene

        // Find model dimensions
        const box = new THREE.Box3().setFromObject(currentModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        // Centre the model
        currentModel.position.sub(center)

        // Normalize its size
        const maxDimension = Math.max(size.x, size.y, size.z)

        if (maxDimension > 0) {
          const scale = 2.5 / maxDimension
          currentModel.scale.setScalar(scale)
        }

        wheelGroup.add(currentModel)

        // Reset camera view
        camera.position.set(0, 0, 4)
        controls.target.set(0, 0, 0)
        controls.update()

        container.dataset.loading = 'false'
      },

      undefined,

      (error) => {
        console.error('Could not load alloy wheel:', error)
        container.dataset.loading = 'error'
        container.innerHTML =
          '<p class="viewer-error">Could not load this model. Check the model files and paths.</p>'
      }
    )
  }

  // Model selection
  document.querySelector('#model1').addEventListener('click', () => {
    loadWheel('/models/wheel1/scene-converted.glb')
  })

  document.querySelector('#model2').addEventListener('click', () => {
    loadWheel('/models/wheel2/scene.gltf')
  })

  // Start with first alloy
  loadWheel('/models/wheel1/scene.gltf')

  // Resize viewer
  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth
    const height = container.clientHeight

    if (!width || !height) return

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
  })

  resizeObserver.observe(container)

  // Animation
  function animate() {
    requestAnimationFrame(animate)

    controls.update()
    renderer.render(scene, camera)
  }

  animate()
}

export function initARWheel() {

  const container = document.querySelector('#ar-wheel-canvas')

  if (!container) return

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    35,
    1,
    0.1,
    100
  )

  camera.position.set(0, 0, 4)

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  )

  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  )

  renderer.setClearColor(0x000000, 0)

  renderer.outputColorSpace = THREE.SRGBColorSpace

  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 2))

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(3, 4, 5)
  scene.add(light)

  const wheelGroup = new THREE.Group()
  scene.add(wheelGroup)

  const loader = new GLTFLoader()

  loader.load(
    '/models/wheel2/scene.gltf',

    (gltf) => {

      const model = gltf.scene

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      model.position.sub(center)

      const maxDimension = Math.max(
        size.x,
        size.y,
        size.z
      )

      if (maxDimension > 0) {
        model.scale.setScalar(2 / maxDimension)
      }

      wheelGroup.add(model)

      console.log('AR wheel loaded successfully')
    },

    undefined,

    (error) => {
      console.error('AR wheel loading failed:', error)
    }
  )

  // Render continuously
  function animate() {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)
  }

  animate()

  // Adjust when the container changes size
  const observer = new ResizeObserver(() => {

    const width = container.clientWidth
    const height = container.clientHeight

    if (!width || !height) return

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)

  })

  observer.observe(container)

}
