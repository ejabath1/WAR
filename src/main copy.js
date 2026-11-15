
import './style.css'
import { initCameraWheel } from './cameraWheel3d.js'

document.querySelector('#app').innerHTML = `
  <header class="header">
    <h1>ALLOY<span>AR</span></h1>
    <p>Experience your wheels before you buy.</p>
  </header>

  <main>
    <section class="camera-container">

      <video id="camera" autoplay playsinline muted></video>

      <div id="placeholder">
        <h2>Live Wheel Try-On</h2>
        <p>Start your camera to begin.</p>
      </div>

      <div id="wheel" class="wheel">
        <div id="ar-wheel-canvas"></div>
      </div>

      <div class="camera-label">LIVE CAMERA PREVIEW</div>

    </section>

    <section class="controls">

      <div class="camera-buttons">
        <button id="startCamera" class="primary">
          Start Camera
        </button>

        <button id="stopCamera" class="secondary">
          Stop Camera
        </button>
      </div>

      <h3>Adjust Your Alloy Wheel</h3>

      <label class="size-label">
        Wheel Size
        <input
          id="size"
          type="range"
          min="60"
          max="260"
          value="150"
        />
      </label>

      <div class="size-value">
        <span>Small</span>
        <span id="sizeValue">150 px</span>
        <span>Large</span>
      </div>

      <h3>Choose Your Alloy Design</h3>

      <div class="catalogue">

        <button class="wheel-option selected"
          data-design="silver">
          Alloy Design 1
        </button>

        <button class="wheel-option"
          data-design="black">
          Alloy Design 2
        </button>

      </div>

      <p class="instructions">
        Drag the alloy over the car wheel to position it.
      </p>

    </section>
  </main>

  <footer>
    AlloyAR Prototype · Built with Three.js
  </footer>
`

// Initialize the transparent 3D camera wheel
const cameraWheel = initCameraWheel()

const video = document.querySelector('#camera')
const wheel = document.querySelector('#wheel')
const placeholder = document.querySelector('#placeholder')
const sizeSlider = document.querySelector('#size')
const sizeValue = document.querySelector('#sizeValue')

// Actual 3D model paths
const modelPaths = {
  silver: '/models/wheel1/scene-converted.glb',
  black: '/models/wheel2/scene.gltf'
}

// Select alloy designs
document.querySelectorAll('.wheel-option').forEach(button => {
  button.addEventListener('click', () => {

    const model = modelPaths[button.dataset.design]

    if (cameraWheel && model) {
      cameraWheel.setModel(model)
    }

    document.querySelectorAll('.wheel-option')
      .forEach(item => item.classList.remove('selected'))

    button.classList.add('selected')
  })
})

// Camera
let cameraStream = null

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }
      },
      audio: false
    })

    video.srcObject = cameraStream

    await video.play()

    placeholder.style.display = 'none'
    video.style.display = 'block'
    wheel.style.display = 'block'

  } catch (error) {
    console.error('Camera error:', error)

    alert(
      'Camera could not start. Please check camera permission and try again.'
    )
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop())
    cameraStream = null
  }

  video.srcObject = null
  video.style.display = 'none'
  wheel.style.display = 'none'
  placeholder.style.display = 'flex'
}

document.querySelector('#startCamera')
  .addEventListener('click', startCamera)

document.querySelector('#stopCamera')
  .addEventListener('click', stopCamera)

// Wheel size
sizeSlider.addEventListener('input', event => {

  const newSize = Number(event.target.value)

  // Preserve the wheel's current centre while resizing
  const oldWidth = wheel.offsetWidth
  const oldHeight = wheel.offsetHeight

  const centerX = wheel.offsetLeft + oldWidth / 2
  const centerY = wheel.offsetTop + oldHeight / 2

  wheel.style.width = newSize + 'px'
  wheel.style.height = newSize + 'px'

  wheel.style.left = (centerX - newSize / 2) + 'px'
  wheel.style.top = (centerY - newSize / 2) + 'px'

  sizeValue.textContent = newSize + ' px'
})

// Drag the 3D alloy
let dragging = false
let dragOffsetX = 0
let dragOffsetY = 0

wheel.addEventListener('pointerdown', event => {

  dragging = true

  const rect = wheel.getBoundingClientRect()

  dragOffsetX = event.clientX - rect.left
  dragOffsetY = event.clientY - rect.top

  wheel.setPointerCapture(event.pointerId)
})

wheel.addEventListener('pointermove', event => {

  if (!dragging) return

  const rect = wheel.parentElement.getBoundingClientRect()

  const x = event.clientX - rect.left - dragOffsetX
  const y = event.clientY - rect.top - dragOffsetY

  wheel.style.left = x + 'px'
  wheel.style.top = y + 'px'
})

wheel.addEventListener('pointerup', () => {
  dragging = false
})

wheel.addEventListener('pointercancel', () => {
  dragging = false
})

// Clean up camera
window.addEventListener('pagehide', stopCamera)
