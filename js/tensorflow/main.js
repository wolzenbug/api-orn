// source: https://www.kaggle.com/crawford/emnist?select=emnist-byclass-mapping.txt
// Outsource for different models
const emnistMap = [
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73,
  74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98,
  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
  115, 116, 117, 118, 119, 120, 121, 122,
];

let model;

function getScaledData(canvas, scaleFactor) {
  // https://stackoverflow.com/a/51348478/6783713
  // const m = document
  //   .createElementNS('http://www.w3.org/2000/svg', 'svg')
  //   .createSVGMatrix();
  // const p = new Path2D();
  // const t = m.scale(0.1);
  // p.addPath(currPath, t);
  // ctxResized.lineCap = l;
  // ctxResized.lineWidth = 2;
  // ctxResized.stroke(p);

  const copy = document.createElement('canvas');
  const copyContext = copy.getContext('2d');

  copy.width = canvas.width;
  copy.height = canvas.height;

  copyContext.scale(scaleFactor, scaleFactor);
  copyContext.drawImage(canvas, 0, 0);

  const canResizedContext = document.getElementById('can-resized').getContext('2d');
  canResizedContext.drawImage(copy, 0, 0);

  copyContext.drawImage

  return copyContext.getImageData(
    0,
    0,
    28,
    28
  );;
}

function normalize(array) {
  const normalizedArray = [];
  for (let i = 0; i < array.length; i++) {
    normalizedArray.push(array[i] / 255);
  }
  return normalizedArray;
}

export async function loadModel() {
  model = await tf.loadLayersModel('./js/tensorflow/model_emnist/model.json');

  console.log(model);
}

export async function predictModel(canvas) {
  return new Promise((resolve, reject) => {
    const imgData = getScaledData(canvas, 0.1);

    console.log("IMAGE DATA", imgData);

    const alphaFilteredData = imgData.data.filter((d, i) => (i + 1) % 4 === 0);

    const values = normalize(Uint8Array.from(alphaFilteredData));

    // console.log('values', values);
    const x = tf.tensor(values);
    // console.log('x', x);

    const example = tf.reshape(x, [-1, 28, 28, 1]);
    // console.log(`example`, example);

    const prediction = model.predict(example);
    // console.log(`prediction`, prediction);

    prediction.print();

    const flattenedPrediction = prediction.dataSync();
    console.log(flattenedPrediction);

    const i = flattenedPrediction.indexOf(Math.max(...flattenedPrediction));
    const predictedScore = flattenedPrediction[i];
    const predictedResult = String.fromCharCode(emnistMap[i]);

    resolve({ predictedScore, predictedResult });
  });
}

export function getMap() {
  return emnistMap;
}

export function getRandomChar() {
  return String.fromCharCode(
    emnistMap[Math.floor((Math.random()*emnistMap.length))]
  );
}