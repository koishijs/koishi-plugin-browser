import CanvasService, { Canvas, Image } from '@koishijs/canvas'
import { base64ToArrayBuffer } from 'koishi'

const kElement = Symbol('canvas')

class CanvasElement implements Canvas {
  [kElement]: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this[kElement] = canvas
  }

  get width() {
    return this[kElement].width
  }

  get height() {
    return this[kElement].height
  }

  getContext(type: '2d') {
    const target = this[kElement].getContext(type) as any
    return new Proxy(target, {
      get(target, prop, receiver) {
        if (prop === 'drawImage') {
          return new Proxy(target[prop], {
            apply(target, thisArg, [image, ...rest]) {
              if (image[kElement]) image = image[kElement]
              return target.call(thisArg, image, ...rest)
            },
          })
        }
        return Reflect.get(target, prop, receiver)
      },
    })
  }

  async toDataURL() {
    return this[kElement].toDataURL()
  }

  async toBuffer() {
    const dataURL = this[kElement].toDataURL()
    return Buffer.from(dataURL.slice(dataURL.indexOf(',') + 1), 'base64')
  }

  async dispose() {}
}

class ImageElement implements Image {
  [kElement]: HTMLImageElement

  constructor(image: HTMLImageElement) {
    this[kElement] = image
  }

  get naturalWidth() {
    return this[kElement].naturalWidth
  }

  get naturalHeight() {
    return this[kElement].naturalHeight
  }

  async dispose() {}
}

export default class extends CanvasService {
  async createCanvas(width: number, height: number): Promise<Canvas> {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return new CanvasElement(canvas)
  }

  async loadImage(source: string | URL | Buffer | ArrayBufferLike) {
    const image = document.createElement('img')
    if (typeof source === 'string' || source instanceof URL) {
      image.src = source.toString()
    } else {
      if (Buffer.isBuffer(source)) {
        source = base64ToArrayBuffer(source.toString('base64'))
      }
      const blob = new Blob([source])
      image.src = URL.createObjectURL(blob)
    }
    return new Promise<ImageElement>((resolve, reject) => {
      image.onload = () => resolve(new ImageElement(image))
      image.onerror = reject
    })
  }
}
