import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import './arExperience.css'

const statusEl = document.querySelector('#status')
const startButton = document.querySelector('#start-ar')
const endButton = document.querySelector('#end-ar')
const resetButton = document.querySelector('#reset-placement')
const designSelect = document.querySelector('#design')
const diameterInput = document.querySelector('#diameter')
const diameterValue = document.querySelector('#diameter-value')
const hud = document.querySelector('#ar-hud')
const hudStatus = document.querySelector('#hud-status')

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera()
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
renderer.xr.enabled = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
renderer.setClearColor(0x000000, 0)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.domElement.className = 'wheel-preview-canvas'
renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;'
const previewHost = document.querySelector('#wheel-preview')
previewHost.appendChild(renderer.domElement)
camera.position.set(0, 0, 2.6)
camera.lookAt(0, 0, 0)
camera.aspect = previewHost.clientWidth / Math.max(previewHost.clientHeight, 1)
camera.updateProjectionMatrix()
renderer.setSize(previewHost.clientWidth, previewHost.clientHeight, false)
window.addEventListener('resize', () => {
  if (!session) {
    camera.aspect = previewHost.clientWidth / Math.max(previewHost.clientHeight, 1)
    camera.updateProjectionMatrix()
    renderer.setSize(previewHost.clientWidth, previewHost.clientHeight, false)
  }
})

scene.add(new THREE.HemisphereLight(0xffffff, 0x5c6470, 2.1))
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
keyLight.position.set(2, 5, 3)
scene.add(keyLight)

const loader = new GLTFLoader()
const wheelRoot = new THREE.Group()
wheelRoot.visible = false
scene.add(wheelRoot)

const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.105, 0.125, 48),
  new THREE.MeshBasicMaterial({ color: 0xff3449, side: THREE.DoubleSide })
)
reticle.matrixAutoUpdate = false
reticle.visible = false
scene.add(reticle)

const zToY = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 1, 0)
)
const poseMatrix = new THREE.Matrix4()
const position = new THREE.Vector3()
const orientation = new THREE.Quaternion()
const scaleVector = new THREE.Vector3(1, 1, 1)

let session = null
let referenceSpace = null
let viewerSpace = null
let hitTestSource = null
let latestHit = null
let wheelAnchor = null
let fallbackPose = null
let modelDiameter = 1
let currentModelPath = ''
let modelRequest = 0
let placed = false

function setStatus(message) {
  statusEl.textContent = message
}

function setHud(message) {
  hudStatus.textContent = message
}

function readDiameterMeters() {
  return Number(diameterInput.value) / 1000
}

diameterInput.addEventListener('input', () => {
  diameterValue.textContent = `${diameterInput.value} mm`
  if (placed) applyPhysicalScale()
})

function applyPhysicalScale() {
  const targetDiameter = readDiameterMeters()
  wheelRoot.scale.setScalar(targetDiameter / modelDiameter)
}

async function loadWheel(path) {
  const request = ++modelRequest
  currentModelPath = path
  setStatus('Loading selected 3D alloy…')
  try {
    const gltf = await loader.loadAsync(path)
    if (request !== modelRequest) return
    while (wheelRoot.children.length) {
      const child = wheelRoot.children.pop()
      wheelRoot.remove(child)
    }
    const model = gltf.scene
    model.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(model)
    const center = bounds.getCenter(new THREE.Vector3())
    const dimensions = bounds.getSize(new THREE.Vector3())
    modelDiameter = Math.max(dimensions.x, dimensions.y)
    if (!Number.isFinite(modelDiameter) || modelDiameter <= 0) {
      throw new Error('The selected model has no measurable wheel geometry.')
    }
    model.position.sub(center)
    wheelRoot.add(model)
    applyPhysicalScale()
    wheelRoot.visible = true
    setStatus('3D alloy loaded. Preview it above, then start AR on a supported phone.')
  } catch (error) {
    console.error('Wheel model load failed:', error)
    setStatus(`Could not load the alloy model: ${error.message}`)
  }
}

designSelect.addEventListener('change', async () => {
  placed = false
  wheelAnchor = null
  fallbackPose = null
  wheelRoot.visible = false
  resetButton.disabled = true
  await loadWheel(designSelect.value)
})

function applyHitPose(transform) {
  poseMatrix.fromArray(transform.matrix)
  poseMatrix.decompose(position, orientation, scaleVector)
  reticle.position.copy(position)
  reticle.quaternion.copy(orientation).multiply(zToY)
  reticle.updateMatrix()
  reticle.visible = true
}

function applyWheelPose(transform) {
  poseMatrix.fromArray(transform.matrix)
  poseMatrix.decompose(position, orientation, scaleVector)
  wheelRoot.position.copy(position)
  wheelRoot.quaternion.copy(orientation).multiply(zToY)
  // A tiny offset avoids z-fighting with the detected surface.
  wheelRoot.position.add(new THREE.Vector3(0, 0, 0.008).applyQuaternion(wheelRoot.quaternion))
  wheelRoot.visible = true
  applyPhysicalScale()
}

async function placeWheel() {
  if (!session || !latestHit || !referenceSpace) return
  try {
    const pose = latestHit.getPose(referenceSpace)
    if (!pose) return
    fallbackPose = pose.transform
    wheelAnchor = null
    if (typeof latestHit.createAnchor === 'function') {
      try {
        wheelAnchor = await latestHit.createAnchor()
      } catch (error) {
        console.info('World anchor unavailable; using the hit-test pose in the local AR reference space.', error)
      }
    }
    applyWheelPose(fallbackPose)
    placed = true
    resetButton.disabled = false
    setHud(wheelAnchor ? 'WHEEL ANCHORED · MOVE AROUND TO INSPECT' : 'WHEEL PLACED · LOCAL WORLD TRACKING')
  } catch (error) {
    console.error('Could not place wheel:', error)
    setHud('PLACEMENT FAILED · AIM AGAIN')
  }
}

