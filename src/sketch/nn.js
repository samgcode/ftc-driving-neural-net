import * as tf from '@tensorflow/tfjs'

class NeuralNetwork {
  constructor(a, b, c, model) {
    this.input_nodes = a
    this.hidden_nodes = b
    this.output_nodes = c
    if(model) {
      this.model = model
    } else {
      this.model = this.createModel()
    }
  }

  createModel() {
    const model = tf.sequential()

    const hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'sigmoid'
    })
    model.add(hidden)

    model.add(tf.layers.dense({
      units: this.hidden_nodes,
      activation: 'sigmoid'
    }))

    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'sigmoid'
    })
    model.add(output)

    return model
  }

  dispose() {
    this.model.dispose()
  }

  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel()
      const weights = this.model.getWeights()
      const weightCopies = []
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone()
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes,
        modelCopy
      )
    })
  }

  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights()
      const mutatedWeights = []
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i]
        let shape = weights[i].shape
        let values = tensor.dataSync().slice()
        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            let w = values[j]
            values[j] = w + randomGaussian()
          }
        }
        let newTensor = tf.tensor(values, shape)
        mutatedWeights[i] = newTensor
      }
      this.model.setWeights(mutatedWeights)
    })
  }

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs])
      const ys = this.model.predict(xs)
      const outputs = ys.dataSync()
      return outputs;
    })
  }
}

export default NeuralNetwork

//https://www.youtube.com/watch?v=cdUNkwXx-I4&list=PLRqwX-V7Uu6Yd3975YwxrR0x40XGJ_KGO&index=8
//https://js.tensorflow.org/api/3.9.0/