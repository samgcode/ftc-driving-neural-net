import NeuralNetwork from './nn'
import { size } from './constants'
import { Vector } from 'p5'

class Robot {
  constructor({ brain, id }) {
    this.id = id
    this.x = 500
    this.y = 500
    this.h = 0
    this.xSpeed = 0
    this.ySpeed = 0
    this.rotSpeed = 0
    this.fitness = 0
    this.targetPos = { x: 0, y: 0, h: 0 }

    this.lifeSpan = 0
    this.spins = 0
    this.targetTime = 0
    this.acceptableError = 2

    if (brain) {
      this.brain = brain.copy()
    } else {
      this.brain = new NeuralNetwork(3, 3, 3)
    }
  }

  dispose() {
    this.brain.dispose()
  }

  mutate() {
    this.brain.mutate(0.1)
  }

  update(draw) {
    console.log(this.targetPos)
    this.lifeSpan++

    let inputs = []
    // inputs[0] = this.x
    // inputs[1] = this.y
    // inputs[2] = this.h
    // inputs[3] = this.targetPos.x
    // inputs[4] = this.targetPos.y
    // inputs[5] = this.targetPos.h

    inputs[0] = this.targetPos.x-this.x
    inputs[1] = this.targetPos.y-this.y
    inputs[2] = this.targetPos.h - this.h

    const output = this.brain.predict(inputs)
    // console.log(output)


    this.xSpeed = map(output[0], 0, 1, -1, 1)
    this.ySpeed = map(output[1], 0, 1, -1, 1)
    this.rotSpeed = map(output[2], 0, 1, -1, 1)

    this.updateMotors()
    if(draw) {
      this.drawRobot(this.x, this.y, this.h)
    }

    if(this.h > 220 || this.h < -220) {
      this.spins++
    }

    const xDist = Math.abs(this.targetPos.x - this.x)
    const yDist = Math.abs(this.targetPos.y - this.y)

    const dist = new Vector(xDist, yDist)

    if(dist.magSq() < this.acceptableError) {
      this.targetTime++
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
    const xDist = Math.abs(this.targetPos.x - this.x)
    const yDist = Math.abs(this.targetPos.y - this.y)
    let hDist = Math.abs(this.targetPos.h - this.h)

    const dist = new Vector(xDist, yDist)
    
    if(Math.abs(hDist) > 180) {
      hDist = -(hDist - 180)
    }

    const baseFitness = dist.magSq() / 1000
    const rotationFitness = hDist + this.spins*50

    let speedFitness = 1000
    let lifeSpanFitness = 1000

    const velocity = new Vector(this.xSpeed, this.ySpeed)
    if(baseFitness < this.acceptableError) {
      speedFitness = (velocity.magSq() + this.rotSpeed) * 25
      lifeSpanFitness = this.lifeSpan * 200
    }

    const totalFitness = Math.abs(baseFitness + rotationFitness + speedFitness + lifeSpanFitness) - this.targetTime*10

    console.log(`Total: ${totalFitness}, Base: ${baseFitness}, rotation: ${rotationFitness}, speed: ${speedFitness}, lifespan: ${lifeSpanFitness}`)
    return totalFitness

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