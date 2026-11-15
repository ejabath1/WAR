
import './style.css'
import { initCameraWheel } from './cameraWheel3d.js'

// ========================================
// WHEEL CART - INITIALIZE WEBSITE
// ========================================

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a href="#" class="brand">
      <svg class="brand-icon" viewBox="0 0 100 48" aria-hidden="true">
        <path d="M5 19 Q27 3 48 15 Q68 25 94 13"
          fill="none" stroke="#E60012"
          stroke-width="4" stroke-linecap="round"/>
        <path d="M13 34 L25 17 L36 34 L48 17"
          fill="none" stroke="#0052D9"
          stroke-width="7" stroke-linejoin="round"/>
      </svg>
      <span class="brand-name">WHEEL <b>CART</b></span>
    </a>

    <nav>
      <a href="#studio">TRY-ON STUDIO</a>
      <a href="#collection">COLLECTION</a>
      <a href="#how-it-works">HOW IT WORKS</a>
    </nav>

    <a href="#studio" class="header-cta">GET STARTED ↗</a>
  </header>

  <main>

    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">
          <span class="red-dot"></span>
          A NEW WAY TO EXPERIENCE ALLOYS
        </span>

        <h1>
          Make every<br>
          wheel <span>count.</span>
        </h1>

        <p>
          Find the perfect alloy for your vehicle.
          Explore designs and experience your wheels
          before making your choice.
        </p>

        <a href="#studio" class="main-cta">
          EXPLORE THE TRY-ON STUDIO
          <span>↗</span>
        </a>

        <div class="hero-note">
          <span class="note-line"></span>
          YOUR DRIVE. YOUR DESIGN.
        </div>
      </div>

      <div class="hero-visual">
        <div class="hero-image">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85"
            alt="Premium sports car"
          >
        </div>

        <div class="visual-label">
          <span>WHEEL CART</span>
          <span>01 / AUTOMOTIVE EXPERIENCE</span>
        </div>

        <div class="visual-mark">WC.</div>
      </div>
    </section>

    <section class="studio-section" id="studio">

      <div class="section-heading">
        <div>
          <span class="eyebrow">01 — INTERACTIVE EXPERIENCE</span>
          <h2>The try-on studio<span>.</span></h2>
        </div>

        <p>See the difference. Find your style.</p>
      </div>

      <div class="studio-layout">

        <div class="camera-container">

          <video id="camera" autoplay playsinline muted></video>

          <div id="placeholder">
            <div class="camera-placeholder-icon">WC</div>
            <h3>Your wheel experience starts here.</h3>
            <p>Start your camera to preview your alloy.</p>
            <span class="camera-placeholder-note">
              CAMERA PREVIEW
            </span>
          </div>

          <div id="wheel" class="wheel">
            <div id="ar-wheel-canvas"></div>
          </div>

          <div class="camera-label">
            <span class="live-dot"></span>
            LIVE CAMERA PREVIEW
          </div>

          <span class="camera-corner-label">
            WHEEL CART / STUDIO 01
          </span>

        </div>

        <aside class="studio-controls">

          <div class="control-top">
            <span class="eyebrow">CUSTOMIZE YOUR LOOK</span>
            <span class="control-number">01 / 02</span>
          </div>

          <h3>Make it yours.</h3>

          <p class="control-description">
            Select your favourite design and position
            it over your vehicle's wheel.
          </p>

          <div class="control-group">
            <div class="control-title">
              <label for="size">Wheel size</label>
              <span id="sizeValue">150 px</span>
            </div>

            <input
              id="size"
              type="range"
              min="60"
              max="260"
              value="150"
            >

            <div class="range-labels">
              <span>SMALL</span>
              <span>LARGE</span>
            </div>
          </div>

          <div class="control-group" id="collection">
            <div class="control-title">
              <span>Choose your design</span>
              <span>02 OPTIONS</span>
            </div>

            <div class="catalogue">

              <button class="wheel-option selected"
                data-design="silver">
                <span class="design-number">01</span>
                <span class="design-name">Alloy Design 1</span>
                <span class="design-arrow">↗</span>
              </button>

              <button class="wheel-option"
                data-design="black">
                <span class="design-number">02</span>
                <span class="design-name">Alloy Design 2</span>
                <span class="design-arrow">↗</span>
              </button>

            </div>
          </div>

          <div class="camera-actions">
            <button id="startCamera" class="start-button">
              START CAMERA ↗
            </button>

            <button id="stopCamera" class="stop-button">
              STOP CAMERA
            </button>
          </div>

          <p class="drag-note">
            TIP — DRAG THE ALLOY TO POSITION IT.
          </p>

          <div class="rotation-controls">
            <button id="rotateLeft">↶ ROTATE LEFT</button>
            <button id="rotateRight">ROTATE RIGHT ↷</button>
          </div>

        </aside>

      </div>
    </section>

    <section class="how-section" id="how-it-works">

      <div class="section-heading">
        <div>
          <span class="eyebrow">02 — SIMPLE BY DESIGN</span>
          <h2>Three steps. One perfect look.</h2>
        </div>
      </div>

      <div class="steps">

        <article class="step">
          <span class="step-number">01</span>
          <div class="step-icon">◎</div>
          <h3>Start your camera</h3>
          <p>Open the live preview and get ready to explore.</p>
        </article>

        <article class="step">
          <span class="step-number">02</span>
          <div class="step-icon">◈</div>
          <h3>Choose your alloy</h3>
          <p>Explore available wheel designs and select your favourite.</p>
        </article>

        <article class="step">
          <span class="step-number">03</span>
          <div class="step-icon">↗</div>
          <h3>Experience the look</h3>
          <p>Position and resize the alloy to preview your choice.</p>
        </article>

      </div>
    </section>

    <section class="closing-section">
      <span class="eyebrow">THE WHEEL CART EXPERIENCE</span>
      <h2>Your vehicle deserves<br>the right wheels.</h2>
      <a href="#studio" class="main-cta">
        FIND YOUR STYLE ↗
      </a>
    </section>

  </main>

  <footer class="site-footer">
    <a href="#" class="footer-brand">WHEEL <b>CART</b></a>
    <span>DRIVE YOUR STYLE.</span>
    <span>© 2026 WHEEL CART</span>
  </footer>
