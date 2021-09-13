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
    this.acceptableError = 2
    this.generation = 0
  }

  setup() {
    createCanvas(width, width)
    frameRate(50)

    this.targetPos = {
      x: random(100, width - 100),
      y: random(100, width - 100),
      h: random(0, 360)
    }
    this.bots = []
    for (let i = 0; i < populationSize; i++) {
      const robot = new Robot({ targetPos: this.targetPos, id: this.currentId })
      robot.targetPos = this.targetPos
      this.bots.push(robot)
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
    if (frameCount % 600 === 0) {
      this.newGeneration()
    }

    this.drawText()
  }
  
  drawText() {
    fill('white')
    textSize(20)
    text(`Generation: ${this.generation}`, 700, 900)
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
    this.generation++
    const bestBots = this.getBestBots()
    console.log(bestBots)

    this.targetPos = {
      x: this.targetPos.x+random(-50, 50),
      y: this.targetPos.y+random(-50, 50),
      h: this.targetPos.h+random(-50, 50),
    }

    bestBots.forEach(bot => {
      const child = new Robot({ targetPos: this.targetPos, brain: bot.brain, id: this.currentId })
      this.currentId++
      child.mutate(mutationRate)
      child.targetPos = this.targetPos
      this.bots.push(child)
    })

    this.bots.forEach(bot => {
      bot.x = 500
      bot.y = 500
      bot.h = 0
      bot.lifeSpan = 0
      bot.spins = 0
      bot.targetPos = this.targetPos
    })
  }

  getBestBots() {
    let totalFitness = 0
    this.bots.forEach(bot => { 
      bot.fitness = bot.getFitness({posWeight:50, rotationWeight:1, speedWeight:50, lifeSpanWeight:1, targetTimeWeight:10})
      totalFitness += bot.fitness
    })
    this.bots.forEach(bot => {
      bot.fitness = bot.fitness/totalFitness
    })



    this.bots = this.bots.sort((a, b) => { return b.fitness - a.fitness })

    // console.log(this.bots)
    this.bots.forEach(bot => {
      console.log(`bot: ${bot.id}, fitness: ${bot.fitness}`)
    })

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
