import { width, populationSize, mutationRate } from './constants'
import Robot from './Robot'

class Sketch {
  constructor() {
    this.robotMap = {
      x: 500,
      y: 500,
      heading: 0,
      xSpeed: 0,
      ySpeed: 0,
      rotationSpeed: 0
    }

    this.targetPos = {
      x: 0,
      y: 0,
      h: 0
    }
    this.draw = false
    this.currentId = 0
  }

  setup() {
    createCanvas(width, width)
    frameRate(50)

    this.targetPos = {
      x: random(30, width - 30),
      y: random(30, width - 30),
      h: random(0, 360)
    }
    this.bots = []
    for (let i = 0; i < populationSize; i++) {
      this.bots.push(new Robot({ targetPos: this.targetPos, id: this.currentId }))
      this.currentId++
    }

    const button = createButton('Toggle draw')
    button.position(0, 1000)
    button.mousePressed(() => {
      this.draw = !this.draw
    })
  }

  update() {
    background(0)
    stroke(255)
    angleMode(DEGREES)

    this.drawRobots()

    stroke('green')
    this.drawTargetPos(this.targetPos.x - 2.5, this.targetPos.y - 2.5, this.targetPos.h, 10)

    if(frameCount % 50 === 0) {
      console.log('frame: ', frameCount)
    }
    if (frameCount % 500 === 0) {
      this.newGeneration()
    }
  }

  drawTargetPos(x, y, h, size = 100) {
    push()
    translate(x, width - y)
    rotate(-h)
    square(-size / 2, -size / 2, size)
    stroke('red')
    line(0, -size / 1.2, 0, 0)
    pop()
  }

  drawRobots() {
    this.bots.forEach(robot => {
      robot.update(this.draw)
    })
  }

  newGeneration() {
    const bestBots = this.getBestBots()
    console.log(bestBots)

    bestBots.forEach(bot => {
      const child = new Robot({ targetPos: this.targetPos, brain: bot.brain, id: this.currentId })
      this.currentId++
      child.mutate(mutationRate)
      this.bots.push(child)
    })

    this.bots.forEach(bot => {
      bot.x = 500
      bot.y = 500
      bot.h = 0
      bot.lifeSpan = 0
      bot.spins = 0
    })
  }

  getBestBots() {
    this.bots.forEach(bot => { bot.fitness = bot.getFitness() })
    this.bots = this.bots.sort((a, b) => { return b.fitness - a.fitness })

    console.log(this.bots)

    for(let i = 0; i < this.bots.length/2; i++) {
      this.bots[i].dispose()
    }
    this.bots = this.bots.slice(this.bots.length / 2)
    return this.bots
  }

  mouseClicked() {
    // this.newGeneration()
  }
}

export default Sketch