`

// ========================================
// INITIALIZE 3D ALLOY
// ========================================

const cameraWheel = initCameraWheel()

const video = document.querySelector('#camera')
const wheel = document.querySelector('#wheel')
const placeholder = document.querySelector('#placeholder')
const sizeSlider = document.querySelector('#size')
const sizeValue = document.querySelector('#sizeValue')
const cameraContainer = document.querySelector('.camera-container')

// ========================================
// MODEL SELECTION
// ========================================

const modelPaths = {
  silver: '/models/wheel1/scene-converted.glb',
  black: '/models/wheel2/scene.gltf'
}

document.querySelectorAll('.wheel-option').forEach(button => {

  button.addEventListener('click', () => {

    const path = modelPaths[button.dataset.design]

    if (cameraWheel && path) {
      cameraWheel.setModel(path)
    }

    document.querySelectorAll('.wheel-option')
      .forEach(item => item.classList.remove('selected'))

    button.classList.add('selected')

  })

})

// ========================================
// ROTATION CONTROLS
// ========================================

document.querySelector('#rotateLeft')
  .addEventListener('click', () => {

    cameraWheel?.rotateY(-0.15)

  })

document.querySelector('#rotateRight')
  .addEventListener('click', () => {

    cameraWheel?.rotateY(0.15)

  })

// ========================================
// CAMERA AND DETECTION VARIABLES
// ========================================

let cameraStream = null
let detectionActive = false
let detectionBusy = false
let detectionTimer = null

let lastDetectedDiameter = 150
let manuallyPositioned = false

const detectionCanvas = document.createElement('canvas')
detectionCanvas.width = 640
detectionCanvas.height = 480

const detectionContext = detectionCanvas.getContext('2d')

// ========================================
// UPDATE ALLOY SIZE
// ========================================

function updateWheelSize() {

  const userScale = Number(sizeSlider.value) / 150

  const diameter = lastDetectedDiameter * userScale

  wheel.style.width = `${diameter}px`
  wheel.style.height = `${diameter}px`

  sizeValue.textContent = `${sizeSlider.value} px`

  cameraWheel?.resize()

}

sizeSlider.addEventListener('input', updateWheelSize)

// ========================================
// AUTOMATIC WHEEL DETECTION
// ========================================

async function detectWheel() {

  if (!detectionActive || detectionBusy) return

  if (video.readyState < 2) return

  detectionBusy = true

  try {

    detectionContext.drawImage(
      video,
      0, 0,
      640, 480
    )

    const blob = await new Promise(resolve => {
      detectionCanvas.toBlob(resolve, 'image/jpeg', 0.65)
    })

    if (!blob || !detectionActive) return

    const formData = new FormData()

    formData.append('frame', blob, 'frame.jpg')

    const response = await fetch(
      'http://127.0.0.1:5000/detect',
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error(`Detection server error: ${response.status}`)
    }

    const result = await response.json()

    if (!detectionActive) return

    if (result.found) {

      const containerRect = cameraContainer.getBoundingClientRect()

      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      // Match the video element's object-fit: cover display
      const scale = Math.max(
        containerRect.width / videoWidth,
        containerRect.height / videoHeight
      )

      const renderedWidth = videoWidth * scale
      const renderedHeight = videoHeight * scale

      const offsetX = (containerRect.width - renderedWidth) / 2
      const offsetY = (containerRect.height - renderedHeight) / 2

      const centerX =
        result.x * renderedWidth + offsetX

      const centerY =
        result.y * renderedHeight + offsetY

      // Detection radius is normalized to the 640px frame width
      const detectedDiameter =
        result.radius * 2 * 640 * (videoWidth / 640) * scale

      lastDetectedDiameter = detectedDiameter

      updateWheelSize()

      if (!manuallyPositioned) {

        wheel.style.left =
          `${centerX - wheel.offsetWidth / 2}px`

        wheel.style.top =
          `${centerY - wheel.offsetHeight / 2}px`

      }

      wheel.style.display = 'block'

    }

  } catch (error) {

    console.error('Wheel detection error:', error)

  } finally {

    detectionBusy = false

  }

}

// ========================================
// START AND STOP DETECTION
// ========================================

function startDetection() {

  if (detectionActive) return

  detectionActive = true

  detectWheel()

  detectionTimer = setInterval(() => {

    if (!detectionBusy) {
      detectWheel()
    }

  }, 250)

  console.log('WHEEL CART: Detection started')

}

function stopDetection() {

  detectionActive = false

  if (detectionTimer) {
    clearInterval(detectionTimer)
    detectionTimer = null
  }

  console.log('WHEEL CART: Detection stopped')

}

// ========================================
// START CAMERA
// ========================================

async function startCamera() {

  try {

    if (cameraStream) return

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    })

    video.srcObject = cameraStream

    await video.play()

    video.style.display = 'block'
    placeholder.style.display = 'none'

    wheel.style.display = 'none'

    manuallyPositioned = false

    startDetection()

    console.log('WHEEL CART: Camera started')

  } catch (error) {

    console.error('Camera error:', error)

    alert('Camera could not start. Check camera permissions.')

  }

}

// ========================================
// STOP CAMERA
// ========================================

function stopCamera() {

  stopDetection()

  if (cameraStream) {

    cameraStream.getTracks().forEach(track => track.stop())

    cameraStream = null

  }

  video.srcObject = null

  video.style.display = 'none'
  wheel.style.display = 'none'

  placeholder.style.display = 'flex'

  manuallyPositioned = false

  console.log('WHEEL CART: Camera stopped')

}

document.querySelector('#startCamera')
  .addEventListener('click', startCamera)

document.querySelector('#stopCamera')
  .addEventListener('click', stopCamera)

// ========================================
// MANUAL ALLOY DRAGGING
// ========================================

let dragging = false
let dragOffsetX = 0
let dragOffsetY = 0

wheel.addEventListener('pointerdown', event => {

  if (wheel.style.display === 'none') return

  dragging = true
  manuallyPositioned = true

  const rect = wheel.getBoundingClientRect()

  dragOffsetX = event.clientX - rect.left
  dragOffsetY = event.clientY - rect.top

  wheel.setPointerCapture(event.pointerId)

})

wheel.addEventListener('pointermove', event => {

  if (!dragging) return

  const rect = cameraContainer.getBoundingClientRect()

  wheel.style.left =
    `${event.clientX - rect.left - dragOffsetX}px`

  wheel.style.top =
    `${event.clientY - rect.top - dragOffsetY}px`

})

function stopDragging() {
  dragging = false
}

wheel.addEventListener('pointerup', stopDragging)
wheel.addEventListener('pointercancel', stopDragging)

// ========================================
// CLEANUP
// ========================================

window.addEventListener('pagehide', stopCamera)
