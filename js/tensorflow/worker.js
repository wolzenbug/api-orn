

importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js');

const emnistMap = [
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73,
  74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98,
  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
  115, 116, 117, 118, 119, 120, 121, 122,
];

let model;

onmessage = function (e) {
  predict(e.data)
    .then((res) => {
      console.log('Posting message back to main script');
      postMessage(res);
    })
    .catch((err) => {
      console.error(err);
      postMessage(err)
    })
}


async function predict(data) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!model) model = await tf.loadLayersModel('./model_emnist/model.json');
    } catch (error) {
      reject(error);
    }

    const x = tf.tensor(data)
    const example = tf.reshape(x, [-1, 28, 28, 1]);

    const prediction = model.predict(example)

    prediction.data()
      .then((flattenedPrediction) => {
        console.log(flattenedPrediction);

        const i = flattenedPrediction.indexOf(Math.max(...flattenedPrediction));
        const predictedScore = flattenedPrediction[i];
        const predictedResult = String.fromCharCode(emnistMap[i]);

        resolve({ predictedScore, predictedResult });
      })
      .catch((err) => {
        reject(err);
      });
  })
}