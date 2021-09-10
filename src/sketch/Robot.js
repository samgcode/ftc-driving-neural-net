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
    this.fitness = 0
    this.targetPos = targetPos

    this.lifeSpan = 0
    this.spins = 0

    if (brain) {
      this.brain = brain.copy()
    } else {
      this.brain = new NeuralNetwork(6, 15, 3)
    }
  }

  dispose() {
    this.brain.dispose()
  }

  mutate() {
    this.brain.mutate(0.1)
  }

  update(draw) {
    this.lifeSpan++

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

    if(this.h > 270 || this.h < -270) {
      this.spins++
    }
  }

  dispose() {
    this.brain.dispose()
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
    const acceptableError = 2

    const xDist = Math.abs(this.targetPos.x - this.x)
    const yDist = Math.abs(this.targetPos.y - this.y)
    let hDist = Math.abs(this.targetPos.h - this.h)

    const dist = new Vector(xDist, yDist)
    
    if(Math.abs(hDist) > 180) {
      hDist = -(hDist - 180)
    }

    const baseFitness = (dist.magSq() + hDist) / 1000
    const rotationFitness = hDist + this.spins*5

    let speedFitness = 0

    const velocity = new Vector(this.xSpeed, this.ySpeed)
    if(baseFitness < acceptableError) {
      speedFitness = velocity.magSq() + this.rotSpeed
    } else {
      speedFitness = -(velocity.magSq() + this.rotSpeed)
    }

    return Math.abs(baseFitness + rotationFitness + speedFitness)

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