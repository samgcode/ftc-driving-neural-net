import NeuralNetwork from './nn'
import { size } from './constants'
import { Vector } from 'p5'

class Robot {
  constructor({ targetPos, brain }) {
    this.x = 500
    this.y = 500
    this.h = 0
    this.xSpeed = 0
    this.ySpeed = 0
    this.rotSpeed = 0
    this.targetPos = targetPos
    this.fitness = 0
    this.lifeSpan = 0
    if (brain) {
      this.brain = brain.copy()
    } else {
      this.brain = new NeuralNetwork(6, 8, 3)
    }
  }

  dispose() {
    this.brain.dispose()
  }

  mutate() {
    this.brain.mutate(0.1)
  }

  update(draw) {
    this.lifeSpan += 1

    let inputs = []
    inputs[0] = this.x
    inputs[1] = this.y
    inputs[2] = this.h
    inputs[3] = this.targetPos.x
    inputs[4] = this.targetPos.y
    inputs[5] = this.targetPos.h

    const output = this.brain.predict(inputs)
    // console.log(output)


    this.xSpeed = map(output[0], 0, 1, -1, 1)
    this.ySpeed = map(output[1], 0, 1, -1, 1)
    this.rotSpeed = map(output[2], 0, 1, -1, 1)

    this.updateMotors()
    if(draw) {
      this.drawRobot(this.x, this.y, this.h)
    }
  }

  updateMotors() {
    this.x += this.xSpeed
    this.y += this.ySpeed
    this.h += this.rotSpeed
  }

  drawRobot(x, y, h, size=100) {
    push()
    translate(x, width - y)
    rotate(-h)
    square(-size / 2, -size / 2, size)
    stroke('red')
    line(0, -size / 1.2, 0, 0)
    pop()
  }

  getFitness() {
    const acceptableError = 1

    const xDist = this.targetPos.x - this.x
    const yDist = this.targetPos.y - this.y
    let hDist = this.targetPos.h - this.h

    const dist = new Vector(xDist, yDist)

    if(Math.abs(hDist) > 180) {
      hDist = -(hDist - 180)
    }

    let error = (dist.magSq() + hDist) / 10000

    if(error < acceptableError) {
      const velocity = new Vector(this.xSpeed, this.ySpeed, this.rotSpeed)
      error += velocity.mag()
    }

    return error
  }
}

export default Robot

/*
inputs:

x pos
y pos
heading
target x
target y
target h

outputs:

x speed
y speed
rot speed
*/



/*
does it get to the target
 /                  \
yes                 no
 |                   |
how long          how close is it
does it take
  |
does it slow
down when it gets there
  |
is it still spinning


*/