import Sketch from './Sketch'

const sketch = new Sketch()

export function setup() {
  sketch.setup()
}

export function draw() {
  sketch.update()
}

export function mousePressed() {
  sketch.mouseClicked()
}