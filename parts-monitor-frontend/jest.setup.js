import '@testing-library/jest-dom'

const { TextEncoder, TextDecoder } = require('util')
const { Blob, File } = require('buffer')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.Blob = Blob
global.File = File

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
})

HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: (x, y, w, h) => ({
    data: new Array(w * h * 4),
    width: w,
    height: h,
  }),
  putImageData: () => {},
})

HTMLCanvasElement.prototype.toDataURL = () => ''
