export class Experiment {
  static title = 'Unnamed'
  static description = ''

  constructor(grid, renderer) {
    this.grid = grid
    this.renderer = renderer
  }

  // Lifecycle - called once on mount
  setup() {}

  // Lifecycle - called on unmount, cleanup
  teardown() {}

  // Per-frame logic/state update
  update(deltaTime) {}

  // Render on top of grid
  draw(ctx) {}

  // Input handlers - optional overrides
  onMove(x, y, dot) {}
  onDown(x, y, dot) {}
  onUp(x, y, dot) {}
  onEnterDot(dot) {}
  onLeaveDot(dot) {}
}
