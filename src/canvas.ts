import CanvasService, { Canvas, CanvasRenderingContext2D } from '@koishijs/canvas'

class CanvasInstance implements Canvas {
  #canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas
  }

  get width() {
    return this.#canvas.width
  }

  get height() {
    return this.#canvas.height
  }

  getContext(type: '2d') {
    return this.#canvas.getContext(type) as unknown as CanvasRenderingContext2D
  }

  async toDataURL() {
    return this.#canvas.toDataURL()
  }

  async toBuffer() {
    const dataURL = this.#canvas.toDataURL()
    return Buffer.from(dataURL.slice(dataURL.indexOf(',') + 1), 'base64')
  }

  async dispose() {}
}

export default class extends CanvasService {
  async createCanvas(width: number, height: number): Promise<Canvas> {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return new CanvasInstance(canvas)
  }
}
