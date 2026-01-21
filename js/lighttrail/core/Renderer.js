import { debounce } from './utils.js'

export class Renderer {
  constructor(canvas, grid) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.grid = grid
    this.experiment = null
    this.running = false
    this.lastTime = 0
    this.animationId = null

    this.resize()
    this.setupResize()
  }

  resize() {
    const container = this.canvas.parentElement
    const cellSize = this.grid.spacing
    const dpr = window.devicePixelRatio || 1

    // Snap dimensions to multiple of cell size
    const width = Math.floor(container.clientWidth / cellSize) * cellSize
    const height = Math.floor(container.clientHeight / cellSize) * cellSize

    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'

    this.ctx.scale(dpr, dpr)
    this.width = width
    this.height = height

    this.grid.generate(width, height)

    if (this.experiment && this.experiment.setup) {
      this.experiment.setup()
    }
  }

  setupResize() {
    const debouncedResize = debounce(() => this.resize(), 150)
    window.addEventListener('resize', debouncedResize)
  }

  setExperiment(experiment) {
    if (this.experiment && this.experiment.teardown) {
      this.experiment.teardown()
    }

    this.grid.reset()
    this.experiment = experiment

    if (experiment && experiment.setup) {
      experiment.setup()
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  loop = (time) => {
    if (!this.running) return

    const deltaTime = this.lastTime ? (time - this.lastTime) / 1000 : 0
    this.lastTime = time

    this.clear()

    if (this.experiment) {
      if (this.experiment.update) {
        this.experiment.update(deltaTime)
      }
      // Draw background elements (polygons) before grid
      if (this.experiment.drawBackground) {
        this.experiment.drawBackground(this.ctx, deltaTime)
      }
    }

    // Draw grid dots on top of background elements
    this.grid.draw(this.ctx)

    if (this.experiment) {
      // Draw foreground elements (lines) on top of grid
      if (this.experiment.draw) {
        this.experiment.draw(this.ctx, deltaTime)
      }
    }

    this.animationId = requestAnimationFrame(this.loop)
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTime = 0
    this.animationId = requestAnimationFrame(this.loop)
  }

  stop() {
    this.running = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
}
