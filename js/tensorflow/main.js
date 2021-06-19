
import canvasInstance from "../canvas.js";

// source: https://www.kaggle.com/crawford/emnist?select=emnist-byclass-mapping.txt
// Outsource for different models
const emnistMap = [
  48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73,
  74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98,
  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
  115, 116, 117, 118, 119, 120, 121, 122,
];

let worker;

function normalize(array) {
  const normalizedArray = [];
  for (let i = 0; i < array.length; i++) {
    normalizedArray.push(array[i] / 255);
  }
  return normalizedArray;
}

function employWorker(data, callback) {
  if (window.Worker) {
    if (!worker) {
      worker = new Worker('./js/tensorflow/worker.js');
    }

    worker.onmessage = function (e) {
      console.log('Message received from worker', e);
      callback(e.data);
    }

    worker.postMessage(data);
    console.log('Message posted to worker', data);
  }
}

export async function loadModel() {
  let initPredict = [];

  const N = 784;
  for (let i = 1; i <= N; i++) {
    initPredict.push(0);
  }
  const callback = (e) => console.log("Initialized Model.")

  employWorker(initPredict, callback);
}

export function predictModel(canvas, callback) {
  const imgData = canvasInstance.getScaledData(0.1);
  const alphaFilteredData = imgData.data.filter((d, i) => (i + 1) % 4 === 0);
  const values = normalize(Uint8Array.from(alphaFilteredData));

  employWorker(values, callback);
}

export function getMap() {
  return emnistMap;
}

export function getRandomChar() {
  return String.fromCharCode(
    emnistMap[Math.floor((Math.random() * emnistMap.length))]
  );
}