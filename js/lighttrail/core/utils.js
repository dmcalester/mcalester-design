// Easing functions
export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const easeOutElastic = (t) => {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export const easeInOutQuad = (t) => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export const easeOutQuad = (t) => {
  return 1 - (1 - t) * (1 - t)
}

// Math utilities
export const lerp = (a, b, t) => a + (b - a) * t

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

export const distance = (x1, y1, x2, y2) => {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

export const mapRange = (val, inMin, inMax, outMin, outMax) => {
  return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}

export const pointInPolygon = (x, y, vertices) => {
  let inside = false
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y
    const xj = vertices[j].x, yj = vertices[j].y
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

// Geometry
export const rotatePoint = (x, y, cx, cy, angle) => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = x - cx
  const dy = y - cy
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos
  }
}

export const projectTo2D = (x, y, z, fov = 500, centerX = 0, centerY = 0) => {
  const scale = fov / (fov + z)
  return {
    x: x * scale + centerX,
    y: y * scale + centerY,
    scale
  }
}

// Color utilities

// Resolve CSS color value (handles light-dark(), color-mix(), etc.) for canvas use
export const resolveCssColor = (cssValue) => {
  const testEl = document.createElement('div')
  testEl.style.color = cssValue
  testEl.style.display = 'none'
  document.body.appendChild(testEl)
  const computed = getComputedStyle(testEl).color
  document.body.removeChild(testEl)
  return computed
}

export const hslToRgb = (h, s, l) => {
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

export const hslToHex = (h, s, l) => {
  const [r, g, b] = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

// Animation helper
export const createTween = (from, to, duration, easing, onUpdate, onComplete) => {
  const startTime = performance.now()
  let animationId = null
  let stopped = false

  const tick = (now) => {
    if (stopped) return
    const elapsed = now - startTime
    const t = clamp(elapsed / duration, 0, 1)
    const easedT = easing(t)
    const value = lerp(from, to, easedT)
    onUpdate(value, t)
    if (t < 1) {
      animationId = requestAnimationFrame(tick)
    } else if (onComplete) {
      onComplete()
    }
  }

  animationId = requestAnimationFrame(tick)

  return {
    stop: () => {
      stopped = true
      if (animationId) cancelAnimationFrame(animationId)
    }
  }
}

// Debounce utility
export const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
