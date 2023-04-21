let mobilenet
let model
const webcam = new Webcam(document.getElementById('wc'))
const dataset = new RPSDataset()
var class1 = 0,
  class2 = 0,
  class3 = 0,
  class4 = 0,
  class5 = 0,
  class6 = 0,
  class7 = 0
let isPredicting = false

async function loadMobilenet() {
  const mobilenet = await tf.loadLayersModel(
    'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json'
  )
  const layer = mobilenet.getLayer('conv_pw_13_relu')
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output })
}

async function train() {
  dataset.ys = null
  dataset.encodeLabels(7)

  model = tf.sequential({
    layers: [
      tf.layers.flatten({ inputShape: mobilenet.outputs[0].shape.slice(1) }),
      tf.layers.dense({ units: 100, activation: 'relu' }),
      tf.layers.dense({ units: 5, activation: 'softmax' })
    ]
  })

  const optimizer = tf.train.adam(0.00001)

  model.compile({ optimizer: optimizer, loss: 'categoricalCrossentropy' })

  let loss = 0
  model.fit(dataset.xs, dataset.ys, {
    epochs: 10,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        loss = logs.loss.toFixed(7)
        console.log('LOSS: ' + loss)
      }
    }
  })
}

function handleButton(elem) {
  switch (elem.id) {
    case '0':
      class1++
      document.getElementById('class1samples').innerText =
        class1
      break
    case '1':
      class2++
      document.getElementById('class2samples').innerText =
       class2
      break
    case '2':
      class3++
      document.getElementById('class3samples').innerText =
        class3
      break
    case '3':
      class4++
      document.getElementById('class4samples').innerText =
       class4
      break

    case '4':
      class5++
      document.getElementById('class5samples').innerText =
        class5
      break
      
    case '5':
      class6++
      document.getElementById('class6samples').innerText =
        class6
      break      
      
    case '6':
      class7++
      document.getElementById('class7samples').innerText =
        class7
      break
  }
  label = parseInt(elem.id)
  const img = webcam.capture()
  dataset.addExample(mobilenet.predict(img), label)
}

async function predict() {
  while (isPredicting) {
    const predictedClass = tf.tidy(() => {
      const img = webcam.capture()
      const activation = mobilenet.predict(img)
      const predictions = model.predict(activation)
      return predictions.as1D().argMax()
    })
    const classId = (await predictedClass.data())[0]
    var predictionText = ''
    switch (classId) {
      case 0:
        predictionText = 'Normal (Neutral) People'
        break
      case 1:
        predictionText = 'Happy People'
        break
      case 2:
        predictionText = 'Sad People'
        break
      case 3:
        predictionText = 'Angry People'
        break

      case 4:
        predictionText = 'Surprised People'
        break
        
      case 5:
        predictionText = 'Feared People'
        break
        
      case 6:
        predictionText = 'Disgusted People'
        break
    }
    document.getElementById('prediction').innerText = predictionText

    predictedClass.dispose()
    await tf.nextFrame()
  }
}

function doTraining() {
  train()
  alert('Training Done!')
}

function startPredicting() {
  isPredicting = true
  predict()
}

function stopPredicting() {
  isPredicting = false
  predict()
}

//<script src="https://apis.google.com/js/platform.js" async defer></script>
//<div class="g-savetodrive"
//   data-src="https://drive.google.com/drive/u/0/folders/1NhoYZFmCeLAMetJbKwTUfVvScjRxSJYn"
//   data-filename="My Statement.pdf"
//   data-sitename="My Company Name">
//</div>

//function saveModel() {
//  model.save('https://drive.google.com/drive/folders/1NhoYZFmCeLAMetJbKwTUfVvScjRxSJYn?usp=sharing')
}

async function init() {
  await webcam.setup()
  mobilenet = await loadMobilenet()
  tf.tidy(() => mobilenet.predict(webcam.capture()))
}

init()