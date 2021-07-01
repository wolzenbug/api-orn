
import canvasInstance from "../canvas.js";
import config from "../config.js";

// source: https://www.kaggle.com/crawford/emnist?select=emnist-byclass-mapping.txt
// Outsource for different models
const EMNIST_MAP = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b',
  'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
  's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];

const ARITHMETIC_MAP = ['+','-','*','/','%','++','--']

let map = [];

let worker;

function employWorker(data, callback) {
  if (window.Worker) {
    if (!worker) {
      worker = new Worker('./static/js/tensorflow/worker.js');
    }

    worker.onmessage = function (e) {
      console.log('Message received from worker', e);
      callback(e.data);
    }

    worker.postMessage({ data, map, path: config.modelPaths[lang] });
    console.log('Message posted to worker', data);
  }
}

export async function loadModel() {

  switch (lang) {
    case 'latin':
      map = EMNIST_MAP;
      break;
    case 'arithmetic':
      map = ARITHMETIC_MAP;
      break;
    default:
      break;
  }
  
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

  employWorker(imgData, callback);
}

export function getRandomChar() {
  return map[Math.floor((Math.random() * map.length))]
}