function resetPlacement() {
  wheelAnchor = null
  fallbackPose = null
  placed = false
  wheelRoot.visible = false
  resetButton.disabled = true
  setHud('AIM AT THE WHEEL CENTRE · TAP TO PLACE')
}

function renderFrame(_time, frame) {
  if (frame && session && referenceSpace) {
    const hits = hitTestSource ? frame.getHitTestResults(hitTestSource) : []
    latestHit = hits.length ? hits[0] : null

    if (!placed && latestHit) {
      const pose = latestHit.getPose(referenceSpace)
      if (pose) applyHitPose(pose.transform)
    } else if (!placed) {
      reticle.visible = false
    }

    if (placed && wheelAnchor) {
      const anchorPose = frame.getPose(wheelAnchor.anchorSpace, referenceSpace)
      if (anchorPose) applyWheelPose(anchorPose.transform)
    } else if (placed && fallbackPose) {
      applyWheelPose(fallbackPose)
    }
  }
  renderer.render(scene, camera)
}

async function startAR() {
  if (!navigator.xr) {
    setStatus('WebXR is not available here. Try a supported Android phone using Chrome over HTTPS.')
    return
  }
  if (!currentModelPath || wheelRoot.children.length === 0) {
    setStatus('Wait for the selected 3D alloy to finish loading.')
    return
  }

  startButton.disabled = true
  // The AR page container is hidden during immersive mode. Move the WebGL
  // canvas out of that container or the camera passthrough will be invisible.
  wheelRoot.visible = false
  previewHost.removeChild(renderer.domElement)
  document.body.appendChild(renderer.domElement)
  renderer.domElement.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;z-index:4;display:block;'
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  setStatus('Requesting camera and AR permissions…')
  try {
    const supported = await navigator.xr.isSessionSupported('immersive-ar')
    if (!supported) throw new Error('This browser or device does not support immersive WebXR AR.')

    session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['anchors', 'dom-overlay'],
      domOverlay: { root: document.body }
    })
    renderer.xr.setReferenceSpaceType('local')
    await renderer.xr.setSession(session)
    referenceSpace = await session.requestReferenceSpace('local')
    viewerSpace = await session.requestReferenceSpace('viewer')
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace })

    session.addEventListener('end', onSessionEnd, { once: true })
    renderer.xr.setAnimationLoop(renderFrame)
    renderer.domElement.style.display = 'block'
    document.body.classList.add('xr-active')
    hud.classList.add('active')
    endButton.disabled = false
    setHud('MOVE SLOWLY · FIND THE WHEEL CENTRE')
    setStatus('AR session active.')
  } catch (error) {
    console.error('Unable to start WebXR session:', error)
    setStatus(error.message || 'AR could not start. Check browser and camera permissions.')
    startButton.disabled = false
    if (session) {
      try { await session.end() } catch {}
    }
    session = null
    if (renderer.domElement.parentElement !== previewHost) previewHost.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;'
    renderer.setSize(previewHost.clientWidth, previewHost.clientHeight, false)
    wheelRoot.visible = true
  }
}

function onSessionEnd() {
  if (hitTestSource) hitTestSource.cancel()
  hitTestSource = null
  viewerSpace = null
  referenceSpace = null
  latestHit = null
  wheelAnchor = null
  fallbackPose = null
  session = null
  placed = false
  wheelRoot.visible = false
  reticle.visible = false
  renderer.setAnimationLoop(null)
  if (renderer.domElement.parentElement !== previewHost) previewHost.appendChild(renderer.domElement)
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;'
  wheelRoot.visible = true
  camera.position.set(0, 0, 2.6)
  camera.lookAt(0, 0, 0)
  camera.aspect = previewHost.clientWidth / Math.max(previewHost.clientHeight, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(previewHost.clientWidth, previewHost.clientHeight, false)
  renderer.setAnimationLoop(renderFrame)
  document.body.classList.remove('xr-active')
  hud.classList.remove('active')
  startButton.disabled = false
  endButton.disabled = true
  resetButton.disabled = true
  setStatus('AR session ended. You can start another session.')
}

startButton.addEventListener('click', startAR)
endButton.addEventListener('click', () => session?.end())
resetButton.addEventListener('click', resetPlacement)
renderer.xr.addEventListener('sessionstart', () => {
  const controller = renderer.xr.getController(0)
  controller.addEventListener('select', placeWheel)
  scene.add(controller)
})
renderer.xr.addEventListener('sessionend', () => {
  const controller = renderer.xr.getController(0)
  controller.removeEventListener('select', placeWheel)
  scene.remove(controller)
})

window.addEventListener('pagehide', () => {
  if (session) session.end()
  if (hitTestSource) hitTestSource.cancel()
  renderer.dispose()
})

async function checkSupport() {
  if (!navigator.xr) {
    setStatus('WebXR AR is not exposed by this browser. Use an ARCore-supported Android phone in Chrome over HTTPS.')
    startButton.disabled = true
    return
  }
  try {
    const supported = await navigator.xr.isSessionSupported('immersive-ar')
    startButton.disabled = !supported
    setStatus(supported
      ? 'This browser reports immersive AR support. Load a model, then start the camera.'
      : 'Immersive AR is not supported on this device/browser.')
  } catch {
    startButton.disabled = true
    setStatus('Could not verify WebXR support in this browser.')
  }
}

await loadWheel(designSelect.value)
renderer.setAnimationLoop(renderFrame)
await checkSupport()
