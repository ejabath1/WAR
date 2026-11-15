import { initWheelViewer } from './wheel3d.js'

import './style.css'

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
  <svg id="wheelDesign" viewBox="0 0 200 200"></svg>
</div>

      <div class="camera-label">LIVE CAMERA PREVIEW</div>
    </section>
     <section class="viewer-section">
  <h2>3D Alloy Showroom</h2>

  <div id="wheel3d-container">
    <p>Loading 3D showroom...</p>
  </div>

  <div class="model-buttons">
    <button id="model1">Alloy Design 1</button>
    <button id="model2">Alloy Design 2</button>
  </div>

  <p class="viewer-help">
    Drag to rotate · Scroll or pinch to zoom
  </p>
</section>

    <section class="controls">
      <button id="startCamera" class="primary">
        Start Camera
      </button>

      <button id="stopCamera" class="secondary">
        Stop Camera
      </button>

      <h3>Adjust Your Alloy Wheel</h3>

      <label>
  Wheel Size
  <input id="size" type="range"
    min="60" max="260" value="150"/>
</label>

<h3>Choose Your Alloy Design</h3>

<div class="catalogue">
  <button class="wheel-option" data-design="silver">
    Silver Sport
  </button>

  <button class="wheel-option" data-design="black">
    Black Edition
  </button>

  <button class="wheel-option" data-design="bronze">
    Bronze Racing
  </button>
</div>

      <p>Drag the wheel on the screen to reposition it.</p>
    </section>
  </main>

  <footer>
    AlloyAR Prototype · Built with JavaScript
  </footer>
` 
initWheelViewer()

const video = document.querySelector('#camera')
const wheel = document.querySelector('#wheel')

const wheelDesign = document.querySelector('#wheelDesign')

// Create different alloy wheel designs
function drawWheel(spokes, metal, highlight) {

  wheelDesign.innerHTML = `
    <defs>
      <radialGradient id="rimMetal">
        <stop offset="0%" stop-color="${highlight}"/>
        <stop offset="65%" stop-color="${metal}"/>
        <stop offset="100%" stop-color="#444"/>
      </radialGradient>
    </defs>

    <!-- Outer tyre -->
    <circle cx="100" cy="100" r="96"
      fill="#171717"
      stroke="#777"
      stroke-width="5"/>

    <!-- Alloy rim -->
    <circle cx="100" cy="100" r="77"
      fill="url(#rimMetal)"
      stroke="${highlight}"
      stroke-width="3"/>

    <!-- Alloy spokes -->
    ${Array.from({length: spokes}, (_, i) => `
      <path
        d="M 92 29 L 108 29 L 117 91
           L 107 101 L 93 101 L 83 91 Z"
        fill="${metal}"
        stroke="${highlight}"
        stroke-width="2"
        transform="rotate(${i * 360 / spokes} 100 100)"
      />
    `).join('')}

    <!-- Centre hub -->
    <circle cx="100" cy="100" r="27"
      fill="#333" stroke="${highlight}" stroke-width="4"/>

    <circle cx="100" cy="100" r="9" fill="${highlight}"/>

    <!-- Wheel bolts -->
    ${Array.from({length: 5}, (_, i) => `
      <circle cx="100" cy="78" r="4"
        fill="${highlight}"
        transform="rotate(${i * 72} 100 100)"/>
    `).join('')}
  `
}

// Default design
drawWheel(10, '#999999', '#eeeeee')

// Select alloy designs
const designs = {
  silver: {
    spokes: 10,
    metal: '#999999',
    highlight: '#eeeeee'
  },

  black: {
    spokes: 12,
    metal: '#303030',
    highlight: '#aaaaaa'
  },

  bronze: {
    spokes: 5,
    metal: '#a36b36',
    highlight: '#e0b47b'
  }
}

document.querySelectorAll('.wheel-option').forEach(button => {

  button.addEventListener('click', () => {

    const selected = designs[button.dataset.design]

    drawWheel(
      selected.spokes,
      selected.metal,
      selected.highlight
    )

    document.querySelectorAll('.wheel-option')
      .forEach(item => item.classList.remove('selected'))

    button.classList.add('selected')
  })

})

const placeholder = document.querySelector('#placeholder')

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
    placeholder.style.display = 'none'
    video.style.display = 'block'
    wheel.style.display = 'block'

  } catch (error) {
    alert('Camera could not start. Please allow camera permission and try again.')
    console.error(error)
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

// Change wheel size
document.querySelector('#size')
  .addEventListener('input', (event) => {
    wheel.style.width = event.target.value + 'px'
  })

// Make wheel draggable
let dragging = false

wheel.addEventListener('pointerdown', (event) => {
  dragging = true
  wheel.setPointerCapture(event.pointerId)
})

wheel.addEventListener('pointermove', (event) => {
  if (!dragging) return

  const rect = wheel.parentElement.getBoundingClientRect()

  const x = event.clientX - rect.left
const y = event.clientY - rect.top

  wheel.style.left = x + 'px'
  wheel.style.top = y + 'px'
})

wheel.addEventListener('pointerup', () => {
  dragging = false
})

wheel.addEventListener('pointercancel', () => {
  dragging = false
})

// Stop camera when the page is closed
window.addEventListener('pagehide', stopCamera)
