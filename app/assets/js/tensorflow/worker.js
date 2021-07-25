

importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js');

let model;

onmessage = function (e) {
  const { data, map, path } = e.data;

  predict(data, map, path)
    .then((res) => {
      postMessage(res);
    })
    .catch((err) => {
      console.error(err);
      postMessage(err)
    })
}


async function predict(data, map, path) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!model) model = await tf.loadLayersModel(path);
    } catch (error) {
      reject(error);
    }

    const x = tf.tensor(data)
    const example = tf.reshape(x, [-1, 28, 28, 1]);

    const prediction = model.predict(example)

    prediction.data()
      .then((flattenedPrediction) => {
        const i = flattenedPrediction.indexOf(Math.max(...flattenedPrediction));
        const predictedScore = flattenedPrediction[i];
        const predictedResult = map[i];

        resolve({ predictedScore, predictedResult });
      })
      .catch((err) => {
        reject(err);
      });
  })
}