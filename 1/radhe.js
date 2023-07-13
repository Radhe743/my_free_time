/**
 * @type {HTMLInputElement} canvas
 */
const scaleRange = document.getElementById('scale-range')
const controls = document.getElementById('controls')
const controlPoints = [...controls.querySelectorAll('[data-cp]')]
const CONTROL_POINT_WIDTH = 10

/**
 * @type {HTMLCanvasElement} canvas
 */
const canvas = document.getElementById('canvas')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

const centerX = canvas.width / 2
const centerY = canvas.height / 2
const ctx = canvas.getContext('2d')

const IMG_SRC = '/1/assets/radha-krsna.png'
// const IMG_SRC = '/1/assets/water_test.jpg'
// const IMG_SRC = '/1/assets/radhey-shyam.jpg'
const CONTROLS_PADDING = 10

const imageProps = {
  x: 10,
  y: 10,
  width: 300,
  height: 300,
  scale: scaleRange.value,
}
let isMoving = false
let isResizing = false
let isTransforming = false
let recalculateCanvas = false
const transformInitPos = {
  x: 0,
  y: 0,
  initialWidth: 0,
}
const initialPos = {
  x: 0,
  y: 0,
}

const img = document.createElement('img')
img.src = IMG_SRC

/////////////////////////
// Main Renderer
const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3

  const aspectR = img.naturalWidth / img.naturalHeight
  /*
  r = w / h
  w = r * h
  h =  w / r
  */

  const { x, y, width, scale } = imageProps
  const newHeight = (width * scale) / aspectR
  imageProps.height = newHeight
  ctx.drawImage(img, imageProps.x, imageProps.y, width * scale, newHeight)
  if (isTransforming) {
    showCanvasControlsBorder(
      x - CONTROLS_PADDING / 2,
      y - CONTROLS_PADDING / 2,
      width * scale + CONTROLS_PADDING,
      newHeight + CONTROLS_PADDING
    )
    showControls(imageProps)
  }
}

let lastTime = 0
function update(time) {
  if (!recalculateCanvas) return
  console.log('RUN')
  const _delta = time - lastTime
  lastTime = time
  render()
  requestAnimationFrame(update)
}
img.onload = () => {
  render()
}

////////////////////////////////////////

function showControls(imageProps) {
  controls.classList.remove('hidden')
  const controlPos = getControlPos(imageProps)
  controlPoints.forEach((cp) => {
    const pointPos = cp.getAttribute('data-pos')
    const pos = controlPos[pointPos]
    cp.style.left = `${pos.x}px`
    cp.style.top = `${pos.y}px`
  })
}
function getControlPos(imageProps) {
  const { width, height, scale, x, y } = imageProps
  const tl = {
    x: x - (CONTROLS_PADDING * 2) / 2,
    y: y - (CONTROLS_PADDING * 2) / 2,
  }
  const tr = {
    x: x + width * scale,
    y: y - CONTROL_POINT_WIDTH,
  }
  const bl = {
    x: x - CONTROL_POINT_WIDTH,
    y: y + height,
  }
  const br = {
    x: x + width * scale,
    y: y + height,
  }
  return { tl, tr, bl, br }
}
function showCanvasControlsBorder(x, y, w, h) {
  ctx.save()
  ctx.strokeStyle = 'cyan'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 3])
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

/**
 * @param {MouseEvent} ev
 */

function handleMouseMove(ev) {
  if (isMoving && isSelectingImage(ev, imageProps)) {
    ev.preventDefault()

    const newX = ev.offsetX - initialPos.x
    const newY = ev.offsetY - initialPos.y
    imageProps.x = newX
    imageProps.y = newY
  }
  if (isTransforming && isResizing) {
    const { x: initX, y: initY } = transformInitPos
    const dx = ev.offsetX - initX
    // const dy = ev.offsetY - initY
    const { height } = imageProps
    const { initialWidth } = transformInitPos
    const aspectR = initialWidth / height
    const newWidth = initialWidth + dx
    const newHeight = newWidth * aspectR

    imageProps.width = newWidth
    imageProps.height = newHeight
  }
}

/**
 * @param {MouseEvent} ev
 */
function handleMouseDown(ev) {
  const isClickingInsideImage = isSelectingImage(ev, imageProps)
  if (isClickingInsideImage) {
    allowRender()
    initialPos.x = ev.offsetX - imageProps.x
    initialPos.y = ev.offsetY - imageProps.y
    isMoving = true
    isTransforming = true
  } else {
    isMoving = false
    isTransforming = false
  }
}

function handleMouseUp() {
  isMoving = false
  isResizing = false
  controls.classList.add('hidden')
  disableRender()
  render()
}

/**
 *
 * @param {MouseEvent} ev
 */
function handleControlPointDown(ev) {
  ev.preventDefault()
  transformInitPos.x = ev.offsetX + ev.target.offsetLeft
  transformInitPos.y = ev.offsetY + ev.target.offsetTop
  transformInitPos.initialWidth = imageProps.width

  isResizing = true
  allowRender()
}

function handleScaleRange(ev) {
  imageProps.scale = ev.target.value
  render()
}
canvas.addEventListener('mousedown', handleMouseDown)
canvas.addEventListener('mousemove', handleMouseMove)
scaleRange.addEventListener('input', handleScaleRange)
canvas.addEventListener('mouseup', handleMouseUp)
controlPoints.forEach((cp) => {
  cp.addEventListener('mousedown', handleControlPointDown)
})

/**
 * @param {MouseEvent} ev
 */
function isSelectingImage(ev, imageData) {
  const { offsetX: mouseX, offsetY: mouseY } = ev
  if (
    mouseX >= imageData.x &&
    mouseX <= imageData.x + imageData.width * imageData.scale &&
    mouseY >= imageData.y &&
    mouseY <= imageData.y + imageData.height
  ) {
    return true
  }
}
function allowRender() {
  recalculateCanvas = true
  requestAnimationFrame(update)
}
function disableRender() {
  recalculateCanvas = false
}
