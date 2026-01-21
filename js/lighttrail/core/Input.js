export class Input {
  constructor(canvas, grid) {
    this.canvas = canvas
    this.grid = grid
    this.experiment = null

    this.x = 0
    this.y = 0
    this.isDown = false
    this.hoveredDot = null

    this.setupListeners()
  }

  setExperiment(experiment) {
    this.experiment = experiment
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / (rect.width * (window.devicePixelRatio || 1))
    const scaleY = this.canvas.height / (rect.height * (window.devicePixelRatio || 1))

    let clientX, clientY
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  handleMove(e) {
    const coords = this.getCanvasCoords(e)
    this.x = coords.x
    this.y = coords.y

    const dot = this.grid.getDotAt(this.x, this.y)

    // Handle dot enter/leave events
    if (dot !== this.hoveredDot) {
      if (this.hoveredDot && this.experiment?.onLeaveDot) {
        this.experiment.onLeaveDot(this.hoveredDot)
      }
      if (dot && this.experiment?.onEnterDot) {
        this.experiment.onEnterDot(dot)
      }
      this.hoveredDot = dot
    }

    if (this.experiment?.onMove) {
      this.experiment.onMove(this.x, this.y, dot)
    }
  }

  handleDown(e) {
    this.isDown = true
    const coords = this.getCanvasCoords(e)
    this.x = coords.x
    this.y = coords.y
    const dot = this.grid.getDotAt(this.x, this.y)

    if (this.experiment?.onDown) {
      this.experiment.onDown(this.x, this.y, dot)
    }
  }

  handleUp(e) {
    this.isDown = false
    const dot = this.grid.getDotAt(this.x, this.y)

    if (this.experiment?.onUp) {
      this.experiment.onUp(this.x, this.y, dot)
    }
  }

  setupListeners() {
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e))
    this.canvas.addEventListener('mousedown', (e) => this.handleDown(e))
    this.canvas.addEventListener('mouseup', (e) => this.handleUp(e))
    this.canvas.addEventListener('mouseleave', () => {
      if (this.hoveredDot && this.experiment?.onLeaveDot) {
        this.experiment.onLeaveDot(this.hoveredDot)
      }
      this.hoveredDot = null
      if (this.experiment?.onLeaveCanvas) {
        this.experiment.onLeaveCanvas()
      }
    })

    this.canvas.addEventListener('mouseenter', () => {
      if (this.experiment?.onEnterCanvas) {
        this.experiment.onEnterCanvas()
      }
    })

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      this.handleDown(e)
    }, { passive: false })

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      this.handleMove(e)
    }, { passive: false })

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      this.handleUp(e)
    }, { passive: false })
  }
}
