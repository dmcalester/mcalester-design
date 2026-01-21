import { distance } from './utils.js'

export class Grid {
  constructor(config = {}) {
    this.cols = config.cols ?? 20
    this.rows = config.rows ?? 20
    this.dotRadius = config.dotRadius ?? 2
    this.spacing = config.spacing ?? 20
    this.baseOpacity = config.baseOpacity ?? 0.15
    this.activeOpacity = config.activeOpacity ?? 1.0
    this.color = config.color ?? '#ffffff'

    this.dots = []
    this.width = 0
    this.height = 0
    this.offsetX = 0
    this.offsetY = 0
  }

  generate(canvasWidth, canvasHeight) {
    this.width = canvasWidth
    this.height = canvasHeight
    this.dots = []

    // Grid starts at origin, uses spacing from config
    this.offsetX = 0
    this.offsetY = 0

    // Calculate cols/rows to fill canvas (dots at 0 and at edge)
    this.cols = Math.floor(canvasWidth / this.spacing) + 1
    this.rows = Math.floor(canvasHeight / this.spacing) + 1

    let id = 0
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.dots.push({
          id: id++,
          col,
          row,
          x: this.offsetX + col * this.spacing,
          y: this.offsetY + row * this.spacing,
          radius: this.dotRadius,
          baseRadius: this.dotRadius,
          opacity: this.baseOpacity,
          active: false,
          data: {}
        })
      }
    }

    return this
  }

  getDotAt(x, y, threshold = null) {
    const hitRadius = threshold ?? this.spacing / 2
    for (const dot of this.dots) {
      // Skip invisible origin dot
      if (dot.col === 0 && dot.row === 0) continue
      if (distance(x, y, dot.x, dot.y) <= hitRadius) {
        return dot
      }
    }
    return null
  }

  getDotByCoords(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null
    }
    return this.dots[row * this.cols + col]
  }

  getNeighbors(dot, diagonal = false) {
    const neighbors = []
    const offsets = [
      [0, -1], [1, 0], [0, 1], [-1, 0]
    ]
    if (diagonal) {
      offsets.push([-1, -1], [1, -1], [1, 1], [-1, 1])
    }

    for (const [dx, dy] of offsets) {
      const neighbor = this.getDotByCoords(dot.col + dx, dot.row + dy)
      if (neighbor) neighbors.push(neighbor)
    }

    return neighbors
  }

  reset() {
    for (const dot of this.dots) {
      dot.radius = dot.baseRadius
      dot.opacity = this.baseOpacity
      dot.active = false
      dot.color = null
      dot.data = {}
    }
  }

  draw(ctx) {
    for (const dot of this.dots) {
      // Skip dot at origin (0,0)
      if (dot.col === 0 && dot.row === 0) continue

      ctx.beginPath()
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
      ctx.fillStyle = dot.color || this.color
      ctx.globalAlpha = dot.opacity
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}
